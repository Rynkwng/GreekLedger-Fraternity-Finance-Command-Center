# GreekLedger Setup Guide

This guide will walk you through setting up GreekLedger for your fraternity or sorority chapter.

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Setup Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

### 3. Run the Application

```bash
npm run dev
```

Open your browser to http://localhost:3000 🎉

## Detailed Setup

### Initial Configuration

1. **Access the Application**
   - Navigate to http://localhost:3000
   - You'll see the empty dashboard

2. **Configure Chapter Settings**
   - Click on "Settings" in the sidebar
   - Fill in:
     - Chapter Name (e.g., "Gamma Theta Chapter")
     - Semester Dues Amount (e.g., $500)
     - Minimum Reserve Threshold (e.g., $2000)
   - Click "Save Settings"

### Adding Members

1. **Navigate to Members & Dues**
   - Click "Members & Dues" in the sidebar
   - Click "+ Add Member"

2. **Fill in Member Information**
   - First Name
   - Last Name
   - Email
   - Phone Number (optional)
   - Pledge Class (e.g., "Fall 2023")
   - Dues Owed (will default to chapter setting)

3. **Bulk Import (Alternative)**
   - Prepare a CSV with member data
   - Use the import feature (coming soon) or add via API

### Recording Payments

1. **Go to Payments Page**
   - Click "Payments" in sidebar
   - Click "+ Record Payment"

2. **Enter Payment Details**
   - Select member from dropdown
   - Enter amount paid
   - Add semester (e.g., "Spring 2024")
   - Add optional notes
   - Click "Record Payment"

3. **Automatic Updates**
   - Member's balance updates automatically
   - Status changes based on payment (Paid/Partial/Overdue)

### Managing Reimbursements

1. **Submit a Reimbursement**
   - Navigate to Reimbursements page
   - Click "+ Submit Reimbursement"
   - Fill in details:
     - Select member
     - Event name
     - Category
     - Amount
     - Description
     - Upload receipt (optional)

2. **Treasurer Approval Workflow**
   - Pending requests appear at the top
   - Click "Approve" or "Deny"
   - Approved items can be marked "Paid" when processed

3. **Export Monthly Report**
   - Click "Export CSV" to download all reimbursements
   - Use for record keeping or advisor reports

### Planning Events

1. **Create an Event**
   - Go to Events page
   - Click "+ Create Event"
   - Enter:
     - Event name (e.g., "Spring Formal")
     - Date
     - Category (Social, Philanthropy, etc.)
     - Planned budget

2. **Track Actual Spending**
   - As expenses occur, add them to the event
   - The system tracks actual vs planned
   - View variance in real-time

3. **Analyze Results**
   - Charts show planned vs actual automatically
   - See which categories went over/under budget

### Cash Flow Forecasting

1. **Add Recurring Transactions**
   - Navigate to Cash Flow page
   - Click "+ Add Recurring Transaction"
   
2. **Add Income Sources**
   - Type: Income
   - Name: "Semester Dues"
   - Amount: Based on expected collections
   - Frequency: Semester

3. **Add Recurring Expenses**
   - Type: Expense
   - Name: "Nationals Fees", "Insurance", "Rent", etc.
   - Set frequency (Monthly, Quarterly, etc.)

4. **Review Projections**
   - 12-month forecast updates automatically
   - Red flags appear if balance dips below threshold
   - Adjust plans accordingly

### Using Scenario Planner

1. **Model "What If" Scenarios**
   - Go to Scenario Planner
   - Adjust sliders for:
     - Member count
     - Dues amount
     - Expected expenses

2. **Analyze Results**
   - See projected surplus/deficit
   - Calculate max safe event budget
   - Compare with current scenario

3. **Save Scenarios**
   - Click "Save This Scenario"
   - Compare multiple scenarios
   - Present to exec board for decision-making

## Setting Up Notifications

### Email Notifications

**For Gmail:**

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Enable 2FA

2. **Generate App Password**
   - Visit https://myaccount.google.com/apppasswords
   - Create new app password for "Mail"
   - Copy the 16-character password

3. **Configure in GreekLedger**
   - Settings → Email Notifications
   - Enable Email Notifications
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - Email Username: your-email@gmail.com
   - Email Password: [paste app password]
   - Save Settings

**For Other Email Providers:**
- Outlook: smtp-mail.outlook.com (Port 587)
- Yahoo: smtp.mail.yahoo.com (Port 465)
- Custom domain: Check with your email provider

### Discord Integration

1. **Create Discord Bot**
   - Visit https://discord.com/developers/applications
   - Click "New Application"
   - Give it a name (e.g., "GreekLedger Bot")
   - Go to "Bot" tab
   - Click "Add Bot"
   - Copy bot token

2. **Invite Bot to Server**
   - Go to OAuth2 → URL Generator
   - Select scopes: `bot`
   - Select permissions: `Send Messages`, `Read Messages`
   - Copy generated URL
   - Open in browser and add to your server

3. **Get Channel ID**
   - Enable Developer Mode in Discord (User Settings → Advanced)
   - Right-click the channel you want notifications in
   - Click "Copy ID"

4. **Configure in GreekLedger**
   - Settings → Discord Integration
   - Enable Discord Notifications
   - Paste bot token
   - Paste channel ID
   - Save Settings

5. **Test It**
   - Click "Send Test Reminder Now" in Settings
   - Check Discord channel for message

### Automated Reminders

The system automatically sends reminders on a schedule:

**Weekly Reminders (Monday 9 AM)**
- Sends to all members with outstanding balances
- Includes amount due and payment instructions

**Daily Reserve Checks (10 AM)**
- Monitors cash flow projections
- Alerts if balance falls below threshold

**Customize:**
- Settings → Reminder Settings
- Choose frequency: Daily, Weekly, or Monthly

## Best Practices

### For Treasurers

1. **Weekly Routine**
   - Review pending reimbursements
   - Record any payments received
   - Check cash flow projections

2. **Monthly Tasks**
   - Export reports for records
   - Review analytics dashboard
   - Update recurring transactions if needed

3. **Semester Planning**
   - Use Scenario Planner before dues announcements
   - Set event budgets in advance
   - Monitor collection rates weekly

### Data Management

1. **Regular Backups**
   ```bash
   # Backup database
   cp backend/prisma/greekledger.db backups/greekledger-$(date +%Y%m%d).db
   ```

2. **Export Data Regularly**
   - Use CSV exports for external records
   - Generate PDF reports for advisor meetings
   - Keep copies off-system

3. **Clean Old Data**
   - Archive alumni members
   - Review and delete test data
   - Keep system performant

## Troubleshooting

### "Cannot connect to backend"
- Check if backend is running on port 3001
- Try restarting both servers: `npm run dev`

### "Database error"
```bash
cd backend
npx prisma migrate reset
npx prisma generate
```

### "Email not sending"
- Verify SMTP credentials
- Check if app password is used (not regular password)
- Test with "Send Test Reminder" button

### "Discord bot offline"
- Verify bot token is correct
- Ensure bot has been invited to server
- Check bot has proper permissions

### Port conflicts
- Frontend uses port 3000
- Backend uses port 3001
- Change in respective package.json files if needed

## Advanced Configuration

### Custom Domain (Production)

1. **Frontend (Vercel/Netlify)**
   - Deploy frontend to Vercel
   - Update API endpoint in `frontend/next.config.js`

2. **Backend (Railway/Heroku)**
   - Deploy backend to hosting service
   - Update database to PostgreSQL for production
   - Set environment variables

3. **Security**
   - Add authentication (Auth0, NextAuth)
   - Implement rate limiting
   - Use HTTPS everywhere

### Database Migration

To switch from SQLite to PostgreSQL:

1. Update `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set DATABASE_URL in `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

3. Run migrations:
```bash
npx prisma migrate dev
```

## Support & Resources

- **Documentation**: See README.md
- **API Reference**: Check `/api/health` endpoint
- **Database Schema**: View in Prisma Studio (`npx prisma studio`)
- **Issues**: Create GitHub issue or contact support

## Next Steps

After setup:
1. ✅ Add all chapter members
2. ✅ Record existing dues payments
3. ✅ Set up recurring transactions
4. ✅ Configure notifications
5. ✅ Train exec board on system
6. ✅ Plan first event budget
7. ✅ Schedule weekly review routine

**Congratulations! Your chapter is now using GreekLedger! 🎉**

