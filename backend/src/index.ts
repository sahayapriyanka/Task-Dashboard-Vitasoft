// ============================================================
// index.ts - Express application entry point
// Sets up middleware, routes, Swagger UI, and starts the server
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { swaggerSpec } from './config/swagger';
import { testConnection } from './config/database';

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

// ── Security headers ─────────────────────────────────────────
// helmet adds a set of HTTP headers that protect against common web vulnerabilities
app.use(
  helmet({
    // Allow Swagger UI to load its own CSS/JS from CDN
    contentSecurityPolicy: false,
  })
);

// ── CORS ──────────────────────────────────────────────────────
// Allow requests from the React dev server only
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Rate limiting ─────────────────────────────────────────────
// Protect auth endpoints from brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 20, // max 20 requests per window
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter for task endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Swagger UI (API documentation) ───────────────────────────
// Available at http://localhost:5000/api-docs
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { background-color: #0f172a; }',
    customSiteTitle: 'Task Dashboard API Docs',
  })
);

// Raw OpenAPI JSON spec endpoint
app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', apiLimiter, taskRoutes);

// ── Error handling ────────────────────────────────────────────
// 404 handler – must come after all valid routes
app.use(notFoundHandler);
// Global error handler – must be last
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────
const startServer = async () => {
  try {
    // Test database connection before starting server
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running at http://localhost:${PORT}`);
      console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV ?? 'development'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
