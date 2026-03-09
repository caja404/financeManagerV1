import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/config/database.js';
import { env } from '@/config/env.js';
import { ApiError } from '@/utils/ApiError.js';
import { ApiResponse } from '@/utils/ApiResponse.js';
import { asyncHandler } from '@/middleware/error.middleware.js';
import { requireAuth, type AuthRequest } from '@/middleware/auth.middleware.js';
import { validate } from '@/middleware/validator.middleware.js';
import { authLimiter } from '@/middleware/rateLimiter.middleware.js';
import { logger } from '@/config/logger.js';

const router = Router();

const tokenOptions: SignOptions = {
  expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
};

function createToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, tokenOptions);
}

// Validation schemas
const registerSchema = {
  body: z.object({
    email: z.string().email('Invalid email format').trim().toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email format').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
};

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = createToken(user.id);

    logger.info(`New user registered: ${email}`);

    res.status(201).json(
      ApiResponse.success({
        token,
        user,
      }),
    );
  }),
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate JWT
    const token = createToken(user.id);

    logger.info(`User logged in: ${email}`);

    res.json(
      ApiResponse.success({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      }),
    );
  }),
);

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json(ApiResponse.success(user));
  }),
);

export default router;
