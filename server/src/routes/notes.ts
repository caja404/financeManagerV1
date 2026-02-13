import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1)
});

export default function noteRoutes(prisma: PrismaClient) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req: AuthRequest, res) => {
    const items = await prisma.note.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  });

  router.post('/', async (req: AuthRequest, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const created = await prisma.note.create({
      data: { ...parsed.data, userId: req.userId! }
    });
    res.status(201).json(created);
  });

  router.put('/:id', async (req: AuthRequest, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const updated = await prisma.note.update({
      where: { id: req.params.id, userId: req.userId! },
      data: parsed.data
    });
    res.json(updated);
  });

  router.delete('/:id', async (req: AuthRequest, res) => {
    await prisma.note.delete({
      where: { id: req.params.id, userId: req.userId! }
    });
    res.status(204).send();
  });

  return router;
}