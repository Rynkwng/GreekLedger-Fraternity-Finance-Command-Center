import { Router, Request, Response } from 'express';
import { PrismaClient, ExpenseCategory } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get spending by category
router.get('/spending-by-category', async (req: Request, res: Response) => {
  try {
    // Get reimbursements by category
    const reimbursements = await prisma.reimbursement.findMany({
      where: { status: 'PAID' },
    });
    
    // Get events by category
    const events = await prisma.event.findMany();
    
    // Aggregate spending
    const categorySpending: Record<string, number> = {};
    
    reimbursements.forEach(r => {
      categorySpending[r.category] = (categorySpending[r.category] || 0) + r.amount;
    });
    
    events.forEach(e => {
      categorySpending[e.category] = (categorySpending[e.category] || 0) + e.actualSpent;
    });
    
    // Convert to array
    const data = Object.entries(categorySpending).map(([category, amount]) => ({
      category,
      amount,
      percentage: 0, // Will calculate after we have total
    }));
    
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    
    data.forEach(item => {
      item.percentage = total > 0 ? (item.amount / total) * 100 : 0;
    });
    
    res.json({
      data: data.sort((a, b) => b.amount - a.amount),
      total,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spending by category' });
  }
});

// Get spending trends over time
router.get('/spending-trends', async (req: Request, res: Response) => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    
    // Get all paid reimbursements
    const reimbursements = await prisma.reimbursement.findMany({
      where: { 
        status: 'PAID',
        paidAt: { not: null },
      },
    });
    
    // Get all events
    const events = await prisma.event.findMany();
    
    // Group by month and category
    const monthlyData: Record<string, Record<string, number>> = {};
    
    // Process reimbursements
    reimbursements.forEach(r => {
      if (r.paidAt) {
        const month = r.paidAt.toISOString().slice(0, 7);
        if (!monthlyData[month]) monthlyData[month] = {};
        monthlyData[month][r.category] = (monthlyData[month][r.category] || 0) + r.amount;
      }
    });
    
    // Process events
    events.forEach(e => {
      const month = e.date.toISOString().slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = {};
      monthlyData[month][e.category] = (monthlyData[month][e.category] || 0) + e.actualSpent;
    });
    
    // Convert to array and sort by month
    const trends = Object.entries(monthlyData)
      .map(([month, categories]) => ({
        month,
        categories,
        total: Object.values(categories).reduce((sum, val) => sum + val, 0),
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-months);
    
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spending trends' });
  }
});

// Get spending per member
router.get('/spending-per-member', async (req: Request, res: Response) => {
  try {
    const activeMembers = await prisma.member.count({
      where: { status: 'ACTIVE' },
    });
    
    const totalReimbursements = await prisma.reimbursement.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    });
    
    const totalEvents = await prisma.event.aggregate({
      _sum: { actualSpent: true },
    });
    
    const totalSpending = 
      (totalReimbursements._sum.amount || 0) + 
      (totalEvents._sum.amount || 0);
    
    const perMember = activeMembers > 0 ? totalSpending / activeMembers : 0;
    
    res.json({
      totalSpending,
      activeMembers,
      spendingPerMember: perMember,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate spending per member' });
  }
});

// Get comprehensive dashboard stats
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // Member stats
    const totalMembers = await prisma.member.count({ where: { status: 'ACTIVE' } });
    
    const duesStats = await prisma.member.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { duesOwed: true, duesPaid: true, outstandingBalance: true },
    });
    
    // Reimbursement stats
    const pendingReimbursements = await prisma.reimbursement.count({
      where: { status: 'PENDING' },
    });
    
    const pendingAmount = await prisma.reimbursement.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
    });
    
    // Event stats
    const upcomingEvents = await prisma.event.count({
      where: {
        date: { gte: new Date() },
        status: { not: 'CANCELLED' },
      },
    });
    
    // Recent activity
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { paymentDate: 'desc' },
      include: { member: true },
    });
    
    const recentReimbursements = await prisma.reimbursement.findMany({
      take: 5,
      orderBy: { submittedAt: 'desc' },
      include: { member: true },
    });
    
    res.json({
      members: {
        total: totalMembers,
        duesOwed: duesStats._sum.duesOwed || 0,
        duesPaid: duesStats._sum.duesPaid || 0,
        outstanding: duesStats._sum.outstandingBalance || 0,
      },
      reimbursements: {
        pending: pendingReimbursements,
        pendingAmount: pendingAmount._sum.amount || 0,
      },
      events: {
        upcoming: upcomingEvents,
      },
      recentActivity: {
        payments: recentPayments,
        reimbursements: recentReimbursements,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;

