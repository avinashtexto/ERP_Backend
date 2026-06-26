import bcrypt from 'bcrypt';
import { and, asc, eq, ilike, ne, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { db } from '../../config/db.config.js';
import { app_questions } from '../../shared/database/schemas/app-questions.schema.js';
import { appUser as app_user } from '../../shared/database/schemas/app-user.schema.js';
import { email_configuration } from '../../shared/database/schemas/email-config.schema.js';
import { sal_employee } from '../../shared/database/schemas/index.js';
import { userDevices } from '../../shared/database/schemas/user-devices.schema.js';

import { type UserFilterParams } from './users.types.js';

const creator_user = alias(app_user, 'creator_user');

// ============================================================
// USER CRUD
// ============================================================

export async function getUsers(
  filters: UserFilterParams,
  page = 1,
  page_size = 50,
  currentUserId?: string,
) {
  const offset = (page - 1) * page_size;

  const conditions = [];
  if (filters.username) {
    conditions.push(ilike(app_user.username, `%${filters.username}%`));
  }
  if (filters.employee) {
    conditions.push(ilike(sal_employee.employee, `%${filters.employee}%`));
  }
  if (filters.creator) {
    conditions.push(ilike(creator_user.username, `%${filters.creator}%`));
  }
  if (filters.last_status) {
    conditions.push(eq(app_user.last_status, filters.last_status));
  }
  if (filters.date_time_stamp) {
    conditions.push(sql`DATE(${app_user.date_time_stamp}) = ${filters.date_time_stamp}`);
  }

  const where_clause = conditions.length > 0 ? and(...conditions) : undefined;

  const users = await db
    .select({
      pk_user_id: app_user.pk_user_id,
      fk_emp_id: sql<number | null>`CAST(${app_user.fk_emp_id} AS integer)`,
      employee: sal_employee.employee,
      username: app_user.username,
      password: app_user.password,
      mobile: app_user.mobile,
      fk_ec_id: sql<number | null>`CAST(${app_user.fk_ec_id} AS integer)`,
      email: email_configuration.from_email,
      date_time_stamp: app_user.date_time_stamp,
      fk_user_id: app_user.fk_user_id,
      last_status: app_user.last_status,
      answer: app_user.answer,
      security_question_id: app_user.security_question_id,
      security_question: app_user.security_question,
      creator: creator_user.username,
    })
    .from(app_user)
    .leftJoin(sal_employee, eq(app_user.fk_emp_id, sal_employee.pk_emp_id))
    .leftJoin(creator_user, eq(app_user.fk_user_id, creator_user.pk_user_id))
    .leftJoin(email_configuration, eq(app_user.fk_ec_id, email_configuration.pk_ec_id))
    .where(where_clause)
    .orderBy(asc(app_user.username))
    .limit(page_size)
    .offset(offset);

  const total_result = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(app_user)
    .leftJoin(sal_employee, eq(app_user.fk_emp_id, sal_employee.pk_emp_id))
    .leftJoin(creator_user, eq(app_user.fk_user_id, creator_user.pk_user_id))
    .leftJoin(email_configuration, eq(app_user.fk_ec_id, email_configuration.pk_ec_id))
    .where(where_clause);

  const [totalCount] = total_result;
  const total = totalCount ? Number(totalCount.count) : 0;

  return {
    data: users,
    total,
    page,
    pageSize: page_size,
  };
}

export async function get(pk_user_id: number | string) {
  const id = typeof pk_user_id === 'string' ? parseInt(pk_user_id, 10) : pk_user_id;
  const result = await db
    .select({
      pk_user_id: app_user.pk_user_id,
      fk_emp_id: sql<number | null>`CAST(${app_user.fk_emp_id} AS integer)`,
      employee: sal_employee.employee,
      username: app_user.username,
      password: app_user.password,
      mobile: app_user.mobile,
      fk_ec_id: sql<number | null>`CAST(${app_user.fk_ec_id} AS integer)`,
      email: email_configuration.from_email,
      date_time_stamp: app_user.date_time_stamp,
      fk_user_id: app_user.fk_user_id,
      last_status: app_user.last_status,
      answer: app_user.answer,
      security_question_id: app_user.security_question_id,
      security_question: app_user.security_question,
      creator: creator_user.username,
    })
    .from(app_user)
    .leftJoin(sal_employee, eq(app_user.fk_emp_id, sal_employee.pk_emp_id))
    .leftJoin(creator_user, eq(app_user.fk_user_id, creator_user.pk_user_id))
    .leftJoin(email_configuration, eq(app_user.fk_ec_id, email_configuration.pk_ec_id))
    .where(eq(app_user.pk_user_id, id));

  return result[0] || null;
}

export async function isUserNameTaken(username: string, exclude_user_id?: number | string) {
  const conditions = [eq(app_user.username, username)];

  if (exclude_user_id) {
    const id =
      typeof exclude_user_id === 'string' ? parseInt(exclude_user_id, 10) : exclude_user_id;
    conditions.push(ne(app_user.pk_user_id, id));
  }

  const result = await db
    .select({
      pk_user_id: app_user.pk_user_id,
    })
    .from(app_user)
    .where(and(...conditions));

  return result.length > 0;
}

export async function createUser(data: any, currentUserId?: string) {
  const hashedPassword = data.password ? await bcrypt.hash(String(data.password).trim(), 10) : null;
  const insertData: any = {
    username: data.username,
    password: hashedPassword,
    answer: data.answer || null,
    mobile: data.mobile || null,
    fk_emp_id: data.fk_emp_id ? String(data.fk_emp_id) : null,
    fk_ec_id: data.fk_ec_id ? String(data.fk_ec_id) : null,
    fk_user_id: currentUserId ? parseInt(currentUserId, 10) : null,
    last_status: 'Added',
    date_time_stamp: new Date(),
    security_question_id: data.security_question_id ? Number(data.security_question_id) : null,
    security_question: data.security_question || null,
  };

  const result = await db
    .insert(app_user)
    .values(insertData)
    .returning({ pk_user_id: app_user.pk_user_id });
  const [newUser] = result;
  if (!newUser) {
    throw new Error('Failed to create user');
  }
  return await get(newUser.pk_user_id);
}

export async function updateUser(pk_user_id: number | string, data: any, currentUserId?: string) {
  const id = typeof pk_user_id === 'string' ? parseInt(pk_user_id, 10) : pk_user_id;
  const updateData: any = {
    last_status: 'Edited',
    date_time_stamp: new Date(),
  };

  if (data.username !== undefined) updateData.username = data.username;
  if (data.password !== undefined) {
    updateData.password = data.password
      ? await bcrypt.hash(String(data.password).trim(), 10)
      : null;
  }
  if (data.answer !== undefined) updateData.answer = data.answer;
  if (data.mobile !== undefined) updateData.mobile = data.mobile;
  if (data.fk_emp_id !== undefined)
    updateData.fk_emp_id = data.fk_emp_id ? String(data.fk_emp_id) : null;
  if (data.fk_ec_id !== undefined)
    updateData.fk_ec_id = data.fk_ec_id ? String(data.fk_ec_id) : null;
  if (data.security_question_id !== undefined)
    updateData.security_question_id = data.security_question_id
      ? Number(data.security_question_id)
      : null;
  if (data.security_question !== undefined)
    updateData.security_question = data.security_question || null;
  if (currentUserId !== undefined)
    updateData.fk_user_id = currentUserId ? parseInt(currentUserId, 10) : null;

  await db.update(app_user).set(updateData).where(eq(app_user.pk_user_id, id));

  return await get(id);
}

export async function deleteUser(pk_user_id: number | string, currentUserId?: string) {
  const id = typeof pk_user_id === 'string' ? parseInt(pk_user_id, 10) : pk_user_id;
  await db.delete(app_user).where(eq(app_user.pk_user_id, id));

  return true;
}

// ============================================================
// LOOKUP SERVICES
// ============================================================

export async function getEmployees(
  filters?: { employee?: string; emp_code?: string },
  page = 1,
  pageSize = 100,
) {
  const offset = (page - 1) * pageSize;
  const conditions = [];
  if (filters?.employee) {
    conditions.push(ilike(sal_employee.employee, `%${filters.employee}%`));
  }
  if (filters?.emp_code) {
    conditions.push(ilike(sal_employee.emp_code, `%${filters.emp_code}%`));
  }
  const where_clause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select({
      pk_emp_id: sal_employee.pk_emp_id,
      type: sal_employee.type,
      emp_code: sal_employee.emp_code,
      contact_name: sal_employee.employee,
      doj: sal_employee.doj,
    })
    .from(sal_employee)
    .where(where_clause)
    .orderBy(asc(sal_employee.employee))
    .limit(pageSize)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(sal_employee)
    .where(where_clause);
  const total = totalResult[0] ? Number(totalResult[0].count) : 0;

  return {
    data,
    total,
    page,
    pageSize,
  };
}

export async function getEmailConfigurations() {
  return await db
    .select({
      pk_ec_id: sql<number>`CAST(${email_configuration.pk_ec_id} AS integer)`,
      from_email: email_configuration.from_email,
    })
    .from(email_configuration)
    .orderBy(asc(email_configuration.from_email));
}

export async function getSecurityQuestions() {
  return await db
    .select({
      pk_question_id: app_questions.pk_question_id,
      questions: app_questions.questions,
    })
    .from(app_questions)
    .orderBy(asc(app_questions.questions));
}

export async function getAllUsersForExport(filters: UserFilterParams, currentUserId?: string) {
  const conditions = [];
  if (filters.username) {
    conditions.push(ilike(app_user.username, `%${filters.username}%`));
  }
  if (filters.employee) {
    conditions.push(ilike(sal_employee.employee, `%${filters.employee}%`));
  }
  if (filters.creator) {
    conditions.push(ilike(creator_user.username, `%${filters.creator}%`));
  }
  if (filters.last_status) {
    conditions.push(eq(app_user.last_status, filters.last_status));
  }
  if (filters.date_time_stamp) {
    conditions.push(sql`DATE(${app_user.date_time_stamp}) = ${filters.date_time_stamp}`);
  }

  const where_clause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select({
      pk_user_id: app_user.pk_user_id,
      fk_emp_id: sql<number | null>`CAST(${app_user.fk_emp_id} AS integer)`,
      employee: sal_employee.employee,
      username: app_user.username,
      password: app_user.password,
      mobile: app_user.mobile,
      fk_ec_id: sql<number | null>`CAST(${app_user.fk_ec_id} AS integer)`,
      email: email_configuration.from_email,
      date_time_stamp: app_user.date_time_stamp,
      fk_user_id: app_user.fk_user_id,
      last_status: app_user.last_status,
      answer: app_user.answer,
      security_question_id: app_user.security_question_id,
      security_question: app_user.security_question,
      creator: creator_user.username,
    })
    .from(app_user)
    .leftJoin(sal_employee, eq(app_user.fk_emp_id, sal_employee.pk_emp_id))
    .leftJoin(creator_user, eq(app_user.fk_user_id, creator_user.pk_user_id))
    .leftJoin(email_configuration, eq(app_user.fk_ec_id, email_configuration.pk_ec_id))
    .where(where_clause)
    .orderBy(asc(app_user.username));
}

export async function getByEmpId(fk_emp_id: number | string) {
  const empId = typeof fk_emp_id === 'string' ? parseInt(fk_emp_id, 10) : fk_emp_id;
  const result = await db
    .select({
      pk_user_id: app_user.pk_user_id,
      fk_emp_id: sql<number | null>`CAST(${app_user.fk_emp_id} AS integer)`,
      employee: sal_employee.employee,
      username: app_user.username,
      mobile: app_user.mobile,
      fk_ec_id: sql<number | null>`CAST(${app_user.fk_ec_id} AS integer)`,
      email: app_user.email,
      date_time_stamp: app_user.date_time_stamp,
      fk_user_id: app_user.fk_user_id,
      last_status: app_user.last_status,
      emp_code: sal_employee.emp_code,
      photo: sal_employee.photo,
      doj: sal_employee.doj,
      dob: sal_employee.dob,
      blood_grp: sal_employee.blood_grp,
      aadhar: sal_employee.aadhar,
      pan_no: sal_employee.pan_no,
      p_address: sal_employee.p_address,
      n_address: sal_employee.n_address,
      pf_no: sal_employee.pf_no,
      esic_no: sal_employee.esic_no,
      account_no: sal_employee.account_no,
      type: sal_employee.type,
      gender: sal_employee.gender,
      martial_status: sal_employee.martial_status,
      experience: sal_employee.experience,
    })
    .from(app_user)
    .leftJoin(sal_employee, eq(app_user.fk_emp_id, sal_employee.pk_emp_id))
    .leftJoin(email_configuration, eq(app_user.fk_ec_id, email_configuration.pk_ec_id))
    .where(eq(sql<number>`CAST(${app_user.fk_emp_id} AS integer)`, empId));

  return result[0] || null;
}

export async function updateByEmpId(fk_emp_id: number | string, data: any, currentUserId?: string) {
  const empId = typeof fk_emp_id === 'string' ? parseInt(fk_emp_id, 10) : fk_emp_id;

  // Find the user first
  const user = await getByEmpId(empId);
  if (!user) {
    throw new Error('Employee profile not found');
  }

  // Update app_user
  const userUpdate: any = {
    last_status: 'Edited',
    date_time_stamp: new Date(),
  };
  if (data.username !== undefined) userUpdate.username = data.username;
  if (data.mobile !== undefined) userUpdate.mobile = data.mobile;
  if (data.email !== undefined) userUpdate.email = data.email;

  await db.update(app_user).set(userUpdate).where(eq(app_user.pk_user_id, user.pk_user_id));

  // Update sal_employee
  const empUpdate: any = {
    last_status: 'Edited',
    date_time_stamp: new Date(),
  };
  if (data.employeeName !== undefined) empUpdate.employee = data.employeeName;
  if (data.mobile !== undefined) empUpdate.wp = data.mobile;
  if (data.profileImageUrl !== undefined) empUpdate.photo = data.profileImageUrl;
  if (data.dob !== undefined) empUpdate.dob = data.dob ? new Date(data.dob) : null;
  if (data.bloodGroup !== undefined) empUpdate.blood_grp = data.bloodGroup;
  if (data.aadhar !== undefined) empUpdate.aadhar = data.aadhar;
  if (data.pan !== undefined) empUpdate.pan_no = data.pan;
  if (data.permanentAddress !== undefined) empUpdate.p_address = data.permanentAddress;
  if (data.presentAddress !== undefined) empUpdate.n_address = data.presentAddress;

  await db.update(sal_employee).set(empUpdate).where(eq(sal_employee.pk_emp_id, empId));

  return await getByEmpId(empId);
}

export async function registerDeviceToken(userId: number, deviceToken: string, deviceType?: string) {
  const normalizedType = deviceToken ? (deviceType || 'android').toLowerCase() : 'android';
  
  // Upsert the device token: if it already exists, update user_id and updated_at
  await db
    .insert(userDevices)
    .values({
      user_id: userId,
      device_token: deviceToken,
      device_type: normalizedType,
      updated_at: new Date(),
    })
    .onConflictDoUpdate({
      target: userDevices.device_token,
      set: {
        user_id: userId,
        device_type: normalizedType,
        updated_at: new Date(),
      },
    });
}

