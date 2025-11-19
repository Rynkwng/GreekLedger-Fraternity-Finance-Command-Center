import { Twilio } from 'twilio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Twilio client
let twilioClient: Twilio | null = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Send SMS notification
export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    if (!twilioClient) {
      console.log('Twilio not configured. SMS not sent.');
      return false;
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error('TWILIO_PHONE_NUMBER not configured');
      return false;
    }

    // Format phone number (add +1 if US number without country code)
    let formattedPhone = to.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+1' + formattedPhone.replace(/\D/g, '');
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`✅ SMS sent to ${formattedPhone}: ${result.sid}`);
    return true;
  } catch (error: any) {
    console.error('Failed to send SMS:', error.message);
    return false;
  }
}

// Send payment reminder SMS
export async function sendPaymentReminderSMS(
  memberId: string,
  paymentLink?: string
): Promise<boolean> {
  try {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member || !member.phoneNumber) {
      return false;
    }

    const amount = member.outstandingBalance.toFixed(2);
    let message = `Hi ${member.firstName}! Friendly reminder: You have $${amount} in outstanding dues.`;

    if (paymentLink) {
      message += ` Pay easily here: ${paymentLink}`;
    } else {
      message += ' Please contact the treasurer to arrange payment.';
    }

    return await sendSMS(member.phoneNumber, message);
  } catch (error) {
    console.error('Error sending payment reminder SMS:', error);
    return false;
  }
}

// Send bulk payment reminders
export async function sendBulkPaymentReminders(
  paymentLinks?: Array<{ memberId: string; paymentLink: string }>
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  try {
    const members = await prisma.member.findMany({
      where: {
        status: 'ACTIVE',
        outstandingBalance: { gt: 0 },
        phoneNumber: { not: null },
      },
    });

    for (const member of members) {
      // Find payment link for this member if provided
      const linkInfo = paymentLinks?.find(pl => pl.memberId === member.id);
      const success = await sendPaymentReminderSMS(
        member.id,
        linkInfo?.paymentLink
      );

      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Error sending bulk reminders:', error);
  }

  return { sent, failed };
}

// Send payment confirmation SMS
export async function sendPaymentConfirmationSMS(
  memberId: string,
  amount: number
): Promise<boolean> {
  try {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member || !member.phoneNumber) {
      return false;
    }

    const message = `Thank you, ${member.firstName}! We received your payment of $${amount.toFixed(2)}. Your outstanding balance is now $${member.outstandingBalance.toFixed(2)}.`;

    return await sendSMS(member.phoneNumber, message);
  } catch (error) {
    console.error('Error sending payment confirmation SMS:', error);
    return false;
  }
}

// Send low reserves alert SMS to treasurer
export async function sendLowReservesAlertSMS(
  treasurerPhone: string,
  currentBalance: number,
  threshold: number
): Promise<boolean> {
  try {
    const message = `⚠️ GreekLedger Alert: Chapter balance ($${currentBalance.toFixed(2)}) is below the minimum threshold ($${threshold.toFixed(2)}). Review cash flow projections.`;

    return await sendSMS(treasurerPhone, message);
  } catch (error) {
    console.error('Error sending low reserves alert SMS:', error);
    return false;
  }
}

// Send custom SMS to member
export async function sendCustomSMS(
  memberId: string,
  message: string
): Promise<boolean> {
  try {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member || !member.phoneNumber) {
      return false;
    }

    return await sendSMS(member.phoneNumber, message);
  } catch (error) {
    console.error('Error sending custom SMS:', error);
    return false;
  }
}

