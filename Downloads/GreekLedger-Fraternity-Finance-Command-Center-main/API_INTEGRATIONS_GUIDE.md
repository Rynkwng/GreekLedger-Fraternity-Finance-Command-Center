# API Integrations Setup Guide

GreekLedger now supports powerful API integrations that transform it from a tracking system into a full payment automation platform!

## 🎯 Quick Overview

| API | Purpose | Cost | Setup Time | Priority |
|-----|---------|------|------------|----------|
| **Stripe** | Accept online payments | 2.9% + $0.30/transaction | 30 min | ⭐⭐⭐ |
| **Twilio** | SMS reminders | ~$0.0079/SMS | 15 min | ⭐⭐⭐ |
| **Cloudinary** | Cloud file storage | FREE (25GB) | 10 min | ⭐⭐ |
| Email (SMTP) | Email notifications | FREE | 5 min | ⭐ |
| Discord | Discord notifications | FREE | 10 min | ⭐ |

---

## 💳 Stripe Payment Processing

### What It Does
- Generate payment links for members
- Accept credit/debit card payments
- Automatic payment tracking
- Recurring billing support
- Professional payment UI

### Setup Instructions

#### Step 1: Create Stripe Account
1. Go to https://stripe.com
2. Click "Start now" and create an account
3. Complete the registration process

#### Step 2: Get API Keys
1. Visit https://dashboard.stripe.com/apikeys
2. Copy your **Secret key** (starts with `sk_test_` for testing)
3. In production, use the **live key** (starts with `sk_live_`)

#### Step 3: Configure GreekLedger
1. Open `backend/.env`
2. Add your Stripe credentials:

```env
STRIPE_SECRET_KEY=sk_test_51Abc...xyz
FRONTEND_URL=http://localhost:3000
```

#### Step 4: (Optional) Setup Webhook for Automatic Payment Recording
1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click "Add endpoint"
3. Enter: `https://your-domain.com/api/stripe/webhook`
4. Select events: `checkout.session.completed`, `payment_intent.succeeded`
5. Copy the webhook secret and add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### How to Use

**Generate Payment Link for a Member:**
```bash
POST /api/stripe/create-payment-link
{
  "memberId": "member-uuid",
  "amount": 500.00,
  "description": "Spring 2024 Dues"
}
```

**From Frontend:**
- Go to Members & Dues page
- Click 💳 icon next to any member with outstanding balance
- Copy and share the payment link!

**Bulk Payment Links:**
- Click "Generate All Payment Links" button
- Creates links for all members with outstanding balances

---

## 📱 Twilio SMS Notifications

### What It Does
- Send payment reminders via SMS (98% open rate!)
- Payment confirmations
- Low reserve alerts
- Custom messages to members

### Setup Instructions

#### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up (free $15 trial credit!)
3. Verify your phone number

#### Step 2: Get Credentials
1. Visit https://console.twilio.com
2. Copy your **Account SID** (starts with `AC`)
3. Copy your **Auth Token** (click to reveal)

#### Step 3: Get Phone Number
1. In Twilio Console, go to **Phone Numbers → Manage → Buy a number**
2. Choose a US number (~$1/month)
3. Copy the phone number (format: +1234567890)

#### Step 4: Configure GreekLedger
Add to `backend/.env`:

```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef...
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+12345678900
```

### How to Use

**Automated Weekly Reminders:**
- Automatically runs every Monday at 9 AM
- Sends to all members with outstanding balances
- Includes payment link if Stripe is configured

**Manual SMS to Member:**
```bash
POST /api/sms/send-reminder/{memberId}
{
  "paymentLink": "https://stripe.com/pay/xyz"
}
```

**From Frontend:**
- Go to Members page
- Click 📱 icon to send SMS reminder
- Member must have phone number in profile!

**Bulk SMS:**
```bash
POST /api/sms/send-bulk-reminders
```

---

## ☁️ Cloudinary File Storage

### What It Does
- Store receipt images in the cloud
- Automatic image optimization
- Fast CDN delivery
- 25GB free storage
- Better than local file storage

### Setup Instructions

#### Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com
2. Sign up for free account
3. Verify your email

#### Step 2: Get Credentials
1. Visit https://cloudinary.com/console
2. Copy your **Cloud Name**
3. Copy your **API Key**
4. Copy your **API Secret** (click eye icon to reveal)

#### Step 3: Configure GreekLedger
Add to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-secret-key
```

### How to Use

**Automatic Upload:**
- When submitting reimbursements with receipts
- System automatically tries Cloudinary first
- Falls back to local storage if not configured

**Uploaded Files:**
- Stored in folder: `greekledger/receipts/`
- Accessible via secure URL
- Automatically optimized

---

## 📧 Email Notifications (Already Configured)

### Gmail Setup (Most Common)

#### Step 1: Enable 2FA
1. Go to Google Account settings
2. Security → 2-Step Verification → Turn On

#### Step 2: Create App Password
1. Visit https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other" → "GreekLedger"
4. Copy the 16-character password

#### Step 3: Configure
Add to Settings page in app:
- SMTP Host: `smtp.gmail.com`
- SMTP Port: `587`
- Email: `your-email@gmail.com`
- Password: [16-character app password]

---

## 🤖 Discord Bot (Already Configured)

### Setup Instructions

#### Step 1: Create Discord Application
1. Visit https://discord.com/developers/applications
2. Click "New Application"
3. Name it "GreekLedger Bot"

#### Step 2: Create Bot
1. Go to "Bot" tab
2. Click "Add Bot"
3. Copy the **Bot Token**

#### Step 3: Invite to Server
1. Go to OAuth2 → URL Generator
2. Select scopes: `bot`
3. Select permissions: `Send Messages`, `Read Messages`
4. Copy URL and open in browser
5. Select your server and authorize

#### Step 4: Get Channel ID
1. Enable Developer Mode in Discord (User Settings → Advanced)
2. Right-click the channel you want notifications in
3. Click "Copy ID"

#### Step 5: Configure
Add to Settings page in app:
- Bot Token: [from step 2]
- Channel ID: [from step 4]

---

## 🔄 Complete Integration Workflow

### Perfect Setup for Maximum Automation:

1. **Stripe** - Accept payments online
2. **Twilio** - Send SMS reminders with payment links
3. **Cloudinary** - Store receipts securely
4. **Email** - Backup notification method
5. **Discord** - Chapter-wide announcements

### Example Automated Flow:

**Monday 9 AM:**
1. System finds members with outstanding balances
2. Generates Stripe payment link for each
3. Sends SMS via Twilio with payment link
4. Sends email as backup
5. Posts summary to Discord

**When Member Pays:**
1. Stripe processes payment
2. Webhook notifies GreekLedger
3. Payment recorded automatically
4. Balance updated
5. Confirmation SMS sent
6. Member sees success page

---

## 💰 Cost Breakdown

### Monthly Cost Estimate (50 members):

**Free Tier:**
- Cloudinary: FREE (25GB storage)
- SendGrid: FREE (100 emails/day)
- Discord: FREE
- **Total: $0/month**

**With Paid Services:**
- Twilio SMS: ~$8/month (1,000 SMS)
- Twilio Phone Number: $1/month
- Stripe: Pay only per transaction (2.9% + $0.30)
- **Total: ~$10/month + transaction fees**

**Example Transaction Costs:**
- $500 dues payment → Stripe fee: $15.20
- Chapter collects $25,000 → Total fees: ~$760
- *But you actually collect the money instead of chasing people!*

---

## 🧪 Testing

### Test Mode Credentials

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**Twilio Test:**
- Send SMS to your own verified number
- Check console for delivery status

**Cloudinary Test:**
- Upload a receipt in reimbursements
- Check Cloudinary dashboard for file

---

## 🚨 Troubleshooting

### Stripe Issues

**Error: "Stripe not configured"**
- Check `STRIPE_SECRET_KEY` in backend/.env
- Restart backend server

**Payment not recording automatically**
- Add `STRIPE_WEBHOOK_SECRET` to .env
- Configure webhook in Stripe dashboard
- Use `ngrok` for local testing: `ngrok http 3001`

### Twilio Issues

**Error: "Failed to send SMS"**
- Verify phone number format: +1234567890
- Check Twilio console for error messages
- Ensure phone number is verified (in trial mode)

**SMS not received**
- Check member has phone number in profile
- Verify number format in database
- Check Twilio message logs

### Cloudinary Issues

**Uploads failing**
- Verify all 3 credentials are correct
- Check file size (< 10MB)
- System will fallback to local storage

---

## 📊 API Endpoints Reference

### Stripe Endpoints
```
POST /api/stripe/create-payment-link
POST /api/stripe/create-bulk-payment-links
POST /api/stripe/create-checkout-session
POST /api/stripe/webhook
GET  /api/stripe/payment-history/:memberId
```

### SMS Endpoints
```
POST /api/sms/send-reminder/:memberId
POST /api/sms/send-bulk-reminders
POST /api/sms/send-confirmation/:memberId
POST /api/sms/send-custom/:memberId
```

### Settings Endpoints
```
GET  /api/settings
PUT  /api/settings
```

---

## 🎓 Best Practices

1. **Start with Stripe** - Biggest impact on dues collection
2. **Add Twilio SMS** - Much better than email for reminders
3. **Use Test Mode First** - Verify everything works before going live
4. **Monitor Costs** - Check Twilio usage in console
5. **Backup Notifications** - Keep email enabled as fallback
6. **Secure Your Keys** - Never commit .env files to git
7. **Production Mode** - Switch to live keys when ready

---

## 🔐 Security Notes

- Never share API keys publicly
- Use `.env` files (already in `.gitignore`)
- Rotate keys if compromised
- Use webhook secrets for Stripe
- Enable Stripe webhook signature verification

---

## 📚 Additional Resources

- **Stripe Docs:** https://stripe.com/docs
- **Twilio Docs:** https://www.twilio.com/docs
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Discord Bot Guide:** https://discord.com/developers/docs

---

## 🆘 Need Help?

Check these in order:
1. Review this guide
2. Check API provider's status page
3. Look at server logs: `cd backend && npm run dev`
4. Test with Postman/curl
5. Check .env file configuration

---

**Congratulations! You now have a fully automated payment platform! 🎉**

Your members can pay online, receive SMS reminders, and you'll never chase dues again!

