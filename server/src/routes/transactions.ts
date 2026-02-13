import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const schema = z.object({
  date: z.string().datetime(),
  description: z.string().min(1),
  amount: z.number(),
  category: z.string().min(1),
  type: z.enum(['income', 'expense'])
});

export default function transactionRoutes(prisma: PrismaClient) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req: AuthRequest, res) => {
    const items = await prisma.transaction.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' }
    });
    res.json(items);
  });

  router.post('/', async (req: AuthRequest, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const created = await prisma.transaction.create({
      data: { ...parsed.data, date: new Date(parsed.data.date), userId: req.userId! }
    });
    res.status(201).json(created);
  });

  router.put('/:id', async (req: AuthRequest, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const updated = await prisma.transaction.update({
      where: { id: req.params.id, userId: req.userId! },
      data: { ...parsed.data, date: new Date(parsed.data.date) }
    });
    res.json(updated);
  });

  router.delete('/:id', async (req: AuthRequest, res) => {
    await prisma.transaction.delete({
      where: { id: req.params.id, userId: req.userId! }
    });
    res.status(204).send();
  });

  return router;
}