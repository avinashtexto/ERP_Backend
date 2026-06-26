import { type JwtPayload } from 'jsonwebtoken';

import { userSessions, adminSessions } from '@/shared/database/schemas/auth.schema.js';

export type UserSession = typeof userSessions.$inferSelect;
export type AdminSession = typeof adminSessions.$inferSelect;

export interface DecodedToken extends JwtPayload {
  id: number | string;
  username: string;
  role: 'admin' | 'sal_employee' | 'book';
  sid?: number;
}

export interface LoginResult {
  user: any;
  role: 'admin' | 'sal_employee' | 'book';
}
