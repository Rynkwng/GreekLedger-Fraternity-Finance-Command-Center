import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const router = Router();
const prisma = new PrismaClient();

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

// Create payment link for a member
router.post('/create-payment-link', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(400).json({ 
        error: 'Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables.' 
      });
    }

    const { memberId, amount, description } = req.body;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Create a payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100), // Convert to cents
            product_data: {
              name: description || 'Semester Dues',
              description: `Payment for ${member.firstName} ${member.lastName}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        type: 'dues_payment',
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/success`,
        },
      },
    });

    res.json({
      paymentLink: paymentLink.url,
      amount,
      member: {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
      },
    });
  } catch (error: any) {
    console.error('Stripe payment link error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment link' });
  }
});

// Create payment links for all members with outstanding balance
router.post('/create-bulk-payment-links', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(400).json({ 
        error: 'Stripe not configured' 
      });
    }

    const members = await prisma.member.findMany({
      where: {
        status: 'ACTIVE',
        outstandingBalance: { gt: 0 },
      },
    });

    const paymentLinks = [];

    for (const member of members) {
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(member.outstandingBalance * 100),
              product_data: {
                name: 'Outstanding Dues',
                description: `Payment for ${member.firstName} ${member.lastName}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          type: 'dues_payment',
        },
      });

      paymentLinks.push({
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        amount: member.outstandingBalance,
        paymentLink: paymentLink.url,
      });
    }

    res.json({
      count: paymentLinks.length,
      paymentLinks,
    });
  } catch (error: any) {
    console.error('Bulk payment links error:', error);
    res.status(500).json({ error: error.message || 'Failed to create bulk payment links' });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature if secret is configured
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
      case 'payment_intent.succeeded': {
        const session = event.data.object as any;
        const metadata = session.metadata;

        if (metadata?.memberId) {
          // Record the payment
          const amount = session.amount_total 
            ? session.amount_total / 100 
            : session.amount / 100;

          await prisma.payment.create({
            data: {
              memberId: metadata.memberId,
              amount,
              semester: new Date().getMonth() < 6 ? 'Spring' : 'Fall',
              notes: `Stripe payment - ${session.id}`,
            },
          });

          // Update member balance
          const member = await prisma.member.findUnique({
            where: { id: metadata.memberId },
          });

          if (member) {
            await prisma.member.update({
              where: { id: metadata.memberId },
              data: {
                duesPaid: member.duesPaid + amount,
                outstandingBalance: Math.max(0, member.outstandingBalance - amount),
              },
            });

            // Create notification
            await prisma.notification.create({
              data: {
                type: 'PAYMENT_CONFIRMATION',
                recipientId: member.id,
                subject: 'Payment Received!',
                message: `Thank you! We received your payment of $${amount.toFixed(2)}.`,
                status: 'SENT',
                sentAt: new Date(),
              },
            });

            console.log(`✅ Payment recorded for ${member.firstName} ${member.lastName}: $${amount}`);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`❌ Payment failed: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message || 'Webhook processing failed' });
  }
});

// Get payment history from Stripe
router.get('/payment-history/:memberId', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }

    const { memberId } = req.params;

    // Get payments from our database that were made via Stripe
    const payments = await prisma.payment.findMany({
      where: {
        memberId,
        notes: { contains: 'Stripe' },
      },
      orderBy: { paymentDate: 'desc' },
    });

    res.json(payments);
  } catch (error: any) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch payment history' });
  }
});

// Create a checkout session (alternative to payment links)
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }

    const { memberId, amount, description } = req.body;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: description || 'Semester Dues',
              description: `Payment for ${member.firstName} ${member.lastName}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/cancel`,
      customer_email: member.email,
      metadata: {
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        type: 'dues_payment',
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

export default router;

