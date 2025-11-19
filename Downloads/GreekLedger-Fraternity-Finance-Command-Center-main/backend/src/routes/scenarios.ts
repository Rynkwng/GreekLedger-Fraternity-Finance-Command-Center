import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all scenarios
router.get('/', async (req: Request, res: Response) => {
  try {
    const scenarios = await prisma.scenario.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(scenarios);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
});

// Create/calculate scenario
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { name, memberCount, duesAmount, expectedExpenses } = req.body;
    
    // Calculate projections
    const totalDuesIncome = memberCount * duesAmount;
    const projectedSurplus = totalDuesIncome - expectedExpenses;
    
    // Calculate max safe event budget (keeping some reserve)
    const reserveBuffer = 0.15; // 15% reserve
    const maxEventBudget = Math.max(0, projectedSurplus * (1 - reserveBuffer));
    
    const scenario = await prisma.scenario.create({
      data: {
        name: name || `Scenario ${new Date().toLocaleDateString()}`,
        memberCount,
        duesAmount,
        expectedExpenses,
        projectedSurplus,
        maxEventBudget,
      },
    });
    
    res.status(201).json(scenario);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create scenario' });
  }
});

// Calculate scenario without saving
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { memberCount, duesAmount, expectedExpenses } = req.body;
    
    const totalDuesIncome = memberCount * duesAmount;
    const projectedSurplus = totalDuesIncome - expectedExpenses;
    const reserveBuffer = 0.15;
    const maxEventBudget = Math.max(0, projectedSurplus * (1 - reserveBuffer));
    
    // Get current stats for comparison
    const currentMembers = await prisma.member.count({ where: { status: 'ACTIVE' } });
    const settings = await prisma.chapterSettings.findFirst();
    const currentDues = settings?.semesterDuesAmount || 0;
    
    res.json({
      input: {
        memberCount,
        duesAmount,
        expectedExpenses,
      },
      output: {
        totalDuesIncome,
        projectedSurplus,
        maxEventBudget,
        perMemberBudget: memberCount > 0 ? maxEventBudget / memberCount : 0,
      },
      comparison: {
        currentMembers,
        currentDues,
        memberCountDiff: memberCount - currentMembers,
        duesAmountDiff: duesAmount - currentDues,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate scenario preview' });
  }
});

// Delete scenario
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.scenario.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Scenario deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete scenario' });
  }
});

export default router;

