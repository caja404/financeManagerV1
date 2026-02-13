import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import budgetRoutes from './routes/budgets.js';
import investmentRoutes from './routes/investments.js';
import noteRoutes from './routes/notes.js';
import cardRoutes from './routes/creditCards.js';
import { startReminderJob } from './services/reminder.js';

dotenv.config();
const prisma = new PrismaClient();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes(prisma));
app.use('/transactions', transactionRoutes(prisma));
app.use('/budgets', budgetRoutes(prisma));
app.use('/investments', investmentRoutes(prisma));
app.use('/notes', noteRoutes(prisma));
app.use('/credit-cards', cardRoutes(prisma));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  startReminderJob(prisma);
  console.log(`API running on http://localhost:${port}`);
});