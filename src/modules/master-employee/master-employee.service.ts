/**
 * master-employee.service.ts
 * Database transaction logic for master-employee.
 * Imports the dynamic tenant-routing db client and runs queries.
 */

import bcrypt from 'bcrypt';
import { eq, and, ne, sql, asc } from 'drizzle-orm';

import { db } from '../../config/db.config.js';
import {
  salEmployee,
  sal_emp_contact,
  sal_emp_documents,
} from '../../shared/database/schemas/index.js';

import type { EmployeeCore, EmployeeFull } from './master-employee.types.js';

export async function getEmployee(pk_emp_id: number): Promise<EmployeeFull | null> {
  const [employeeRow] = await db
    .select()
    .from(salEmployee)
    .where(eq(salEmployee.pk_emp_id, pk_emp_id))
    .limit(1);

  if (!employeeRow) return null;

  const contacts = await db
    .select({
      fk_moc_id: sal_emp_contact.fk_moc_id,
      contact: sal_emp_contact.contact,
      ext: sal_emp_contact.ext,
      sr_no: sal_emp_contact.sr_no,
    })
    .from(sal_emp_contact)
    .where(eq(sal_emp_contact.fk_emp_id, pk_emp_id));

  const documents = await db
    .select({
      fk_dt_id: sal_emp_documents.fk_dt_id,
      doc_file: sal_emp_documents.doc_file,
      valid_until: sal_emp_documents.valid_until,
    })
    .from(sal_emp_documents)
    .where(eq(sal_emp_documents.fk_emp_id, pk_emp_id));

  return {
    ...employeeRow,
    contacts,
    documents,
  } as unknown as EmployeeFull;
}

export async function listEmployees(
  filters?: { employee?: string; emp_code?: string },
  page = 1,
  pageSize = 50,
) {
  const offset = (page - 1) * pageSize;
  const conditions = [];

  if (filters?.employee) {
    conditions.push(
      sql`lower(${salEmployee.employee}) like ${`%${filters.employee.toLowerCase()}%`}`,
    );
  }
  if (filters?.emp_code) {
    conditions.push(
      sql`lower(${salEmployee.emp_code}) like ${`%${filters.emp_code.toLowerCase()}%`}`,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select()
    .from(salEmployee)
    .where(whereClause)
    .orderBy(asc(salEmployee.employee))
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(salEmployee)
    .where(whereClause);

  const total = countResult[0] ? Number(countResult[0].count) : 0;

  return {
    data,
    total,
    page,
    pageSize,
  };
}

export async function createEmployee(data: any, currentUserId: string, setId: string) {
  // Hash password if provided
  const hashedPassword = data.password ? await bcrypt.hash(String(data.password).trim(), 10) : '';

  const insertData = {
    ...data,
    password: hashedPassword,
    fk_user_id: parseInt(currentUserId, 10) || 1,
    fk_set_id: parseInt(setId, 10) || 1,
    date_time_stamp: new Date(),
    last_status: 'Added',
  };

  // Remove relationships to insert separately
  delete insertData.contacts;
  delete insertData.documents;

  const [newEmp] = await db
    .insert(salEmployee)
    .values(insertData)
    .returning({ pk_emp_id: salEmployee.pk_emp_id });

  if (!newEmp) {
    throw new Error('Failed to insert employee');
  }

  const pk_emp_id = newEmp.pk_emp_id;

  // Insert contacts
  if (data.contacts && data.contacts.length > 0) {
    const contactValues = data.contacts.map((c: any) => ({
      fk_emp_id: pk_emp_id,
      fk_moc_id: c.fk_moc_id,
      contact: c.contact,
      ext: c.ext || '',
      sr_no: c.sr_no,
    }));
    await db.insert(sal_emp_contact).values(contactValues);
  }

  // Insert documents
  if (data.documents && data.documents.length > 0) {
    const docValues = data.documents.map((d: any) => ({
      fk_emp_id: pk_emp_id,
      fk_dt_id: d.fk_dt_id,
      doc_file: d.doc_file,
      valid_until: d.valid_until ? new Date(d.valid_until) : null,
    }));
    await db.insert(sal_emp_documents).values(docValues);
  }

  return await getEmployee(pk_emp_id);
}

export async function updateEmployee(
  pk_emp_id: number,
  data: any,
  currentUserId: string,
  setId: string,
) {
  const updateData = {
    ...data,
    fk_user_id: parseInt(currentUserId, 10) || 1,
    fk_set_id: parseInt(setId, 10) || 1,
    date_time_stamp: new Date(),
    last_status: 'Edited',
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(String(data.password).trim(), 10);
  }

  delete updateData.contacts;
  delete updateData.documents;

  await db.update(salEmployee).set(updateData).where(eq(salEmployee.pk_emp_id, pk_emp_id));

  // Replace contacts
  if (data.contacts !== undefined) {
    await db.delete(sal_emp_contact).where(eq(sal_emp_contact.fk_emp_id, pk_emp_id));
    if (data.contacts.length > 0) {
      const contactValues = data.contacts.map((c: any) => ({
        fk_emp_id: pk_emp_id,
        fk_moc_id: c.fk_moc_id,
        contact: c.contact,
        ext: c.ext || '',
        sr_no: c.sr_no,
      }));
      await db.insert(sal_emp_contact).values(contactValues);
    }
  }

  // Replace documents
  if (data.documents !== undefined) {
    await db.delete(sal_emp_documents).where(eq(sal_emp_documents.fk_emp_id, pk_emp_id));
    if (data.documents.length > 0) {
      const docValues = data.documents.map((d: any) => ({
        fk_emp_id: pk_emp_id,
        fk_dt_id: d.fk_dt_id,
        doc_file: d.doc_file,
        valid_until: d.valid_until ? new Date(d.valid_until) : null,
      }));
      await db.insert(sal_emp_documents).values(docValues);
    }
  }

  return await getEmployee(pk_emp_id);
}

export async function deleteEmployee(pk_emp_id: number): Promise<boolean> {
  await db.delete(sal_emp_contact).where(eq(sal_emp_contact.fk_emp_id, pk_emp_id));
  await db.delete(sal_emp_documents).where(eq(sal_emp_documents.fk_emp_id, pk_emp_id));

  const result = await db
    .delete(salEmployee)
    .where(eq(salEmployee.pk_emp_id, pk_emp_id))
    .returning({ pk_emp_id: salEmployee.pk_emp_id });

  return result.length > 0;
}

export async function checkEmpCodeUnique(emp_code: string, excludeId?: number): Promise<boolean> {
  const conditions = [eq(salEmployee.emp_code, emp_code)];
  if (excludeId) {
    conditions.push(ne(salEmployee.pk_emp_id, excludeId));
  }
  const rows = await db
    .select({ pk: salEmployee.pk_emp_id })
    .from(salEmployee)
    .where(and(...conditions))
    .limit(1);

  return rows.length === 0;
}

export async function checkUsernameUnique(username: string, excludeId?: number): Promise<boolean> {
  const conditions = [eq(salEmployee.username, username)];
  if (excludeId) {
    conditions.push(ne(salEmployee.pk_emp_id, excludeId));
  }
  const rows = await db
    .select({ pk: salEmployee.pk_emp_id })
    .from(salEmployee)
    .where(and(...conditions))
    .limit(1);

  return rows.length === 0;
}

export async function getNextEmpCode(): Promise<string> {
  const employees = await db.select({ emp_code: salEmployee.emp_code }).from(salEmployee);

  let maxNum = 0;
  let prefix = 'EMP';
  let length = 3;

  for (const emp of employees) {
    if (!emp.emp_code) continue;
    // Match prefix followed by digits (e.g. EMP001, emp001, etc.)
    const match = emp.emp_code.match(/^([a-zA-Z]*)(\d+)$/);
    if (match && match[1] !== undefined && match[2] !== undefined) {
      const currentPrefix = match[1] || 'EMP';
      const numStr = match[2];
      const num = parseInt(numStr, 10);
      if (num > maxNum) {
        maxNum = num;
        prefix = currentPrefix;
        length = numStr.length;
      }
    }
  }

  const nextNum = maxNum + 1;
  const nextNumStr = String(nextNum).padStart(length, '0');
  return `${prefix}${nextNumStr}`;
}

export async function getDocumentTypes(): Promise<{ fk_dt_id: number; doc_file: string }[]> {
  const defaultDocTypes = [
    { fk_dt_id: 1, doc_file: 'Degree Certificate' },
    { fk_dt_id: 2, doc_file: 'Passport' },
    { fk_dt_id: 3, doc_file: 'Visa' },
    { fk_dt_id: 4, doc_file: 'Aadhar Card' },
    { fk_dt_id: 5, doc_file: 'PAN Card' },
    { fk_dt_id: 6, doc_file: 'Driving License' },
  ];

  const dbDocs = await db
    .select({
      fk_dt_id: sal_emp_documents.fk_dt_id,
      doc_file: sal_emp_documents.doc_file,
    })
    .from(sal_emp_documents)
    .groupBy(sal_emp_documents.fk_dt_id, sal_emp_documents.doc_file);

  const merged = [...defaultDocTypes];
  for (const dbDoc of dbDocs) {
    if (!merged.some((d) => d.fk_dt_id === dbDoc.fk_dt_id)) {
      merged.push({
        fk_dt_id: dbDoc.fk_dt_id,
        doc_file: dbDoc.doc_file,
      });
    }
  }

  return merged;
}
