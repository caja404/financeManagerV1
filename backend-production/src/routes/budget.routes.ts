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
const createBudgetSchema = {
  body: z.object({
    name: z.string().min(1).max(100).trim(),
    amount: z.number().positive(),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020).max(2100),
  }),
};

const budgetParamsSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

const updateBudgetSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).trim().optional(),
    amount: z.number().positive().optional(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2020).max(2100).optional(),
  }),
};

/**
 * GET /api/v1/budgets
 * Get all budgets for authenticated user
 */
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    res.json(ApiResponse.success(budgets));
  }),
);

/**
 * POST /api/v1/budgets
 * Create new budget
 */
router.post(
  '/',
  validate(createBudgetSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: req.userId,
        name: req.body.name,
        month: req.body.month,
        year: req.body.year,
      },
    });

    if (existingBudget) {
      throw ApiError.conflict('A budget with this name already exists for the selected month');
    }

    const budget = await prisma.budget.create({
      data: {
        ...req.body,
        userId: req.userId!,
      },
    });

    res.status(201).json(ApiResponse.success(budget));
  }),
);

/**
 * PUT /api/v1/budgets/:id
 * Update budget
 */
router.put(
  '/:id',
  validate(updateBudgetSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const existingBudget = await prisma.budget.findUnique({ where: { id } });
    if (!existingBudget) {
      throw ApiError.notFound('Budget not found');
    }

    if (existingBudget.userId !== req.userId) {
      throw ApiError.forbidden('Not authorized to update this budget');
    }

    const nextName = req.body.name ?? existingBudget.name;
    const nextMonth = req.body.month ?? existingBudget.month;
    const nextYear = req.body.year ?? existingBudget.year;

    const duplicateBudget = await prisma.budget.findFirst({
      where: {
        userId: req.userId,
        name: nextName,
        month: nextMonth,
        year: nextYear,
        NOT: { id },
      },
    });

    if (duplicateBudget) {
      throw ApiError.conflict('A budget with this name already exists for the selected month');
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: req.body,
    });

    res.json(ApiResponse.success(budget));
  }),
);

/**
 * DELETE /api/v1/budgets/:id
 * Delete budget
 */
router.delete(
  '/:id',
  validate(budgetParamsSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const existingBudget = await prisma.budget.findUnique({ where: { id } });
    if (!existingBudget) {
      throw ApiError.notFound('Budget not found');
    }

    if (existingBudget.userId !== req.userId) {
      throw ApiError.forbidden('Not authorized to delete this budget');
    }

    await prisma.budget.delete({ where: { id } });

    res.json(ApiResponse.success({ message: 'Budget deleted successfully' }));
  }),
);

export default router;
