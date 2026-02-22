// ============================================================
// middleware/errorHandler.ts - Global error handling middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

/**
 * Global error handler – must be registered LAST in Express.
 * Catches any error thrown or passed via next(err).
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[ErrorHandler]', err.message);

  const response: ApiResponse = {
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'An internal server error occurred.'
        : err.message,
  };

  res.status(500).json(response);
};

/**
 * 404 Not Found handler – registered after all valid routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  };
  res.status(404).json(response);
};
