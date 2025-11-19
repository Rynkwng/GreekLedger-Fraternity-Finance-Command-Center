# GreekLedger - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- npm or yarn

## Installation

### Step 1: Install All Dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Step 2: Setup Database
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

### Step 3: Start the Application
```bash
npm run dev
```

**That's it!** 🎉

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## First Steps

1. **Configure Chapter Settings**
   - Navigate to Settings (⚙️ in sidebar)
   - Set your chapter name and dues amount
   - Click "Save Settings"

2. **Add Your First Member**
   - Go to Members & Dues (👥)
   - Click "+ Add Member"
   - Fill in details and save

3. **Record a Payment**
   - Go to Payments (💳)
   - Click "+ Record Payment"
   - Select member and enter amount

4. **Explore Other Features**
   - Submit a test reimbursement
   - Create an event budget
   - Check out the analytics dashboard

## Need Help?

- **Full Documentation**: See README.md
- **Detailed Setup**: See SETUP_GUIDE.md
- **API Reference**: See API_DOCUMENTATION.md

## Common Issues

**Port already in use?**
```bash
# Kill process on port 3000 or 3001
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Database issues?**
```bash
cd backend
npx prisma migrate reset
npx prisma generate
```

## Optional Configuration

### Email Notifications
1. Settings → Email Notifications
2. Enable and configure SMTP
3. Gmail users: Use an app password

### Discord Bot
1. Create bot at discord.com/developers
2. Settings → Discord Integration
3. Paste bot token and channel ID

---

**Ready to manage your chapter's finances like a pro!** 💰

