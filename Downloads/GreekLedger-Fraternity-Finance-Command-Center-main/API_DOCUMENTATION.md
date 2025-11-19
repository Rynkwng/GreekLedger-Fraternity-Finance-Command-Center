# GreekLedger API Documentation

Base URL: `http://localhost:3001/api`

## Table of Contents
1. [Members](#members)
2. [Payments](#payments)
3. [Reimbursements](#reimbursements)
4. [Events](#events)
5. [Cash Flow](#cash-flow)
6. [Analytics](#analytics)
7. [Scenarios](#scenarios)
8. [Settings](#settings)
9. [Notifications](#notifications)
10. [Exports](#exports)

---

## Members

### Get All Members
```http
GET /api/members
```

**Response:**
```json
[
  {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "555-1234",
    "pledgeClass": "Fall 2023",
    "status": "ACTIVE",
    "duesOwed": 500.00,
    "duesPaid": 250.00,
    "outstandingBalance": 250.00,
    "paymentPlan": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "payments": [],
    "reimbursements": []
  }
]
```

### Get Member by ID
```http
GET /api/members/:id
```

### Create Member
```http
POST /api/members
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "555-1234",
  "pledgeClass": "Fall 2023",
  "status": "ACTIVE",
  "duesOwed": 500.00
}
```

### Update Member
```http
PUT /api/members/:id
Content-Type: application/json

{
  "duesOwed": 550.00,
  "paymentPlan": true
}
```

### Delete Member
```http
DELETE /api/members/:id
```

### Get Summary Statistics
```http
GET /api/members/stats/summary
```

**Response:**
```json
{
  "totalMembers": 50,
  "totalDuesExpected": 25000.00,
  "totalCollected": 20000.00,
  "totalOutstanding": 5000.00,
  "collectionPercentage": 80.0,
  "paidCount": 35,
  "partialCount": 10,
  "overdueCount": 5
}
```

---

## Payments

### Get All Payments
```http
GET /api/payments
```

### Get Payments by Member
```http
GET /api/payments/member/:memberId
```

### Create Payment
```http
POST /api/payments
Content-Type: application/json

{
  "memberId": "uuid",
  "amount": 250.00,
  "semester": "Spring 2024",
  "notes": "Partial payment",
  "lateFee": 0
}
```

**Note:** Creating a payment automatically updates the member's balance.

### Delete Payment
```http
DELETE /api/payments/:id
```

**Note:** Deleting a payment reverses the balance update.

---

## Reimbursements

### Get All Reimbursements
```http
GET /api/reimbursements
GET /api/reimbursements?status=PENDING
```

Query Parameters:
- `status` (optional): Filter by status (PENDING, APPROVED, DENIED, PAID)

### Get Reimbursement by ID
```http
GET /api/reimbursements/:id
```

### Submit Reimbursement
```http
POST /api/reimbursements
Content-Type: multipart/form-data

memberId: uuid
amount: 150.00
description: Pizza for recruitment event
event: Fall Recruitment
category: RECRUITMENT
receipt: [file]
```

**Categories:**
- SOCIAL
- PHILANTHROPY
- OPERATIONS
- RECRUITMENT
- NATIONALS
- HOUSING
- ATHLETICS
- ACADEMIC
- OTHER

### Update Reimbursement Status
```http
PATCH /api/reimbursements/:id/status
Content-Type: application/json

{
  "status": "APPROVED",
  "reviewNotes": "Approved for payment"
}
```

**Status Workflow:**
1. PENDING → APPROVED or DENIED
2. APPROVED → PAID

### Delete Reimbursement
```http
DELETE /api/reimbursements/:id
```

### Get Summary Statistics
```http
GET /api/reimbursements/stats/summary
```

**Response:**
```json
{
  "counts": {
    "pending": 5,
    "approved": 3,
    "paid": 20
  },
  "amounts": {
    "pending": 500.00,
    "approved": 300.00,
    "paid": 2000.00
  }
}
```

---

## Events

### Get All Events
```http
GET /api/events
```

**Response includes parsed budgetBreakdown and actualBreakdown JSON.**

### Get Event by ID
```http
GET /api/events/:id
```

### Create Event
```http
POST /api/events
Content-Type: application/json

{
  "name": "Spring Formal",
  "date": "2024-04-15T19:00:00.000Z",
  "description": "Annual spring formal dance",
  "category": "SOCIAL",
  "plannedBudget": 2000.00,
  "budgetBreakdown": {
    "venue": 800,
    "food": 600,
    "decorations": 300,
    "transportation": 300
  }
}
```

### Update Event
```http
PUT /api/events/:id
Content-Type: application/json

{
  "actualSpent": 2150.00,
  "status": "COMPLETED",
  "actualBreakdown": {
    "venue": 850,
    "food": 650,
    "decorations": 350,
    "transportation": 300
  }
}
```

**Event Status:**
- PLANNED
- IN_PROGRESS
- COMPLETED
- CANCELLED

### Add Expense to Event
```http
POST /api/events/:id/expenses
Content-Type: application/json

{
  "description": "Venue deposit",
  "category": "venue",
  "amount": 400.00,
  "receiptPath": "/uploads/receipt.pdf"
}
```

### Get Budget Comparison Stats
```http
GET /api/events/stats/comparison
```

### Get Top Events by Cost
```http
GET /api/events/stats/top-by-cost?limit=5
```

---

## Cash Flow

### Get Recurring Transactions
```http
GET /api/cashflow/recurring
```

### Create Recurring Transaction
```http
POST /api/cashflow/recurring
Content-Type: application/json

{
  "name": "Monthly Rent",
  "type": "EXPENSE",
  "category": "HOUSING",
  "amount": 1500.00,
  "frequency": "MONTHLY",
  "startDate": "2024-01-01T00:00:00.000Z",
  "description": "House rent payment"
}
```

**Transaction Types:**
- INCOME
- EXPENSE

**Frequencies:**
- WEEKLY
- MONTHLY
- QUARTERLY
- SEMESTER
- ANNUALLY

### Update Recurring Transaction
```http
PUT /api/cashflow/recurring/:id
```

### Delete Recurring Transaction
```http
DELETE /api/cashflow/recurring/:id
```

### Get Cash Flow Projection
```http
GET /api/cashflow/projection?months=12
```

**Response:**
```json
{
  "currentBalance": 15000.00,
  "minReserveThreshold": 2000.00,
  "projection": [
    {
      "month": "2024-01",
      "income": 5000.00,
      "expenses": 3000.00,
      "netChange": 2000.00,
      "projectedBalance": 17000.00,
      "belowThreshold": false
    }
  ]
}
```

---

## Analytics

### Get Spending by Category
```http
GET /api/analytics/spending-by-category
```

**Response:**
```json
{
  "data": [
    {
      "category": "SOCIAL",
      "amount": 5000.00,
      "percentage": 35.7
    },
    {
      "category": "PHILANTHROPY",
      "amount": 3000.00,
      "percentage": 21.4
    }
  ],
  "total": 14000.00
}
```

### Get Spending Trends
```http
GET /api/analytics/spending-trends?months=6
```

**Response:**
```json
[
  {
    "month": "2024-01",
    "categories": {
      "SOCIAL": 1000,
      "PHILANTHROPY": 500
    },
    "total": 1500
  }
]
```

### Get Spending Per Member
```http
GET /api/analytics/spending-per-member
```

**Response:**
```json
{
  "totalSpending": 15000.00,
  "activeMembers": 50,
  "spendingPerMember": 300.00
}
```

### Get Dashboard Statistics
```http
GET /api/analytics/dashboard
```

**Response includes:**
- Member statistics
- Dues collection data
- Reimbursement summary
- Upcoming events
- Recent payments
- Recent reimbursements

---

## Scenarios

### Get All Scenarios
```http
GET /api/scenarios
```

### Preview Scenario (No Save)
```http
POST /api/scenarios/preview
Content-Type: application/json

{
  "memberCount": 50,
  "duesAmount": 550.00,
  "expectedExpenses": 22000.00
}
```

**Response:**
```json
{
  "input": {
    "memberCount": 50,
    "duesAmount": 550,
    "expectedExpenses": 22000
  },
  "output": {
    "totalDuesIncome": 27500,
    "projectedSurplus": 5500,
    "maxEventBudget": 4675,
    "perMemberBudget": 93.5
  },
  "comparison": {
    "currentMembers": 48,
    "currentDues": 500,
    "memberCountDiff": 2,
    "duesAmountDiff": 50
  }
}
```

### Calculate and Save Scenario
```http
POST /api/scenarios/calculate
Content-Type: application/json

{
  "name": "Fall 2024 - Increased Dues",
  "memberCount": 50,
  "duesAmount": 550.00,
  "expectedExpenses": 22000.00
}
```

### Delete Scenario
```http
DELETE /api/scenarios/:id
```

---

## Settings

### Get Settings
```http
GET /api/settings
```

**Response:**
```json
{
  "id": "uuid",
  "chapterName": "Gamma Theta Chapter",
  "semesterDuesAmount": 500.00,
  "minReserveThreshold": 2000.00,
  "lateFeePercentage": 0.05,
  "lateFeeGracePeriod": 7,
  "emailEnabled": true,
  "emailHost": "smtp.gmail.com",
  "emailPort": 587,
  "emailUser": "treasurer@chapter.com",
  "discordEnabled": true,
  "discordChannelId": "123456789",
  "reminderFrequency": "WEEKLY"
}
```

**Note:** Sensitive fields (emailPassword, discordBotToken) are excluded from response.

### Update Settings
```http
PUT /api/settings
Content-Type: application/json

{
  "semesterDuesAmount": 550.00,
  "emailEnabled": true,
  "emailHost": "smtp.gmail.com",
  "emailPort": 587,
  "emailUser": "treasurer@chapter.com",
  "emailPassword": "app-password"
}
```

---

## Notifications

### Get Notification History
```http
GET /api/notifications
```

### Send Reminder to Member
```http
POST /api/notifications/send-reminder/:memberId
```

**Response:**
```json
{
  "message": "Reminder sent successfully",
  "notification": {
    "id": "uuid",
    "type": "PAYMENT_REMINDER",
    "recipientId": "member-uuid",
    "subject": "Payment Reminder: Outstanding Dues",
    "message": "Hi John, you have an outstanding balance of $250.00...",
    "status": "SENT",
    "sentAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Send Bulk Reminders
```http
POST /api/notifications/send-bulk-reminders
```

Sends reminders to all members with outstanding balances.

**Response:**
```json
{
  "message": "Sent 15 of 15 reminders",
  "results": [
    { "memberId": "uuid", "status": "sent" },
    { "memberId": "uuid", "status": "sent" }
  ]
}
```

---

## Exports

### Export Members to CSV
```http
GET /api/exports/members/csv
```

Downloads CSV file with all member data.

### Export Reimbursements to CSV
```http
GET /api/exports/reimbursements/csv
```

Downloads CSV file with all reimbursement data.

### Generate PDF Financial Report
```http
GET /api/exports/report/pdf
```

Downloads comprehensive PDF report including:
- Financial summary
- Collection rates
- Top events by cost
- Generated timestamp

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production deployment, consider adding rate limiting middleware.

## Authentication

Currently no authentication is implemented. For production deployment, implement JWT or session-based authentication.

## CORS

CORS is enabled for all origins in development. For production, configure specific allowed origins.

---

**Need help?** Check the README.md or SETUP_GUIDE.md for more information.

