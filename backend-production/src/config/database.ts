import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';

// Prisma Client Singleton
class DatabaseClient {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient({
        log: env.IS_DEVELOPMENT
          ? ['query', 'error', 'warn']
          : ['error'],
        datasources: {
          db: {
            url: env.DATABASE_URL,
          },
        },
      });

      logger.info('✅ Database client initialized');
    }

    return DatabaseClient.instance;
  }

  public static async connect(): Promise<void> {
    try {
      const client = DatabaseClient.getInstance();
      await client.$connect();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const client = DatabaseClient.getInstance();
      await client.$disconnect();
      logger.info('Database disconnected');
    } catch (error) {
      logger.error('Error disconnecting database:', error);
      throw error;
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const client = DatabaseClient.getInstance();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

export const prisma = DatabaseClient.getInstance();
export const connectDatabase = DatabaseClient.connect;
export const disconnectDatabase = DatabaseClient.disconnect;
export const databaseHealthCheck = DatabaseClient.healthCheck;
