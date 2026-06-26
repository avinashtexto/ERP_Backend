import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import {
  loginSchema,
  refreshTokenSchema,
  forgotPasswordValidationSchema,
  resetPasswordSchema,
} from './auth.dto.js';
import * as service from './auth.service.js';
import { sanitizeUserForResponse, resolveLoginIdentifier } from './auth.utils.js';

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'attendance_secret_key_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'attendance_refresh_secret_key_2024';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      console.warn('Login validation failed:', JSON.stringify(parsed.error.issues, null, 2));
      console.warn('Request body:', JSON.stringify(req.body, null, 2));
      res.build
        .withStatus(400)
        .withModule('Auth')
        .withError('INVALID_INPUT', {
          message: 'Username, password, and book_id are required',
          acceptedFields: {
            username: 'required (string)',
            password: 'required (string)',
            book_id: 'required (integer)',
          },
          validationErrors: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
        })
        .fail()
        .send();
      return;
    }

    const loginIdentifier = resolveLoginIdentifier(req.body);
    const password = (req.body.password || req.body.Password || '').trim();

    console.log(`Login attempt for: ${loginIdentifier}`);

    const loginResult = await service.validateUserCredentials(loginIdentifier, password);

    if (loginResult) {
      const { user, role } = loginResult;
      const userId = user.pk_user_id;

      if (role === 'admin') {
        const session = await service.createAdminSession(user, null);

        console.log(`Login successful: ${user.username} (admin, session ${session.sessionId})`);

        res.build
          .withStatus(200)
          .withMessage('Login successful')
          .withModule('Auth')
          .withData({
            access_token: session.token,
            refresh_token: session.refresh_token,
            sessionId: session.sessionId,
            expiresIn: session.expiresIn,
            role: 'admin',
            user: sanitizeUserForResponse(user),
            admin: {
              id: userId,
              username: user.username,
            },
          })
          .success()
          .send();
        return;
      }

      // Employee (role: 'sal_employee')
      const tokenPayload = {
        id: userId,
        username: user.username,
        role: 'sal_employee',
        fk_emp_id: user.fk_emp_id,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });
      const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

      console.log(
        `Book Login successful: ${user.username} (book_name: ${user.book_name}, database: ${user.database_name})`,
      );

      res.build
        .withStatus(200)
        .withMessage('Login successful')
        .withModule('Auth')
        .withData({
          access_token: token,
          refresh_token: refreshToken,
          role,
          user: sanitizeUserForResponse(user),
        })
        .success()
        .send();
      return;
    } else {
      console.log(`Book Login failed for: ${loginIdentifier}`);
      res.build
        .withStatus(404)
        .withMessage('Login Failed, Please try again')
        .withError('NOT_FOUND', 'Login Failed, Please try again')
        .fail()
        .send();
      return;
    }
  } catch (err: any) {
    console.error('Login error:', err);
    const dbCause = err.cause || err;
    console.error('Login DB cause:', dbCause.message || dbCause);
    res.build
      .withStatus(500)
      .withError('LOGIN_FAILED', dbCause.message || err.message)
      .fail()
      .send();
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.build
        .withStatus(401)
        .withError('UNAUTHORIZED', 'Refresh Token is required in the request body')
        .fail()
        .send();
      return;
    }

    const { refreshToken: refreshTokenValue } = parsed.data;

    let decoded: any;
    try {
      decoded = jwt.verify(refreshTokenValue, JWT_REFRESH_SECRET);
    } catch {
      res.build
        .withStatus(401)
        .withError('UNAUTHORIZED', 'Token Expired')
        .withModule('Auth')
        .fail()
        .send();
      return;
    }

    if (decoded.role === 'admin') {
      const session = await service.refreshAdminSession(refreshTokenValue);
      res.build
        .withStatus(200)
        .withMessage('Token refreshed successfully')
        .withModule('Auth')
        .withData({
          token: session.token,
          refreshToken: session.refreshToken,
          sessionId: session.sessionId,
          expiresIn: session.expiresIn,
          role: 'admin',
        })
        .success()
        .send();
      return;
    }

    // Verify employee session exists in DB
    const employeeSession = await service.findEmployeeSession(refreshTokenValue);
    if (!employeeSession) {
      res.build
        .withStatus(401)
        .withError('UNAUTHORIZED', 'Token Expired')
        .withModule('Auth')
        .fail()
        .send();
      return;
    }

    const newToken = jwt.sign(
      {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role || 'sal_employee',
        fk_emp_id: decoded.fk_emp_id,
      },
      JWT_SECRET,
      { expiresIn: '1d' },
    );

    res.build
      .withStatus(200)
      .withMessage('Token refreshed successfully')
      .withData({ token: newToken, role: decoded.role || 'sal_employee' })
      .withModule('Auth')
      .success()
      .send();
  } catch (err: any) {
    res.build
      .withStatus(500)
      .withError('REFRESH_TOKEN_FAILED', err.message || 'Token Expired')
      .withModule('Auth')
      .fail()
      .send();
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken: refreshTokenValue } = req.body || {};

    if (refreshTokenValue) {
      try {
        const decoded: any = jwt.verify(refreshTokenValue, JWT_REFRESH_SECRET);
        if (decoded.role === 'admin') {
          await service.logoutAdmin(refreshTokenValue, decoded.sid);
          console.log(`Admin logout successful: ${decoded.username} (Auth)`);
          res.build
            .withStatus(200)
            .withMessage('Logged out successfully')
            .withModule('Auth')
            .success()
            .send();
          return;
        } else {
          // Employee logout by token
          await service.deleteEmployeeSession(refreshTokenValue);
          console.log(`Employee logout successful: ${decoded.username} (Auth)`);
          res.build
            .withStatus(200)
            .withMessage('Logged out successfully')
            .withModule('Auth')
            .success()
            .send();
          return;
        }
      } catch {
        // Fall through
      }
    }

    const user = (req as any).user;
    if (user) {
      if (user.role === 'admin') {
        await service.logoutAdmin(undefined, user.sid);
      } else {
        if (refreshTokenValue) {
          await service.deleteEmployeeSession(refreshTokenValue);
        }
      }
      console.log(`Logout successful for user: ${user.username || 'unknown'} (Auth)`);
    } else {
      console.log(`Logout successful for user: unknown (Auth)`);
    }

    res.build
      .withStatus(200)
      .withMessage('Logged out successfully')
      .withModule('Auth')
      .success()
      .send();
  } catch (err: any) {
    res.build
      .withStatus(500)
      .withError('LOGOUT_FAILED', err.message || 'Token refresh failed')
      .withModule('Auth')
      .fail()
      .send();
  }
}

export async function health(req: Request, res: Response): Promise<void> {
  res.build
    .withStatus(200)
    .withModule('auth')
    .withMessage('Auth module is operational')
    .withModule('Auth')
    .withData({
      status: 'ok',
    })
    .success()
    .send();
}

export async function getSecurityQuestions(req: Request, res: Response): Promise<void> {
  try {
    res.build
      .withStatus(200)
      .withMessage('Employee security questions are stored per employee')
      .withModule('Auth')
      .withData({ message: 'Use getEmployeeSecurityQuestion endpoint with username to fetch employee-specific question' })
      .success()
      .send();
  } catch (err: any) {
    res.build
      .withStatus(500)
      .withError('FETCH_QUESTIONS_FAILED', err.message || 'Failed to fetch security questions')
      .withModule('Auth')
      .fail()
      .send();
  }
}

export async function getEmployeeSecurityQuestion(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      res.build
        .withStatus(400)
        .withModule('Auth')
        .withError('INVALID_INPUT', 'Username is required')
        .fail()
        .send();
      return;
    }

    const result = await service.getEmployeeSecurityQuestion(username);

    if (!result) {
      res.build
        .withStatus(404)
        .withMessage('Employee not found')
        .withModule('Auth')
        .withError('EMPLOYEE_NOT_FOUND', 'No employee found with the provided username')
        .fail()
        .send();
      return;
    }

    res.build
      .withStatus(200)
      .withMessage('Security question retrieved successfully')
      .withModule('Auth')
      .withData(result)
      .success()
      .send();
  } catch (err: any) {
    res.build
      .withStatus(500)
      .withError('FETCH_FAILED', err.message || 'Failed to fetch security question')
      .withModule('Auth')
      .fail()
      .send();
  }
}

export async function validateForgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const parsed = forgotPasswordValidationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withModule('Auth')
        .withError('INVALID_INPUT', {
          message: 'Invalid input data',
          validationErrors: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
        })
        .fail()
        .send();
      return;
    }

    const { username, answer } = parsed.data;

    const validation = await service.validateForgotPasswordCredentials(
      username,
      answer,
    );

    if (validation.valid) {
      res.build
        .withStatus(200)
        .withMessage('Credentials validated successfully')
        .withModule('Auth')
        .withData({ valid: true })
        .success()
        .send();
    } else {
      res.build
        .withStatus(400)
        .withMessage('Invalid credentials')
        .withModule('Auth')
        .withError('INVALID_CREDENTIALS', 'Username or security answer is incorrect')
        .fail()
        .send();
    }
  } catch (err: any) {
    res.build
      .withStatus(500)
      .withError('VALIDATION_FAILED', err.message || 'Failed to validate credentials')
      .withModule('Auth')
      .fail()
      .send();
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withModule('Auth')
        .withError('INVALID_INPUT', {
          message: 'Invalid input data',
          validationErrors: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
        })
        .fail()
        .send();
      return;
    }

    const { username, answer, new_password } = parsed.data;

    const result = await service.resetUserPassword(
      username,
      answer,
      new_password,
    );

    if (result.success) {
      res.build
        .withStatus(200)
        .withMessage(result.message || 'Password reset successfully')
        .withModule('Auth')
        .withData({ success: true })
        .success()
        .send();
    } else {
      res.build
        .withStatus(400)
        .withMessage(result.message || 'Password reset failed')
        .withModule('Auth')
        .withError('RESET_FAILED', result.message || 'Invalid credentials')
        .fail()
        .send();
    }
  } catch (err: any) {
    res.build
      .withStatus(500)
      .withError('RESET_FAILED', err.message || 'Failed to reset password')
      .withModule('Auth')
      .fail()
      .send();
  }
}
