import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all events
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      include: { expenses: true },
      orderBy: { date: 'desc' },
    });
    
    // Parse JSON fields
    const eventsWithParsedData = events.map(event => ({
      ...event,
      budgetBreakdown: event.budgetBreakdown ? JSON.parse(event.budgetBreakdown) : null,
      actualBreakdown: event.actualBreakdown ? JSON.parse(event.actualBreakdown) : null,
    }));
    
    res.json(eventsWithParsedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { expenses: true },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({
      ...event,
      budgetBreakdown: event.budgetBreakdown ? JSON.parse(event.budgetBreakdown) : null,
      actualBreakdown: event.actualBreakdown ? JSON.parse(event.actualBreakdown) : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event
router.post('/', async (req: Request, res: Response) => {
  try {
    const { budgetBreakdown, ...eventData } = req.body;
    
    const event = await prisma.event.create({
      data: {
        ...eventData,
        budgetBreakdown: budgetBreakdown ? JSON.stringify(budgetBreakdown) : null,
      },
      include: { expenses: true },
    });
    
    res.status(201).json({
      ...event,
      budgetBreakdown: event.budgetBreakdown ? JSON.parse(event.budgetBreakdown) : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { budgetBreakdown, actualBreakdown, ...eventData } = req.body;
    
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...eventData,
        budgetBreakdown: budgetBreakdown ? JSON.stringify(budgetBreakdown) : undefined,
        actualBreakdown: actualBreakdown ? JSON.stringify(actualBreakdown) : undefined,
      },
      include: { expenses: true },
    });
    
    res.json({
      ...event,
      budgetBreakdown: event.budgetBreakdown ? JSON.parse(event.budgetBreakdown) : null,
      actualBreakdown: event.actualBreakdown ? JSON.parse(event.actualBreakdown) : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Add expense to event
router.post('/:id/expenses', async (req: Request, res: Response) => {
  try {
    const expense = await prisma.eventExpense.create({
      data: {
        eventId: req.params.id,
        ...req.body,
      },
    });
    
    // Update event's actualSpent
    const expenses = await prisma.eventExpense.findMany({
      where: { eventId: req.params.id },
    });
    
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    await prisma.event.update({
      where: { id: req.params.id },
      data: { actualSpent: totalSpent },
    });
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Delete event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get event comparison stats
router.get('/stats/comparison', async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      include: { expenses: true },
      orderBy: { date: 'desc' },
      take: 10,
    });
    
    const comparisons = events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date,
      category: event.category,
      plannedBudget: event.plannedBudget,
      actualSpent: event.actualSpent,
      variance: event.actualSpent - event.plannedBudget,
      variancePercentage: event.plannedBudget > 0 
        ? ((event.actualSpent - event.plannedBudget) / event.plannedBudget) * 100 
        : 0,
    }));
    
    res.json(comparisons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comparison stats' });
  }
});

// Get top events by cost
router.get('/stats/top-by-cost', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    
    const events = await prisma.event.findMany({
      orderBy: { actualSpent: 'desc' },
      take: limit,
    });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top events' });
  }
});

export default router;

