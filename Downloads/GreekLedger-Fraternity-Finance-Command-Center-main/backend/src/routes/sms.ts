import { Router, Request, Response } from 'express';
import { 
  sendPaymentReminderSMS, 
  sendBulkPaymentReminders,
  sendPaymentConfirmationSMS,
  sendCustomSMS 
} from '../services/sms';

const router = Router();

// Send payment reminder SMS to a single member
router.post('/send-reminder/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const { paymentLink } = req.body;

    const success = await sendPaymentReminderSMS(memberId, paymentLink);

    if (success) {
      res.json({ message: 'SMS reminder sent successfully' });
    } else {
      res.status(400).json({ error: 'Failed to send SMS reminder. Check Twilio configuration and member phone number.' });
    }
  } catch (error: any) {
    console.error('SMS reminder error:', error);
    res.status(500).json({ error: error.message || 'Failed to send SMS reminder' });
  }
});

// Send bulk SMS reminders
router.post('/send-bulk-reminders', async (req: Request, res: Response) => {
  try {
    const { paymentLinks } = req.body; // Optional: array of {memberId, paymentLink}

    const results = await sendBulkPaymentReminders(paymentLinks);

    res.json({
      message: `SMS reminders sent`,
      sent: results.sent,
      failed: results.failed,
    });
  } catch (error: any) {
    console.error('Bulk SMS error:', error);
    res.status(500).json({ error: error.message || 'Failed to send bulk SMS reminders' });
  }
});

// Send payment confirmation SMS
router.post('/send-confirmation/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const { amount } = req.body;

    const success = await sendPaymentConfirmationSMS(memberId, amount);

    if (success) {
      res.json({ message: 'Payment confirmation SMS sent successfully' });
    } else {
      res.status(400).json({ error: 'Failed to send confirmation SMS' });
    }
  } catch (error: any) {
    console.error('SMS confirmation error:', error);
    res.status(500).json({ error: error.message || 'Failed to send confirmation SMS' });
  }
});

// Send custom SMS to member
router.post('/send-custom/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const success = await sendCustomSMS(memberId, message);

    if (success) {
      res.json({ message: 'Custom SMS sent successfully' });
    } else {
      res.status(400).json({ error: 'Failed to send custom SMS' });
    }
  } catch (error: any) {
    console.error('Custom SMS error:', error);
    res.status(500).json({ error: error.message || 'Failed to send custom SMS' });
  }
});

export default router;

