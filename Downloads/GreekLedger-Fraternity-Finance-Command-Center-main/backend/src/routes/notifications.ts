import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendEmailNotification, sendDiscordNotification } from '../services/notifications';

const router = Router();
const prisma = new PrismaClient();

// Get all notifications
router.get('/', async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Send payment reminder to member
router.post('/send-reminder/:memberId', async (req: Request, res: Response) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.memberId },
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    if (member.outstandingBalance <= 0) {
      return res.status(400).json({ error: 'Member has no outstanding balance' });
    }
    
    const subject = 'Payment Reminder: Outstanding Dues';
    const message = `Hi ${member.firstName},\n\nThis is a friendly reminder that you have an outstanding balance of $${member.outstandingBalance.toFixed(2)}.\n\nPlease make your payment at your earliest convenience.\n\nThank you!`;
    
    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        type: 'PAYMENT_REMINDER',
        recipientId: member.id,
        subject,
        message,
      },
    });
    
    // Send via email and/or Discord
    const settings = await prisma.chapterSettings.findFirst();
    
    if (settings?.emailEnabled) {
      await sendEmailNotification(member.email, subject, message);
    }
    
    if (settings?.discordEnabled) {
      await sendDiscordNotification(message);
    }
    
    // Update notification status
    await prisma.notification.update({
      where: { id: notification.id },
      data: { 
        status: 'SENT',
        sentAt: new Date(),
      },
    });
    
    res.json({ message: 'Reminder sent successfully', notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

// Send bulk reminders
router.post('/send-bulk-reminders', async (req: Request, res: Response) => {
  try {
    const members = await prisma.member.findMany({
      where: {
        status: 'ACTIVE',
        outstandingBalance: { gt: 0 },
      },
    });
    
    const results = [];
    
    for (const member of members) {
      const subject = 'Payment Reminder: Outstanding Dues';
      const message = `Hi ${member.firstName},\n\nThis is a friendly reminder that you have an outstanding balance of $${member.outstandingBalance.toFixed(2)}.\n\nPlease make your payment at your earliest convenience.\n\nThank you!`;
      
      const notification = await prisma.notification.create({
        data: {
          type: 'PAYMENT_REMINDER',
          recipientId: member.id,
          subject,
          message,
        },
      });
      
      try {
        const settings = await prisma.chapterSettings.findFirst();
        
        if (settings?.emailEnabled) {
          await sendEmailNotification(member.email, subject, message);
        }
        
        await prisma.notification.update({
          where: { id: notification.id },
          data: { 
            status: 'SENT',
            sentAt: new Date(),
          },
        });
        
        results.push({ memberId: member.id, status: 'sent' });
      } catch (error) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'FAILED' },
        });
        
        results.push({ memberId: member.id, status: 'failed' });
      }
    }
    
    res.json({ 
      message: `Sent ${results.filter(r => r.status === 'sent').length} of ${results.length} reminders`,
      results,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send bulk reminders' });
  }
});

export default router;

