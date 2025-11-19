import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';

// Import routes
import memberRoutes from './routes/members';
import paymentRoutes from './routes/payments';
import reimbursementRoutes from './routes/reimbursements';
import eventRoutes from './routes/events';
import cashFlowRoutes from './routes/cashflow';
import analyticsRoutes from './routes/analytics';
import scenarioRoutes from './routes/scenarios';
import settingsRoutes from './routes/settings';
import notificationRoutes from './routes/notifications';
import exportRoutes from './routes/exports';
import stripeRoutes from './routes/stripe';
import smsRoutes from './routes/sms';

// Import services
import { startReminderBot } from './services/reminderBot';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/members', memberRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reimbursements', reimbursementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/cashflow', cashFlowRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/sms', smsRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  
  // Start automated reminder bot
  startReminderBot();
});

export default app;

