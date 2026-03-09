import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.string().default('2'),
  DATABASE_POOL_MAX: z.string().default('10'),

  // Security
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().default('12'),
  SESSION_SECRET: z.string().min(32).optional(),

  // CORS
  CORS_ORIGIN: z.string().default('*'),
  CORS_CREDENTIALS: z.string().default('true'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  // Email (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().optional(),

  // Frontend
  FRONTEND_URL: z.string().url().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  // Server
  NODE_ENV: parsed.data.NODE_ENV,
  PORT: parseInt(parsed.data.PORT, 10),
  API_VERSION: parsed.data.API_VERSION,
  IS_PRODUCTION: parsed.data.NODE_ENV === 'production',
  IS_DEVELOPMENT: parsed.data.NODE_ENV === 'development',

  // Database
  DATABASE_URL: parsed.data.DATABASE_URL,
  DATABASE_POOL_MIN: parseInt(parsed.data.DATABASE_POOL_MIN, 10),
  DATABASE_POOL_MAX: parseInt(parsed.data.DATABASE_POOL_MAX, 10),

  // Security
  JWT_SECRET: parsed.data.JWT_SECRET,
  JWT_EXPIRES_IN: parsed.data.JWT_EXPIRES_IN,
  BCRYPT_ROUNDS: parseInt(parsed.data.BCRYPT_ROUNDS, 10),
  SESSION_SECRET: parsed.data.SESSION_SECRET,

  // CORS
  CORS_ORIGIN: parsed.data.CORS_ORIGIN.split(',').map((o) => o.trim()),
  CORS_CREDENTIALS: parsed.data.CORS_CREDENTIALS === 'true',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS, 10),

  // Email
  SMTP_HOST: parsed.data.SMTP_HOST,
  SMTP_PORT: parsed.data.SMTP_PORT ? parseInt(parsed.data.SMTP_PORT, 10) : undefined,
  SMTP_SECURE: parsed.data.SMTP_SECURE === 'true',
  SMTP_USER: parsed.data.SMTP_USER,
  SMTP_PASS: parsed.data.SMTP_PASS,
  FROM_EMAIL: parsed.data.FROM_EMAIL,

  // Frontend
  FRONTEND_URL: parsed.data.FRONTEND_URL,

  // Monitoring
  SENTRY_DSN: parsed.data.SENTRY_DSN,
  LOG_LEVEL: parsed.data.LOG_LEVEL,
};
