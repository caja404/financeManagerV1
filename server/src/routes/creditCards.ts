import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const schema = z.object({
  name: z.string().min(1),
  dueDate: z.string().datetime(),
  minimumDue: z.number()
});

export default function cardRoutes(prisma: PrismaClient) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req: AuthRequest, res) => {
    const items = await prisma.creditCard.findMany({
      where: { userId: req.userId! },
      orderBy: { dueDate: 'asc' }
    });
    res.json(items);
  });

  router.post('/', async (req: AuthRequest, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const created = await prisma.creditCard.create({
      data: { ...parsed.data, dueDate: new Date(parsed.data.dueDate), userId: req.userId! }
    });
    res.status(201).json(created);
  });

  router.put('/:id', async (req: AuthRequest, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const updated = await prisma.creditCard.update({
      where: { id: req.params.id, userId: req.userId! },
      data: { ...parsed.data, dueDate: new Date(parsed.data.dueDate) }
    });
    res.json(updated);
  });

  router.delete('/:id', async (req: AuthRequest, res) => {
    await prisma.creditCard.delete({
      where: { id: req.params.id, userId: req.userId! }
    });
    res.status(204).send();
  });

  return router;
}