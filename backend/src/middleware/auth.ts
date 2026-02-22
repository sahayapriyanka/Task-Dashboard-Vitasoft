// ============================================================
// middleware/auth.ts - JWT authentication middleware
// Applied to all protected routes (everything except /auth/*)
// ============================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, ApiResponse } from '../types';
import { repository } from '../config/repository';

/**
 * Extend Express Request to include the decoded JWT payload
 * after successful authentication.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * authenticate middleware
 *
 * Validates the Authorization: Bearer <token> header.
 * - Returns 401 if the header is missing or malformed.
 * - Returns 401 if the token is expired or invalid.
 * - Returns 401 if the user no longer exists in the database.
 * - Attaches the decoded payload to req.user and calls next() on success.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Ensure the Authorization header is present and well-formed
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const response: ApiResponse = {
      success: false,
      message: 'Access denied. No token provided.',
    };
    res.status(401).json(response);
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET ?? '';

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Ensure the user account still exists (guards against deleted accounts)
    const user = await repository.findUserById(decoded.userId);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User account no longer exists.',
      };
      res.status(401).json(response);
      return;
    }

    // Attach decoded payload for downstream handlers
    req.user = decoded;
    next();
  } catch (err) {
    const isExpired = err instanceof jwt.TokenExpiredError;
    const response: ApiResponse = {
      success: false,
      message: isExpired ? 'Token has expired.' : 'Invalid token.',
    };
    res.status(401).json(response);
  }
};
