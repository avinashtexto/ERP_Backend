import { eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { db } from '../../config/db.config.js';
import { appUser, salEmployee } from '../../shared/database/schemas/index.js';
import { verifyAccessToken, type AuthenticatedUserPayload } from '../../shared/utils/jwt.util.js'; // Note the mandatory .js suffix

export type AuthenticatedRequest = Request;

/**
 * Authentication Middleware
 * Manages HTTP traffic extraction while relying on specialized utilities for verification.
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    // 1. Header Extraction
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Cookie Extraction Fallback
    if (!token && req.cookies) {
      token = req.cookies.token || req.cookies.accessToken || req.signedCookies?.token;
    }

    // 3. Query Parameter Extraction Fallback
    if (!token && req.query?.token) {
      token = req.query.token as string;
    }

    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.build
        .withStatus(401)
        .withError('UNAUTHORIZED', 'Access token is missing or malformed')
        .fail()
        .send();
    }

    // Delegate verification logic to the isolated crypto utility
    const decoded = verifyAccessToken(token);

    // Check database to ensure user exists
    let user: any;
    if (decoded.role === 'sal_employee') {
      const empId = Number(decoded.fk_emp_id);
      if (!empId || isNaN(empId)) {
        return res.build
          .withStatus(401)
          .withError('UNAUTHORIZED', 'Employee ID missing or invalid in token')
          .fail()
          .send();
      }
      const employees = await db
        .select()
        .from(salEmployee)
        .where(eq(salEmployee.pk_emp_id, empId))
        .limit(1);
      user = employees[0];
      if (user) {
        user.pk_user_id = decoded.id; // ensure pk_user_id is set
        user.fk_emp_id = user.pk_emp_id;
      }
    } else {
      const users = await db
        .select()
        .from(appUser)
        .where(eq(appUser.pk_user_id, decoded.id))
        .limit(1);
      user = users[0];
    }

    if (!user) {
      return res.build
        .withStatus(401)
        .withError('UNAUTHORIZED', 'User not found in database')
        .fail()
        .send();
    }

    const { password: _, ...userWithoutPassword } = user;

    // Attach verified user properties and db record to request context pipeline
    const mergedUser = {
      ...decoded,
      ...userWithoutPassword,
      id: decoded.id ?? decoded.pk_user_id ?? userWithoutPassword.pk_user_id,
    };

    if (mergedUser.fk_emp_id === null || mergedUser.fk_emp_id === undefined) {
      delete (mergedUser as any).fk_emp_id;
    }

    req.user = mergedUser as any;

    return next();
  } catch (error: any) {
    if (error.message === 'MISSING_JWT_SECRET') {
      console.error(
        '[CRITICAL] JWT_ACCESS_SECRET is undefined in deployment environment variables.',
      );
      return res.build
        .withStatus(500)
        .withError('INTERNAL_SERVER_ERROR', 'Authentication system configuration anomaly.')
        .fail()
        .send();
    }

    if (error.message === 'INVALID_PAYLOAD_STRUCTURE') {
      return res.build
        .withStatus(401)
        .withError('INVALID_TOKEN_PAYLOAD', 'The provided token is structured invalidly.')
        .fail()
        .send();
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.build
        .withStatus(401)
        .withError('TOKEN_EXPIRED', 'The provided token has expired.')
        .fail()
        .send();
    }

    return res.build
      .withStatus(401)
      .withError('INVALID_TOKEN', error.message || 'Token verification execution failed.')
      .fail()
      .send();
  }
};
