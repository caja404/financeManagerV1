import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const schema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000)
});

export default function budgetRoutes(prisma: PrismaClient) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req: AuthRequest, res) => {
    const items = await prisma.budget.findMany({
      where: { userId: req.userId! },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
    res.json(items);
  });

  router.post('/', async (req: AuthRequest, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const created = await prisma.budget.create({
      data: { ...parsed.data, userId: req.userId! }
    });
    res.status(201).json(created);
  });

  router.put('/:id', async (req: AuthRequest, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const updated = await prisma.budget.update({
      where: { id: req.params.id, userId: req.userId! },
      data: parsed.data
    });
    res.json(updated);
  });

  router.delete('/:id', async (req: AuthRequest, res) => {
    await prisma.budget.delete({
      where: { id: req.params.id, userId: req.userId! }
    });
    res.status(204).send();
  });

  return router;
}