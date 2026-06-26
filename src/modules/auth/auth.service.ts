import bcrypt from 'bcrypt';
import { eq, or, and, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import type { LoginResult, UserSession } from './auth.types.js';
import { getPhoneDigits } from './auth.utils.js';

import { db, commonDb } from '@/config/db.config.js';
import type { Book } from '@/modules/book/book.types.js';
import {
  accountBookTable,
  activeServerTable,
} from '@/shared/database/schemas/account-book.schema.js';
import {
  appUser,
  userSessions,
  adminSessions,
  salEmployee,
  app_questions,
} from '@/shared/database/schemas/index.js';
import { cacheManager } from '@/shared/utils/cache.manager.js';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'attendance_secret_key_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'attendance_refresh_secret_key_2024';
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '1d';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

export async function validateBookCredentials(
  username: string,
  password: string,
  bookId: number | string,
): Promise<LoginResult | null> {
  const parsedBookId = typeof bookId === 'number' ? bookId : parseInt(String(bookId).trim(), 10);
  if (isNaN(parsedBookId)) return null;

  const cacheKey = `book:${parsedBookId}:${username}`;
  const cached = cacheManager.get<any>(cacheKey);

  if (cached) {
    const isPasswordMatch = await bcrypt.compare(password.trim(), cached.password.trim());
    if (isPasswordMatch) {
      return {
        user: cached,
        role: 'book',
      };
    }
  }

  // Fallback to database query on AAAcommon
  const results = await commonDb
    .select({
      id: accountBookTable.pk_book_id,
      username: activeServerTable.user_id,
      email: activeServerTable.email,
      mobile: activeServerTable.mobile,
      password: activeServerTable.password,
      book_name: accountBookTable.book_name,
      database_name: accountBookTable.database_name,
    })
    .from(accountBookTable)
    .innerJoin(activeServerTable, eq(activeServerTable.fk_book_id, accountBookTable.pk_book_id))
    .where(
      and(
        eq(accountBookTable.pk_book_id, parsedBookId),
        eq(activeServerTable.user_id, username.trim()),
      ),
    )
    .limit(1);

  const matchedBook = results[0];
  if (!matchedBook) return null;

  const isPasswordMatch = await bcrypt.compare(password.trim(), matchedBook.password.trim());
  if (!isPasswordMatch) return null;

  // Cache the valid book (including the hash)
  cacheManager.set(cacheKey, matchedBook, 300);

  return {
    user: matchedBook,
    role: 'book',
  };
}

export async function validateUserCredentials(
  loginIdentifier: string,
  password: string,
): Promise<LoginResult | null> {
  const identifier = loginIdentifier.trim();
  const trimmedPass = password.trim();

  // Try matching against sal_employee first (for mobile/employee logins)
  const empResults = await db
    .select()
    .from(salEmployee)
    .where(
      or(
        sql`lower(trim(${salEmployee.username})) = lower(${identifier})`,
        sql`lower(trim(${salEmployee.emp_code})) = lower(${identifier})`
      )
    )
    .limit(1);

  const employee = empResults[0];
  if (employee) {
    let isPasswordMatch = false;
    if (employee.password) {
      const dbPasswordTrimmed = employee.password.trim();
      try {
        isPasswordMatch = await bcrypt.compare(trimmedPass, dbPasswordTrimmed);
      } catch {
        isPasswordMatch = dbPasswordTrimmed === trimmedPass;
      }
      if (!isPasswordMatch && !dbPasswordTrimmed.startsWith('$2')) {
        isPasswordMatch = dbPasswordTrimmed === trimmedPass;
      }
    }

    if (isPasswordMatch) {
      return {
        user: {
          ...employee,
          pk_user_id: employee.pk_emp_id,
          fk_emp_id: employee.pk_emp_id,
        },
        role: 'sal_employee',
      };
    }
  }

  // Fallback to app_user (for admin/book logins)
  const phoneDigits = getPhoneDigits(identifier);

  const usernameMatch = sql`lower(trim(${appUser.username})) = lower(${identifier})`;
  const emailMatch = sql`lower(trim(${appUser.email})) = lower(${identifier})`;
  const matchConditions = [usernameMatch, emailMatch];

  if (phoneDigits) {
    matchConditions.push(
      sql`regexp_replace(coalesce(${appUser.mobile}, ''), '[^0-9]', '', 'g') = ${phoneDigits}`,
    );
  }

  const loginMatch = or(...matchConditions);

  const results = await db
    .select({
      pk_user_id: appUser.pk_user_id,
      username: appUser.username,
      password: appUser.password,
      answer: appUser.answer,
      security_question: appUser.security_question,
      sal: appUser.sal,
      date_time_stamp: appUser.date_time_stamp,
      fk_user_id: appUser.fk_user_id,
      last_status: appUser.last_status,
      fk_ec_id: appUser.fk_ec_id,
      own_records: appUser.own_records,
      other_records: appUser.other_records,
      mobile: appUser.mobile,
      email: appUser.email,
      fk_emp_id: appUser.fk_emp_id,
      security_question_id: appUser.security_question_id,
      emp_code: salEmployee.emp_code,
    })
    .from(appUser)
    .leftJoin(salEmployee, eq(appUser.fk_emp_id, salEmployee.pk_emp_id))
    .where(
      and(
        loginMatch,
        or(
          sql`${appUser.fk_emp_id} is not null`,
          and(
            sql`coalesce(nullif(trim(${appUser.fk_ec_id}::text), ''), '0')::int = 1`,
            sql`${appUser.fk_emp_id} is null`,
          ),
        ),
      ),
    )
    .limit(1);

  const user = results[0];
  if (!user) return null;

  let isPasswordMatch = false;
  if (user.password) {
    const dbPasswordTrimmed = user.password.trim();
    try {
      isPasswordMatch = await bcrypt.compare(trimmedPass, dbPasswordTrimmed);
    } catch {
      // Fallback in case stored password is not in bcrypt hash format
      isPasswordMatch = dbPasswordTrimmed === trimmedPass;
    }
    // Secondary safety fallback if the string does not match the bcrypt header format
    if (!isPasswordMatch && !dbPasswordTrimmed.startsWith('$2')) {
      isPasswordMatch = dbPasswordTrimmed === trimmedPass;
    }
  }

  if (!isPasswordMatch) return null;

  const fkECIdVal = user.fk_ec_id ? Number(user.fk_ec_id) : 0;
  const isAdmin =
    fkECIdVal === 1 ||
    (fkECIdVal === 1 && user.fk_emp_id === null);
  return {
    user,
    role: isAdmin ? 'admin' : 'sal_employee',
  };
}

export async function createEmployeeSession(user_id: number, refresh_token: string): Promise<void> {
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await db.insert(userSessions).values({
    user_id,
    refresh_token,
    expires_at,
  });
}

export async function deleteEmployeeSession(refresh_token: string): Promise<void> {
  await db.delete(userSessions).where(eq(userSessions.refresh_token, refresh_token));
}

export async function findEmployeeSession(refresh_token: string): Promise<UserSession | null> {
  const results = await db
    .select()
    .from(userSessions)
    .where(
      and(eq(userSessions.refresh_token, refresh_token), sql`${userSessions.expires_at} > now()`),
    )
    .limit(1);
  return results[0] || null;
}

export async function createAdminSession(
  adminUser: any,
  deviceInfo: string | null = null,
): Promise<any> {
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(adminSessions)
      .values({
        admin_user_id: adminUser.pk_user_id,
        refresh_token: 'pending',
        deviceInfo,
        expires_at,
      })
      .returning({ session_id: adminSessions.session_id });

    if (!inserted) {
      throw new Error('Failed to create admin session');
    }
    const session_id = inserted.session_id;

    const tokenPayload = {
      id: adminUser.pk_user_id,
      username: adminUser.username,
      role: 'admin',
      sid: session_id,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRATION });
    const refresh_token = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRATION,
    });

    await tx
      .update(adminSessions)
      .set({ refresh_token: refresh_token })
      .where(eq(adminSessions.session_id, session_id));

    return {
      session_id,
      token,
      refresh_token,
      expiresIn: JWT_ACCESS_EXPIRATION,
    };
  });
}

export async function logoutAdmin(refresh_token?: string, session_id?: number): Promise<void> {
  if (refresh_token) {
    await db.delete(adminSessions).where(eq(adminSessions.refresh_token, refresh_token));
  } else if (session_id) {
    await db.delete(adminSessions).where(eq(adminSessions.session_id, session_id));
  }
}

export async function refreshAdminSession(refresh_token: string): Promise<any> {
  const results = await db
    .select()
    .from(adminSessions)
    .where(
      and(eq(adminSessions.refresh_token, refresh_token), sql`${adminSessions.expires_at} > now()`),
    )
    .limit(1);

  const session = results[0];
  if (!session) {
    const error: any = new Error('Session expired or invalid. Please sign in again.');
    error.statusCode = 403;
    throw error;
  }

  let decoded: any;
  try {
    decoded = jwt.verify(refresh_token, JWT_REFRESH_SECRET);
  } catch {
    await logoutAdmin(refresh_token);
    const error: any = new Error('Session expired or invalid. Please sign in again.');
    error.statusCode = 403;
    throw error;
  }

  if (decoded.sid && Number(decoded.sid) !== Number(session.session_id)) {
    await logoutAdmin(refresh_token);
    const error: any = new Error('Session expired or invalid. Please sign in again.');
    error.statusCode = 403;
    throw error;
  }

  const adminResults = await db
    .select()
    .from(appUser)
    .where(eq(appUser.pk_user_id, session.admin_user_id))
    .limit(1);

  const adminUser = adminResults[0];
  if (!adminUser) {
    await logoutAdmin(refresh_token);
    const error: any = new Error('Admin account is no longer active.');
    error.statusCode = 403;
    throw error;
  }

  const fkECIdVal = adminUser.fk_ec_id ? Number(adminUser.fk_ec_id) : 0;
  const isAdmin = fkECIdVal === 1;
  if (!isAdmin) {
    await logoutAdmin(refresh_token);
    const error: any = new Error('Admin account is no longer active.');
    error.statusCode = 403;
    throw error;
  }

  await logoutAdmin(undefined, session.session_id);
  return createAdminSession(adminUser, session.deviceInfo);
}

export async function getEmployeeSecurityQuestion(
  username: string,
): Promise<{ question: string } | null> {
  const trimmedUsername = username.trim();

  const results = await db
    .select({
      question: salEmployee.question,
    })
    .from(salEmployee)
    .where(sql`lower(trim(${salEmployee.username})) = lower(${trimmedUsername})`)
    .limit(1);

  const employee = results[0];
  if (!employee) {
    return null;
  }

  return { question: employee.question };
}

export async function validateForgotPasswordCredentials(
  username: string,
  answer: string,
): Promise<{ valid: boolean; user?: any }> {
  const trimmedUsername = username.trim();
  const trimmedAnswer = answer.trim();

  const results = await db
    .select({
      pk_emp_id: salEmployee.pk_emp_id,
      username: salEmployee.username,
      question: salEmployee.question,
      answer: salEmployee.answer,
    })
    .from(salEmployee)
    .where(sql`lower(trim(${salEmployee.username})) = lower(${trimmedUsername})`)
    .limit(1);

  const user = results[0];
  if (!user) {
    return { valid: false };
  }

  const isAnswerMatch = user.answer && user.answer.trim().toLowerCase() === trimmedAnswer.toLowerCase();
  if (!isAnswerMatch) {
    return { valid: false };
  }

  return { valid: true, user };
}

export async function resetUserPassword(
  username: string,
  answer: string,
  new_password: string,
): Promise<{ success: boolean; message?: string }> {
  const validation = await validateForgotPasswordCredentials(
    username,
    answer,
  );

  if (!validation.valid) {
    return { success: false, message: 'Invalid credentials. Please check your information.' };
  }

  // Skip password hashing for abhi
  const hashedPassword = validation.user.username === 'abhi' ? new_password.trim() : await bcrypt.hash(new_password.trim(), 10);

  await db
    .update(salEmployee)
    .set({ password: hashedPassword })
    .where(eq(salEmployee.pk_emp_id, validation.user.pk_emp_id));

  return { success: true, message: 'Password reset successfully.' };
}
