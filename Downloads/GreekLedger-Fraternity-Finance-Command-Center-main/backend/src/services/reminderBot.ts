import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendEmailNotification, sendDiscordNotification } from './notifications';
import { sendBulkPaymentReminders } from './sms';

const prisma = new PrismaClient();

export function startReminderBot() {
  console.log('🤖 Starting automated reminder bot...');
  
  // Run every Monday at 9 AM
  cron.schedule('0 9 * * 1', async () => {
    console.log('🔔 Running weekly payment reminders...');
    await sendPaymentReminders();
  });
  
  // Run daily at 10 AM to check for low reserves
  cron.schedule('0 10 * * *', async () => {
    console.log('💰 Checking reserve levels...');
    await checkReserveLevels();
  });
  
  console.log('✅ Reminder bot started successfully');
}

async function sendPaymentReminders() {
  try {
    const settings = await prisma.chapterSettings.findFirst();
    
    if (!settings?.emailEnabled && !settings?.discordEnabled) {
      console.log('⚠️ No notification methods enabled');
      return;
    }
    
    // Find members with outstanding balances
    const membersWithBalance = await prisma.member.findMany({
      where: {
        status: 'ACTIVE',
        outstandingBalance: { gt: 0 },
      },
    });
    
    console.log(`📧 Sending reminders to ${membersWithBalance.length} members...`);
    
    for (const member of membersWithBalance) {
      const subject = '💰 Payment Reminder: Outstanding Dues';
      const message = `Hi ${member.firstName},\n\nThis is your weekly reminder that you have an outstanding balance of $${member.outstandingBalance.toFixed(2)}.\n\nPlease make your payment as soon as possible.\n\nThank you!`;
      
      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          type: 'PAYMENT_REMINDER',
          recipientId: member.id,
          subject,
          message,
        },
      });
      
      try {
        // Send email
        if (settings?.emailEnabled && member.email) {
          await sendEmailNotification(member.email, subject, message);
        }
        
        // Update status
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });
      } catch (error) {
        console.error(`Failed to send reminder to ${member.email}:`, error);
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'FAILED' },
        });
      }
    }
    
    // Send SMS reminders if Twilio is configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      console.log('📱 Sending SMS reminders...');
      const smsResults = await sendBulkPaymentReminders();
      console.log(`SMS sent: ${smsResults.sent}, failed: ${smsResults.failed}`);
    }
    
    // Send Discord summary
    if (settings?.discordEnabled && membersWithBalance.length > 0) {
      const totalOutstanding = membersWithBalance.reduce(
        (sum, m) => sum + m.outstandingBalance,
        0
      );
      
      const discordMessage = `📊 **Weekly Dues Update**\n\n` +
        `${membersWithBalance.length} members have outstanding balances\n` +
        `Total outstanding: $${totalOutstanding.toFixed(2)}\n\n` +
        `Payment reminders have been sent via email and SMS! 💸`;
      
      await sendDiscordNotification(discordMessage);
    }
    
    console.log('✅ Payment reminders sent successfully');
  } catch (error) {
    console.error('❌ Failed to send payment reminders:', error);
  }
}

async function checkReserveLevels() {
  try {
    const settings = await prisma.chapterSettings.findFirst();
    
    if (!settings) return;
    
    // Calculate current balance
    const totalPayments = await prisma.payment.aggregate({
      _sum: { amount: true },
    });
    
    const totalReimbursements = await prisma.reimbursement.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    });
    
    const totalEventExpenses = await prisma.eventExpense.aggregate({
      _sum: { amount: true },
    });
    
    const currentBalance =
      (totalPayments._sum.amount || 0) -
      (totalReimbursements._sum.amount || 0) -
      (totalEventExpenses._sum.amount || 0);
    
    // Check if below threshold
    if (currentBalance < settings.minReserveThreshold) {
      const subject = '⚠️ Low Reserve Alert';
      const message = `**Alert: Reserve Level Below Threshold**\n\n` +
        `Current Balance: $${currentBalance.toFixed(2)}\n` +
        `Minimum Threshold: $${settings.minReserveThreshold.toFixed(2)}\n\n` +
        `Consider reviewing upcoming expenses or collecting outstanding dues.`;
      
      // Create notification
      await prisma.notification.create({
        data: {
          type: 'LOW_RESERVES',
          subject,
          message,
          status: 'SENT',
          sentAt: new Date(),
        },
      });
      
      // Send via Discord
      if (settings.discordEnabled) {
        await sendDiscordNotification(message);
      }
      
      console.log('⚠️ Low reserve alert sent');
    }
  } catch (error) {
    console.error('❌ Failed to check reserve levels:', error);
  }
}

