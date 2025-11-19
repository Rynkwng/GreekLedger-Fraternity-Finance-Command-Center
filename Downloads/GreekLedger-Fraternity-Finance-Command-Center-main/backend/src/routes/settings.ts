import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get settings
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await prisma.chapterSettings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.chapterSettings.create({
        data: {
          chapterName: 'Your Fraternity Chapter',
          semesterDuesAmount: 500,
          minReserveThreshold: 2000,
          lateFeePercentage: 0.05,
          lateFeeGracePeriod: 7,
        },
      });
    }
    
    // Remove sensitive data before sending
    const { emailPassword, discordBotToken, ...safeSettings } = settings as any;
    
    res.json(safeSettings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.put('/', async (req: Request, res: Response) => {
  try {
    let settings = await prisma.chapterSettings.findFirst();
    
    if (settings) {
      settings = await prisma.chapterSettings.update({
        where: { id: settings.id },
        data: req.body,
      });
    } else {
      settings = await prisma.chapterSettings.create({
        data: req.body,
      });
    }
    
    // Remove sensitive data before sending
    const { emailPassword, discordBotToken, ...safeSettings } = settings as any;
    
    res.json(safeSettings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;

