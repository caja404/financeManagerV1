import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@/config/database.js';
import { ApiError } from '@/utils/ApiError.js';
import { ApiResponse } from '@/utils/ApiResponse.js';
import { asyncHandler } from '@/middleware/error.middleware.js';
import { validate } from '@/middleware/validator.middleware.js';
import { requireAuth, AuthRequest } from '@/middleware/auth.middleware.js';

const router = Router();

// Apply auth to all routes
router.use(requireAuth);

// Validation schemas
const createTransactionSchema = {
  body: z.object({
    date: z.string().datetime(),
    description: z.string().min(1).max(500).trim(),
    amount: z.number().positive(),
    category: z.string().min(1).trim(),
    type: z.enum(['income', 'expense']),
  }),
};

const updateTransactionSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    date: z.string().datetime().optional(),
    description: z.string().min(1).max(500).trim().optional(),
    amount: z.number().positive().optional(),
    category: z.string().min(1).trim().optional(),
    type: z.enum(['income', 'expense']).optional(),
  }),
};

const deleteTransactionSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

/**
 * GET /api/v1/transactions
 * Get all transactions for authenticated user
 */
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });

    res.json(ApiResponse.success(transactions));
  }),
);

/**
 * POST /api/v1/transactions
 * Create new transaction
 */
router.post(
  '/',
  validate(createTransactionSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const transaction = await prisma.transaction.create({
      data: {
        ...req.body,
        date: new Date(req.body.date),
        userId: req.userId!,
      },
    });

    res.status(201).json(ApiResponse.success(transaction));
  }),
);

/**
 * PUT /api/v1/transactions/:id
 * Update transaction
 */
router.put(
  '/:id',
  validate(updateTransactionSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Transaction not found');
    }
    if (existing.userId !== req.userId) {
      throw ApiError.forbidden('Not authorized to update this transaction');
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...req.body,
        ...(req.body.date && { date: new Date(req.body.date) }),
      },
    });

    res.json(ApiResponse.success(transaction));
  }),
);

/**
 * DELETE /api/v1/transactions/:id
 * Delete transaction
 */
router.delete(
  '/:id',
  validate(deleteTransactionSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Transaction not found');
    }
    if (existing.userId !== req.userId) {
      throw ApiError.forbidden('Not authorized to delete this transaction');
    }

    await prisma.transaction.delete({ where: { id } });

    res.json(ApiResponse.success({ message: 'Transaction deleted successfully' }));
  }),
);

export default router;
