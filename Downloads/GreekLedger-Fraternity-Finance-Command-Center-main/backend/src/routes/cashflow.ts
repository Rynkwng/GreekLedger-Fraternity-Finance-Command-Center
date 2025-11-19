import { Router, Request, Response } from 'express';
import { PrismaClient, TransactionType } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get recurring transactions
router.get('/recurring', async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.recurringTransaction.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recurring transactions' });
  }
});

// Create recurring transaction
router.post('/recurring', async (req: Request, res: Response) => {
  try {
    const transaction = await prisma.recurringTransaction.create({
      data: req.body,
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recurring transaction' });
  }
});

// Update recurring transaction
router.put('/recurring/:id', async (req: Request, res: Response) => {
  try {
    const transaction = await prisma.recurringTransaction.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update recurring transaction' });
  }
});

// Delete recurring transaction
router.delete('/recurring/:id', async (req: Request, res: Response) => {
  try {
    await prisma.recurringTransaction.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get cash flow projection
router.get('/projection', async (req: Request, res: Response) => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    
    // Get current balance (from all payments minus all expenses)
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
    
    // Get recurring transactions
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { isActive: true },
    });
    
    // Get settings for reserve threshold
    const settings = await prisma.chapterSettings.findFirst();
    const minReserve = settings?.minReserveThreshold || 2000;
    
    // Project future months
    const projection = [];
    let balance = currentBalance;
    
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      let monthlyIncome = 0;
      let monthlyExpenses = 0;
      
      // Calculate recurring transactions for this month
      recurringTransactions.forEach(transaction => {
        const shouldInclude = shouldIncludeInMonth(transaction, date);
        
        if (shouldInclude) {
          if (transaction.type === TransactionType.INCOME) {
            monthlyIncome += transaction.amount;
          } else {
            monthlyExpenses += transaction.amount;
          }
        }
      });
      
      balance += monthlyIncome - monthlyExpenses;
      
      projection.push({
        month: date.toISOString().slice(0, 7),
        income: monthlyIncome,
        expenses: monthlyExpenses,
        netChange: monthlyIncome - monthlyExpenses,
        projectedBalance: balance,
        belowThreshold: balance < minReserve,
      });
    }
    
    res.json({
      currentBalance,
      minReserveThreshold: minReserve,
      projection,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate projection' });
  }
});

// Helper function to determine if transaction should be included in a given month
function shouldIncludeInMonth(transaction: any, targetDate: Date): boolean {
  const startDate = new Date(transaction.startDate);
  const endDate = transaction.endDate ? new Date(transaction.endDate) : null;
  
  // Check if transaction is active during target month
  if (targetDate < startDate) return false;
  if (endDate && targetDate > endDate) return false;
  
  // Check frequency
  const monthsDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (targetDate.getMonth() - startDate.getMonth());
  
  switch (transaction.frequency) {
    case 'MONTHLY':
      return true;
    case 'QUARTERLY':
      return monthsDiff % 3 === 0;
    case 'ANNUALLY':
      return monthsDiff % 12 === 0;
    case 'SEMESTER':
      return monthsDiff % 6 === 0;
    default:
      return false;
  }
}

export default router;

