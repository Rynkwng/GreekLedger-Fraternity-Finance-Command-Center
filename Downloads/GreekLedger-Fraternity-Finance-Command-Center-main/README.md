# GreekLedger - Fraternity Finance Command Center

A comprehensive financial management system designed specifically for fraternities and sororities. Manage dues, reimbursements, events, cash flow forecasting, and automated payment reminders all in one place.

![GreekLedger Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Express%20%7C%20SQLite-blue)

## 🎯 Features

### 1. **Members & Dues Management**
- Track all member information (name, pledge class, status)
- Monitor dues owed, paid, and outstanding balances
- Support for partial payments and payment plans
- Automatic late fee calculations
- Color-coded status indicators (Paid / Partial / Overdue)
- Summary statistics dashboard

### 2. **Reimbursement & Approval Workflow**
- Submit reimbursement requests with receipt uploads
- Treasurer dashboard for approval/denial
- Multi-stage workflow (Pending → Approved → Paid)
- Category tracking (Social, Philanthropy, Operations, etc.)
- Export monthly reports to CSV/PDF

### 3. **Event Budget Planner vs Actuals**
- Plan event budgets with itemized breakdowns
- Track actual expenses after events
- Visual comparison charts (Planned vs Actual)
- Variance analysis by category
- Top events by cost reporting

### 4. **Cash Flow & Reserves Forecasting**
- Project bank balance month-by-month
- Set minimum reserve thresholds
- Automatic alerts when projected balance dips below threshold
- Support for recurring income and expenses
- 12-month cash flow projections

### 5. **Spending Analytics**
- Interactive pie charts showing spending by category
- Trend lines for spending over time
- Spend per member calculations
- Comprehensive dashboard with recent activity
- Export capabilities for external analysis

### 6. **Scenario Planner**
- "What if" modeling for dues changes
- Adjust member count, dues amount, and expected expenses
- See projected surplus/deficit instantly
- Calculate max safe event budget
- Save and compare multiple scenarios

### 7. **Automated Reminder Bot**
- Weekly automated payment reminders via email
- Discord integration for chapter notifications
- Customizable reminder frequency
- "Paid in full" confirmation messages
- Low reserve alerts

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, responsive styling
- **Recharts** - Beautiful data visualizations
- **Axios** - API communication
- **React Hot Toast** - Elegant notifications

### Backend
- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe server-side code
- **Prisma** - Next-generation ORM
- **SQLite** - Lightweight, file-based database

### Integrations
- **Nodemailer** - Email notifications
- **Discord.js** - Discord bot integration
- **Node-Cron** - Scheduled task automation
- **PDFKit** - PDF report generation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd GreekLedger-Fraternity-Finance-Command-Center-main

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Setup Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### Step 3: Configure Environment (Optional)

Create a `.env` file in the `backend` directory for custom configuration:

```env
PORT=3001
DATABASE_URL="file:./prisma/greekledger.db"
```

### Step 4: Run the Application

```bash
# From the root directory, run both frontend and backend
npm run dev

# Or run them separately:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 🚀 **NEW: API Integrations**

GreekLedger now supports powerful API integrations! Transform from a tracking system into a **full payment automation platform**.

### ⭐ Stripe Payment Processing
- **Accept online payments** via credit/debit card
- **Generate payment links** for each member
- **Automatic payment tracking** via webhooks
- **Cost:** 2.9% + $0.30 per transaction
- **Setup:** 30 minutes → See `API_INTEGRATIONS_GUIDE.md`

### ⭐ Twilio SMS Notifications
- **98% open rate** vs 20% for email!
- Send payment reminders via text
- Payment confirmations
- **Cost:** ~$0.0079 per SMS (~$8/month for 1,000 SMS)
- **Setup:** 15 minutes → See `API_INTEGRATIONS_GUIDE.md`

### ⭐ Cloudinary File Storage
- **Free 25GB** cloud storage for receipts
- Automatic image optimization
- Fast CDN delivery
- **Cost:** FREE
- **Setup:** 10 minutes → See `API_INTEGRATIONS_GUIDE.md`

**📚 Full setup guide:** See [API_INTEGRATIONS_GUIDE.md](./API_INTEGRATIONS_GUIDE.md)

---

## 🔧 Configuration

### Email Notifications

To enable email notifications, configure the following in Settings:

1. Enable Email Notifications
2. SMTP Host: `smtp.gmail.com` (or your email provider)
3. SMTP Port: `587` (or `465` for SSL)
4. Email Username: Your email address
5. Email Password: Your app-specific password

**Gmail Users**: You'll need to create an [App Password](https://support.google.com/accounts/answer/185833)

### Discord Integration

To enable Discord notifications:

1. Create a Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a bot and copy the bot token
3. Invite the bot to your server
4. Copy the channel ID where you want notifications
5. Configure in Settings → Discord Integration

### Automated Reminders

The system includes a cron-based reminder bot that runs:
- **Weekly** (Monday 9 AM): Payment reminders to members with outstanding balances
- **Daily** (10 AM): Check reserve levels and send alerts if below threshold

Configure frequency in Settings → Reminder Settings.

## 📊 Database Schema

The application uses SQLite with Prisma ORM. Key models include:

- **Member** - Member information and dues tracking
- **Payment** - Payment records with late fees
- **Reimbursement** - Reimbursement requests with approval workflow
- **Event** - Event budgets and actual expenses
- **RecurringTransaction** - Recurring income/expense tracking
- **ChapterSettings** - Chapter configuration
- **Scenario** - Saved financial scenarios
- **Notification** - Notification history

View the complete schema in `backend/prisma/schema.prisma`.

## 🎨 Screenshots

### Dashboard
The main dashboard provides an overview of:
- Active members and dues collection rates
- Pending reimbursements
- Recent payments and activity
- Quick action buttons

### Members & Dues
- Sortable table of all members
- Color-coded payment status
- Summary statistics
- Add/edit member functionality

### Reimbursements
- Visual workflow with status badges
- Upload receipts (images/PDFs)
- Approve/deny/mark as paid
- Summary statistics by status

### Events
- Budget vs actual comparison charts
- Event cards with variance analysis
- Progress bars for budget utilization
- Category tracking

### Analytics
- Pie charts for spending by category
- Trend lines over time
- Spending per member calculations
- Export functionality

### Cash Flow
- 12-month projection chart
- Recurring transaction management
- Reserve threshold alerts
- Income vs expense visualization

### Scenario Planner
- Interactive sliders for "what if" analysis
- Real-time calculations
- Comparison with current metrics
- Save and compare scenarios

## 📝 API Endpoints

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `GET /api/members/stats/summary` - Get summary statistics

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record payment
- `GET /api/payments/member/:memberId` - Get payments by member

### Reimbursements
- `GET /api/reimbursements` - Get all reimbursements
- `POST /api/reimbursements` - Submit reimbursement (with file upload)
- `PATCH /api/reimbursements/:id/status` - Update status
- `GET /api/reimbursements/stats/summary` - Get summary statistics

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `POST /api/events/:id/expenses` - Add expense to event
- `GET /api/events/stats/comparison` - Get budget comparison stats

### Cash Flow
- `GET /api/cashflow/recurring` - Get recurring transactions
- `POST /api/cashflow/recurring` - Create recurring transaction
- `GET /api/cashflow/projection` - Get cash flow projection

### Analytics
- `GET /api/analytics/spending-by-category` - Spending breakdown
- `GET /api/analytics/spending-trends` - Historical trends
- `GET /api/analytics/spending-per-member` - Per member calculations
- `GET /api/analytics/dashboard` - Dashboard statistics

### Scenarios
- `GET /api/scenarios` - Get saved scenarios
- `POST /api/scenarios/calculate` - Save scenario
- `POST /api/scenarios/preview` - Preview scenario (no save)

### Exports
- `GET /api/exports/members/csv` - Export members to CSV
- `GET /api/exports/reimbursements/csv` - Export reimbursements to CSV
- `GET /api/exports/report/pdf` - Generate PDF financial report

### Settings & Notifications
- `GET /api/settings` - Get chapter settings
- `PUT /api/settings` - Update settings
- `POST /api/notifications/send-reminder/:memberId` - Send reminder to member
- `POST /api/notifications/send-bulk-reminders` - Send reminders to all

## 🛠️ Development

### Project Structure

```
GreekLedger/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── services/           # Business logic
│   │   └── index.ts            # Entry point
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── components/         # React components
│   │   ├── [pages]/            # Next.js pages
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   └── package.json
└── package.json                # Root package
```

### Available Scripts

```bash
# Root directory
npm run dev              # Run both frontend & backend
npm run install:all      # Install all dependencies
npm run build            # Build production

# Backend
npm run dev              # Run dev server with hot reload
npm run build            # Compile TypeScript
npm run start            # Run production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio

# Frontend
npm run dev              # Run Next.js dev server
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your chapter!

## 🆘 Support

Having issues? Common solutions:

### Database Issues
```bash
cd backend
npx prisma migrate reset  # Reset database
npx prisma generate       # Regenerate client
```

### Port Conflicts
- Frontend default: 3000
- Backend default: 3001
- Change ports in `frontend/package.json` and `backend/src/index.ts` if needed

### Missing Dependencies
```bash
npm run install:all  # Reinstall all dependencies
```

## 🎓 Use Cases

This system is perfect for:
- Fraternity/Sorority treasurers
- Chapter financial management
- Executive board planning
- Alumni advisor oversight
- National organization reporting

## 🔮 Future Enhancements

Potential features for future versions:
- Mobile app (React Native)
- Venmo/Zelle payment integration
- Automated bank transaction imports
- Advanced ML-based spending categorization
- Multi-chapter support for nationals
- Budget templates library
- Fiscal year reporting
- Tax document generation

## 👥 Credits

Built with ❤️ for Greek life organizations

---

**GreekLedger** - Making chapter finances simple, transparent, and efficient.

