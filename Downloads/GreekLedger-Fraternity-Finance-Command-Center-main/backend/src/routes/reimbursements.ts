import { Router, Request, Response } from 'express';
import { PrismaClient, ReimbursementStatus } from '@prisma/client';
import { UploadedFile } from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import { uploadReceipt } from '../services/cloudinary';

const router = Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists (fallback if Cloudinary not configured)
const uploadsDir = path.join(__dirname, '../../uploads/receipts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Get all reimbursements
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    const where = status ? { status: status as ReimbursementStatus } : {};
    
    const reimbursements = await prisma.reimbursement.findMany({
      where,
      include: { member: true },
      orderBy: { submittedAt: 'desc' },
    });
    
    res.json(reimbursements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reimbursements' });
  }
});

// Get reimbursement by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const reimbursement = await prisma.reimbursement.findUnique({
      where: { id: req.params.id },
      include: { member: true },
    });
    
    if (!reimbursement) {
      return res.status(404).json({ error: 'Reimbursement not found' });
    }
    
    res.json(reimbursement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reimbursement' });
  }
});

// Create reimbursement
router.post('/', async (req: Request, res: Response) => {
  try {
    const { memberId, amount, description, event, category } = req.body;
    
    let receiptPath: string | undefined;
    
    // Handle file upload
    if (req.files && req.files.receipt) {
      const receipt = req.files.receipt as UploadedFile;
      
      try {
        // Try Cloudinary first
        receiptPath = await uploadReceipt(receipt);
      } catch (error) {
        // Fallback to local storage
        console.log('Falling back to local storage for receipt');
        const fileName = `${Date.now()}_${receipt.name}`;
        receiptPath = `/uploads/receipts/${fileName}`;
        await receipt.mv(path.join(uploadsDir, fileName));
      }
    }
    
    const reimbursement = await prisma.reimbursement.create({
      data: {
        memberId,
        amount: parseFloat(amount),
        description,
        event,
        category,
        receiptPath,
      },
      include: { member: true },
    });
    
    res.status(201).json(reimbursement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create reimbursement' });
  }
});

// Update reimbursement status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, reviewNotes } = req.body;
    
    const updateData: any = {
      status,
      reviewNotes,
    };
    
    if (status === ReimbursementStatus.APPROVED || status === ReimbursementStatus.DENIED) {
      updateData.reviewedAt = new Date();
    }
    
    if (status === ReimbursementStatus.PAID) {
      updateData.paidAt = new Date();
    }
    
    const reimbursement = await prisma.reimbursement.update({
      where: { id: req.params.id },
      data: updateData,
      include: { member: true },
    });
    
    res.json(reimbursement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reimbursement status' });
  }
});

// Delete reimbursement
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const reimbursement = await prisma.reimbursement.findUnique({
      where: { id: req.params.id },
    });
    
    // Delete receipt file if exists
    if (reimbursement?.receiptPath) {
      const fullPath = path.join(__dirname, '../..', reimbursement.receiptPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    await prisma.reimbursement.delete({
      where: { id: req.params.id },
    });
    
    res.json({ message: 'Reimbursement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reimbursement' });
  }
});

// Get reimbursement summary
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const pending = await prisma.reimbursement.count({
      where: { status: ReimbursementStatus.PENDING },
    });
    
    const approved = await prisma.reimbursement.count({
      where: { status: ReimbursementStatus.APPROVED },
    });
    
    const paid = await prisma.reimbursement.count({
      where: { status: ReimbursementStatus.PAID },
    });
    
    const totalPending = await prisma.reimbursement.aggregate({
      where: { status: ReimbursementStatus.PENDING },
      _sum: { amount: true },
    });
    
    const totalApproved = await prisma.reimbursement.aggregate({
      where: { status: ReimbursementStatus.APPROVED },
      _sum: { amount: true },
    });
    
    const totalPaid = await prisma.reimbursement.aggregate({
      where: { status: ReimbursementStatus.PAID },
      _sum: { amount: true },
    });
    
    res.json({
      counts: { pending, approved, paid },
      amounts: {
        pending: totalPending._sum.amount || 0,
        approved: totalApproved._sum.amount || 0,
        paid: totalPaid._sum.amount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;

