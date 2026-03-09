import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from '@/config/env.js';
import { logger, morganStream } from '@/config/logger.js';
import { connectDatabase, databaseHealthCheck } from '@/config/database.js';
import { errorHandler, notFoundHandler } from '@/middleware/error.middleware.js';
import { apiLimiter } from '@/middleware/rateLimiter.middleware.js';

// Import routes
import authRoutes from '@/routes/auth.routes.js';
import transactionRoutes from '@/routes/transaction.routes.js';
import budgetRoutes from '@/routes/budget.routes.js';

class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize all middlewares
   */
  private initializeMiddlewares(): void {
    // Security
    this.app.use(helmet());
    this.app.disable('x-powered-by');

    // CORS
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        credentials: env.CORS_CREDENTIALS,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // HTTP logging
    if (env.IS_DEVELOPMENT) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', { stream: morganStream }));
    }

    // Rate limiting
    this.app.use('/api', apiLimiter);
  }

  /**
   * Initialize all routes
   */
  private initializeRoutes(): void {
    const apiVersion = env.API_VERSION;

    // Health check
    this.app.get('/health', async (_req, res) => {
      const dbHealthy = await databaseHealthCheck();
      res.status(dbHealthy ? 200 : 503).json({
        success: true,
        status: dbHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
        database: dbHealthy ? 'connected' : 'disconnected',
      });
    });

    // API routes
    this.app.use(`/api/${apiVersion}/auth`, authRoutes);
    this.app.use(`/api/${apiVersion}/transactions`, transactionRoutes);
    this.app.use(`/api/${apiVersion}/budgets`, budgetRoutes);

    // 404 handler
    this.app.use(notFoundHandler);
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();

      // Start server
      this.app.listen(env.PORT, () => {
        logger.info(`
╔════════════════════════════════════════╗
║   🚀 Server Started Successfully!      ║
╠════════════════════════════════════════╣
║  Environment: ${env.NODE_ENV.padEnd(24)} ║
║  Port: ${String(env.PORT).padEnd(31)} ║
║  API Version: ${env.API_VERSION.padEnd(24)} ║
║  URL: http://localhost:${env.PORT}       ║
╚════════════════════════════════════════╝
        `);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(): Promise<void> {
    logger.info('Shutting down server...');
    process.exit(0);
  }
}

// Start server
const server = new Server();
server.start();
