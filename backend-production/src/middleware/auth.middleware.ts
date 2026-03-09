import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env.js';
import { ApiError } from '@/utils/ApiError.js';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Middleware to require JWT authentication
 */
export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      req.userId = payload.userId;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, 'Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'Invalid token');
      }
      throw new ApiError(401, 'Authentication failed');
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication - adds userId if present but doesn't require it
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
        req.userId = payload.userId;
      } catch {
        // Ignore errors - auth is optional
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
