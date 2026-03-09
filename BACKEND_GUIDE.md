# Backend Setup & Deployment Guide

## 📚 Table of Contents
1. [Understanding the Backend](#understanding-the-backend)
2. [Local Development Setup](#local-development-setup)
3. [Security Enhancements](#security-enhancements)
4. [Frontend Integration](#frontend-integration)
5. [Production Deployment](#production-deployment)
6. [Database Hosting](#database-hosting)

---

## 🏗️ Understanding the Backend

### Architecture Overview
```
server/
├── src/
│   ├── index.ts              # Main server file
│   ├── routes/               # API endpoints
│   │   ├── auth.ts           # Login/Register
│   │   ├── transactions.ts   # Transaction management
│   │   ├── budgets.ts        # Budget tracking
│   │   ├── investments.ts    # Investment tracking
│   │   ├── notes.ts          # Note management
│   │   └── creditCards.ts    # Credit card management
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication
│   └── services/
│       └── reminder.ts       # Email reminder service
└── prisma/
    └── schema.prisma         # Database schema
```

### Key Technologies

#### **Express.js** - Web Framework
- Handles HTTP requests/responses
- Routes API calls to correct handlers
- Manages middleware

#### **Prisma** - Database ORM
- Simplifies database operations
- Type-safe database queries
- Automatic migrations
- Works with PostgreSQL

#### **JWT (JSON Web Tokens)** - Authentication
- Secure user sessions
- Stateless authentication
- Token expires in 7 days

#### **bcrypt** - Password Hashing
- Securely stores passwords
- Uses salt rounds (12) for security
- One-way encryption

#### **Zod** - Input Validation
- Validates user input
- Type-safe schemas
- Error handling

---

## 🚀 Local Development Setup

### Prerequisites
1. **Node.js** (v18+) - Already installed ✓
2. **PostgreSQL** database

### Step 1: Install PostgreSQL

#### Option A: Local Installation (Recommended for Learning)
**Download PostgreSQL:**
- Visit: https://www.postgresql.org/download/windows/
- Download PostgreSQL 16.x installer
- During installation:
  - Set password for `postgres` user (remember this!)
  - Port: 5432 (default)
  - Locale: Default

**Verify Installation:**
```powershell
# Open PowerShell and run:
psql --version
```

#### Option B: Docker (Alternative)
```powershell
# Install Docker Desktop, then run:
docker run --name financemonitor-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

### Step 2: Create Database
```powershell
# Open PowerShell and connect to PostgreSQL:
psql -U postgres

# Inside PostgreSQL prompt:
CREATE DATABASE financemonitor;
\q
```

### Step 3: Configure Environment Variables

Update `server/.env`:
```env
# Database - Update if you used different password
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/financemonitor?schema=public"

# JWT Secret - Change to a random string
JWT_SECRET="your-super-secure-random-string-here-min-32-chars"

# Email (Optional - for reminders)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="youremail@gmail.com"
SMTP_PASS="your_app_password"
FROM_EMAIL="Finance Monitor <youremail@gmail.com>"
REMINDER_DAYS_BEFORE=3

# Server
PORT=4000
NODE_ENV=development
```

**Generate JWT Secret:**
```powershell
# Run this to generate a secure random string:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Initialize Database
```powershell
cd server

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations (creates tables)
npm run prisma:migrate

# View your database with Prisma Studio (optional)
npx prisma studio
```

### Step 5: Start Development Server
```powershell
# Development mode (auto-restart on changes)
npm run dev

# Production build
npm run build
npm start
```

Server runs on: http://localhost:4000

---

## 🔒 Security Enhancements

### Current Security Issues:
1. ❌ No rate limiting (vulnerable to brute force)
2. ❌ Missing security headers
3. ❌ No HTTPS in production
4. ❌ CORS allows all origins
5. ❌ No request logging
6. ❌ Generic error messages expose details

### Security Improvements Needed:

#### 1. Add Rate Limiting
Prevents brute force attacks on login/register

#### 2. Add Helmet.js
Sets secure HTTP headers

#### 3. Improve CORS
Restrict to your frontend domain only

#### 4. Add Request Logging
Track API usage and errors

#### 5. Environment-specific Configs
Different settings for dev/production

#### 6. Better Error Handling
Hide internal errors from users

---

## 🔗 Frontend Integration

### API Endpoints

#### Authentication
```typescript
// Register
POST /auth/register
Body: { email: string, password: string, name: string }
Response: { token: string, user: { id, email, name } }

// Login
POST /auth/login
Body: { email: string, password: string }
Response: { token: string, user: { id, email, name } }
```

#### Protected Routes (Require Authorization Header)
```typescript
Authorization: Bearer YOUR_JWT_TOKEN

// Transactions
GET    /transactions        # List all
POST   /transactions        # Create
PUT    /transactions/:id    # Update
DELETE /transactions/:id    # Delete

// Budgets
GET    /budgets             # List all
POST   /budgets             # Create
PUT    /budgets/:id         # Update
DELETE /budgets/:id         # Delete

// Similar for: /investments, /notes, /credit-cards
```

### Frontend Service Updates Needed

Update Angular services to call backend:

```typescript
// Example: auth.service.ts
private apiUrl = 'http://localhost:4000';

login(email: string, password: string) {
  return this.http.post<{token: string, user: any}>(
    `${this.apiUrl}/auth/login`,
    { email, password }
  );
}
```

---

## 🌐 Production Deployment

### Hosting Options

#### Option 1: **Railway.app** (Easiest, Free Tier)
- Automatic deployments from GitHub
- Free PostgreSQL database included
- Free tier: 500 hours/month
- Best for: Learning & small projects

#### Option 2: **Render.com** (Free Tier)
- Free web service + PostgreSQL
- Auto-deploy from GitHub
- Spins down after inactivity (free tier)
- Best for: Side projects

#### Option 3: **DigitalOcean** (Most Control, $5-10/month)
- Full server control
- Better performance
- More setup required
- Best for: Production apps

#### Option 4: **AWS/Azure/GCP** (Enterprise, $$$)
- Highly scalable
- Complex setup
- Best for: Large scale

### Deployment Steps (Railway - Recommended)

1. **Create Account**: https://railway.app
2. **Install Railway CLI**:
```powershell
npm install -g @railway/cli
railway login
```

3. **Initialize Project**:
```powershell
cd server
railway init
railway link
```

4. **Add PostgreSQL**:
- Dashboard → New → Database → PostgreSQL
- Railway auto-sets DATABASE_URL

5. **Set Environment Variables**:
```powershell
railway variables set JWT_SECRET=your-secret-here
railway variables set NODE_ENV=production
```

6. **Deploy**:
```powershell
railway up
```

7. **Get Your URL**:
- Dashboard → Settings → Generate Domain
- Example: `financemonitor-api.up.railway.app`

---

## 💾 Database Hosting

### Local Development
- PostgreSQL on your computer
- Fast, free, full control
- Data lost if computer crashes

### Production Options

#### 1. **Railway PostgreSQL** (Easiest)
- Included with Railway deployment
- Free tier: 512MB storage
- Automatic backups

#### 2. **Supabase** (Great Free Tier)
- PostgreSQL hosting
- Free tier: 500MB database
- Includes authentication features
- Dashboard: https://supabase.com

#### 3. **Neon.tech** (Modern Choice)
- Serverless PostgreSQL
- Free tier: 512MB
- Auto-scaling

#### 4. **AWS RDS** (Production Grade)
- Reliable and scalable
- More expensive
- Complex setup

---

## 📋 Pre-Deployment Checklist

### Code
- [ ] All environment variables are set
- [ ] JWT_SECRET is strong and unique
- [ ] CORS restricted to frontend domain
- [ ] Error messages don't leak sensitive info
- [ ] Database migrations are up to date

### Infrastructure
- [ ] Database hosted and accessible
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] Frontend environment points to production API

### Testing
- [ ] Backend health check works
- [ ] Authentication endpoints work
- [ ] All CRUD operations function
- [ ] Frontend can communicate with backend

### Security
- [ ] Passwords are hashed
- [ ] JWT tokens expire appropriately
- [ ] Rate limiting active
- [ ] Security headers set
- [ ] Sensitive logs disabled in production

---

## 🎯 Next Steps

1. **Choose your path:**
   - 🎓 **Learning**: Set up local PostgreSQL
   - 🚀 **Quick Deploy**: Use Railway.app
   - 💪 **Full Control**: DigitalOcean/AWS

2. **Let me know which path you want, and I'll:**
   - Add security enhancements
   - Fix frontend integration
   - Set up deployment
   - Guide you through each step

**What would you like to focus on first?**
