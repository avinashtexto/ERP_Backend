import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { tenantStorage } from '../../config/db.config.js';

const tenantStorageMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  let bookName: string | null = null;

  // 1. Resolve from headers, query parameters, or payload body
  if (req.headers['x-book-name']) {
    bookName = req.headers['x-book-name'] as string;
  } else if (req.query.book_name) {
    bookName = req.query.book_name as string;
  } else if (req.body && req.body.book_name) {
    bookName = req.body.book_name as string;
  }

  // 2. Resolve from JWT Token payload
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.cookies?.token || req.cookies?.accessToken;

  if (token) {
    try {
      const secret =
        process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'attendance_secret_key_2024';
      const decoded = jwt.verify(token, secret) as any;
      if (decoded && decoded.book_name) {
        bookName = decoded.book_name;
      }
    } catch {
      // Ignore token verification errors
    }
  }

  if (bookName) {
    tenantStorage.run(bookName.trim(), () => {
      next();
    });
  } else {
    next();
  }
};

export { tenantStorageMiddleware };
