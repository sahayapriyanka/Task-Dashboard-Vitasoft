// ============================================================
// controllers/authController.ts - Register & Login handlers
// ============================================================

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { repository } from '../config/repository';
import {
  RegisterBody,
  LoginBody,
  ApiResponse,
  AuthResponseData,
  JwtPayload,
  User,
} from '../types';

/** Number of salt rounds for bcrypt hashing */
const SALT_ROUNDS = 12;

/**
 * POST /auth/register
 *
 * Creates a new user account and returns a JWT token.
 * Rejects duplicate email addresses with a 409 status.
 */
export const register = async (
  req: Request<Record<string, never>, ApiResponse<AuthResponseData>, RegisterBody>,
  res: Response<ApiResponse<AuthResponseData>>
): Promise<void> => {
  const { email, password, name } = req.body;

  // Prevent duplicate registrations
  const existing = await repository.findUserByEmail(email);
  if (existing) {
    res.status(409).json({
      success: false,
      message: 'An account with this email already exists.',
    });
    return;
  }

  // Hash the password before persisting
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser: User = {
    id: uuidv4(),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await repository.saveUser(newUser);

  // Build JWT payload (never include the password hash)
  const payload: JwtPayload = {
    userId: newUser.id,
    email: newUser.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET ?? '', {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
  });

  // Return user without passwordHash
  const { passwordHash: _omit, ...safeUser } = newUser;

  res.status(201).json({
    success: true,
    data: { token, user: safeUser },
    message: 'Account created successfully.',
  });
};

/**
 * POST /auth/login
 *
 * Validates credentials and returns a fresh JWT token.
 * Uses a generic error message to prevent user enumeration.
 */
export const login = async (
  req: Request<Record<string, never>, ApiResponse<AuthResponseData>, LoginBody>,
  res: Response<ApiResponse<AuthResponseData>>
): Promise<void> => {
  const { email, password } = req.body;

  // Lookup user
  const user = await repository.findUserByEmail(email);
  if (!user) {
    // Generic message to prevent user enumeration
    res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
    return;
  }

  // Compare provided password with stored hash
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
    return;
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET ?? '', {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
  });

  const { passwordHash: _omit, ...safeUser } = user;

  res.json({
    success: true,
    data: { token, user: safeUser },
    message: 'Login successful.',
  });
};

/**
 * GET /auth/me
 *
 * Returns the currently authenticated user's profile.
 * Requires a valid JWT (handled by authenticate middleware).
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await repository.findUserById(req.user!.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const { passwordHash: _omit, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
};
