// ============================================================
// middleware/validate.ts - express-validator result checker
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../types';

/**
 * validate middleware
 *
 * Must be placed AFTER express-validator chain calls.
 * Collects all validation errors and responds with 422 if any exist.
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg as string);
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed.',
      errors: messages,
    };
    res.status(422).json(response);
    return;
  }
  next();
};
