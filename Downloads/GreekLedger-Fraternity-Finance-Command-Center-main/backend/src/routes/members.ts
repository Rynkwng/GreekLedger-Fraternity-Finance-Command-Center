import { Router, Request, Response } from 'express';
import { PrismaClient, MemberStatus } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all members
router.get('/', async (req: Request, res: Response) => {
  try {
    const members = await prisma.member.findMany({
      include: {
        payments: true,
        reimbursements: true,
      },
      orderBy: { lastName: 'asc' },
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get member by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: {
        payments: { orderBy: { paymentDate: 'desc' } },
        reimbursements: { orderBy: { submittedAt: 'desc' } },
      },
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Create new member
router.post('/', async (req: Request, res: Response) => {
  try {
    const member = await prisma.member.create({
      data: req.body,
    });
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// Update member
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const member = await prisma.member.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.member.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// Get member summary stats
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const members = await prisma.member.findMany({
      where: { status: MemberStatus.ACTIVE },
    });
    
    const totalDuesExpected = members.reduce((sum, m) => sum + m.duesOwed, 0);
    const totalCollected = members.reduce((sum, m) => sum + m.duesPaid, 0);
    const totalOutstanding = members.reduce((sum, m) => sum + m.outstandingBalance, 0);
    const paidCount = members.filter(m => m.outstandingBalance === 0).length;
    const partialCount = members.filter(m => m.duesPaid > 0 && m.outstandingBalance > 0).length;
    const overdueCount = members.filter(m => m.duesPaid === 0 && m.duesOwed > 0).length;
    
    res.json({
      totalMembers: members.length,
      totalDuesExpected,
      totalCollected,
      totalOutstanding,
      collectionPercentage: totalDuesExpected > 0 ? (totalCollected / totalDuesExpected) * 100 : 0,
      paidCount,
      partialCount,
      overdueCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary stats' });
  }
});

export default router;

