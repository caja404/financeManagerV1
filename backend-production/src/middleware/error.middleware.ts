import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '@/utils/ApiError.js';
import { logger } from '@/config/logger.js';
import { env } from '@/config/env.js';

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error('Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    ip: req.ip,
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      ...(error.details && { details: error.details }),
    });
  }

  // Prisma errors
  if (error.constructor.name.includes('Prisma')) {
    return res.status(500).json({
      success: false,
      error: env.IS_PRODUCTION
        ? 'Database error occurred'
        : `Database error: ${error.message}`,
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: env.IS_PRODUCTION ? 'Internal server error' : error.message,
    ...(env.IS_DEVELOPMENT && { stack: error.stack }),
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.url,
  });
}

/**
 * Async handler wrapper to catch promise rejections
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
