import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

export function startReminderJob(prisma: PrismaClient) {
  const daysBefore = Number(process.env.REMINDER_DAYS_BEFORE || 3);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE) === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  cron.schedule('0 9 * * *', async () => {
    const target = new Date();
    target.setDate(target.getDate() + daysBefore);

    const start = new Date(target); start.setHours(0, 0, 0, 0);
    const end = new Date(target); end.setHours(23, 59, 59, 999);

    const cards = await prisma.creditCard.findMany({
      where: { dueDate: { gte: start, lte: end } },
      include: { user: true }
    });

    for (const card of cards) {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: card.user.email,
        subject: `Credit Card Due Reminder: ${card.name}`,
        text: `Your ${card.name} minimum due of $${card.minimumDue.toFixed(2)} is due on ${card.dueDate.toDateString()}.`
      });
    }
  });
}