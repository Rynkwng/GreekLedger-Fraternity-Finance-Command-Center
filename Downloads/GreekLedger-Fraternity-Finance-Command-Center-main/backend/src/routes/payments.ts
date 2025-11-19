import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all payments
router.get('/', async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { member: true },
      orderBy: { paymentDate: 'desc' },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payments by member
router.get('/member/:memberId', async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { memberId: req.params.memberId },
      orderBy: { paymentDate: 'desc' },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Create payment
router.post('/', async (req: Request, res: Response) => {
  try {
    const { memberId, amount, semester, notes, lateFee } = req.body;
    
    // Create payment
    const payment = await prisma.payment.create({
      data: {
        memberId,
        amount,
        semester,
        notes,
        lateFee: lateFee || 0,
      },
    });
    
    // Update member's dues
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });
    
    if (member) {
      await prisma.member.update({
        where: { id: memberId },
        data: {
          duesPaid: member.duesPaid + amount,
          outstandingBalance: Math.max(0, member.duesOwed - (member.duesPaid + amount)),
        },
      });
    }
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Update payment
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// Delete payment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
    });
    
    if (payment) {
      // Update member's dues before deleting
      const member = await prisma.member.findUnique({
        where: { id: payment.memberId },
      });
      
      if (member) {
        await prisma.member.update({
          where: { id: payment.memberId },
          data: {
            duesPaid: Math.max(0, member.duesPaid - payment.amount),
            outstandingBalance: member.outstandingBalance + payment.amount,
          },
        });
      }
      
      await prisma.payment.delete({
        where: { id: req.params.id },
      });
    }
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

export default router;

