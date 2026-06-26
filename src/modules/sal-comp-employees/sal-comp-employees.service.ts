import { db } from '../../config/db.config.js';
import { eq, and, ilike, desc, sql, inArray } from 'drizzle-orm';
import {
  sal_emp_complaint,
  sal_comp_employees,
  sal_comp_attachments,
  sal_employee,
} from '../../shared/database/schemas/index.js';
import type {
  CreateComplaintRequest,
  UpdateComplaintRequest,
  ComplaintDTO,
} from './sal-comp-employees.types.js';

/**
 * Creates a complaint with associated employees and attachments in a transaction.
 */
export async function createComplaint(data: CreateComplaintRequest): Promise<string> {
  const comIdStr = data.pk_com_id.toString();

  await db.transaction(async (tx) => {
    // 1. Insert into sal_emp_complaint
    await tx.insert(sal_emp_complaint).values({
      pk_com_id: comIdStr,
      title: data.title,
      description: data.description,
      type: data.type ?? 'complaint',
    });

    // 2. Insert into sal_comp_employees if employees are provided
    if (data.employee_ids && data.employee_ids.length > 0) {
      const employeeValues = data.employee_ids.map((empId) => ({
        fk_com_id: comIdStr,
        fk_emp_id: empId,
      }));
      await tx.insert(sal_comp_employees).values(employeeValues);
    }

    // 3. Insert into sal_comp_attachments if attachments are provided
    if (data.attachments && data.attachments.length > 0) {
      const attachmentValues = data.attachments.map((att) => ({
        fk_com_id: comIdStr,
        file_name: att.file_name,
        file_path: att.file_path,
        doc_type: att.doc_type,
      }));
      await tx.insert(sal_comp_attachments).values(attachmentValues);
    }
  });

  return comIdStr;
}

/**
 * Updates a complaint and its associated relations in a transaction.
 */
export async function updateComplaint(id: string, data: UpdateComplaintRequest): Promise<boolean> {
  // Check if complaint exists
  const [existing] = await db
    .select({ pk_com_id: sal_emp_complaint.pk_com_id })
    .from(sal_emp_complaint)
    .where(eq(sal_emp_complaint.pk_com_id, id))
    .limit(1);

  if (!existing) {
    return false;
  }

  await db.transaction(async (tx) => {
    // 1. Update basic complaint information if provided
    if (data.title !== undefined || data.description !== undefined || data.type !== undefined) {
      const updates: Record<string, any> = {};
      if (data.title !== undefined) updates.title = data.title;
      if (data.description !== undefined) updates.description = data.description;
      if (data.type !== undefined) updates.type = data.type;

      await tx.update(sal_emp_complaint).set(updates).where(eq(sal_emp_complaint.pk_com_id, id));
    }

    // 2. Update employee assignments if provided
    if (data.employee_ids !== undefined) {
      // Clear existing associations
      await tx.delete(sal_comp_employees).where(eq(sal_comp_employees.fk_com_id, id));

      // Insert new ones if list is not empty
      if (data.employee_ids.length > 0) {
        const employeeValues = data.employee_ids.map((empId) => ({
          fk_com_id: id,
          fk_emp_id: empId,
        }));
        await tx.insert(sal_comp_employees).values(employeeValues);
      }
    }

    // 3. Update attachments if provided
    if (data.attachments !== undefined) {
      // Clear existing attachments (cascade rules don't auto-clear on update, we do it manually)
      await tx.delete(sal_comp_attachments).where(eq(sal_comp_attachments.fk_com_id, id));

      // Insert new ones if list is not empty
      if (data.attachments.length > 0) {
        const attachmentValues = data.attachments.map((att) => ({
          fk_com_id: id,
          file_name: att.file_name,
          file_path: att.file_path,
          doc_type: att.doc_type,
        }));
        await tx.insert(sal_comp_attachments).values(attachmentValues);
      }
    }
  });

  return true;
}

/**
 * Retrieves a single complaint by ID with all relations.
 */
export async function getComplaintById(id: string): Promise<ComplaintDTO | null> {
  const [complaint] = await db
    .select()
    .from(sal_emp_complaint)
    .where(eq(sal_emp_complaint.pk_com_id, id))
    .limit(1);

  if (!complaint) {
    return null;
  }

  // Fetch employees
  const employees = await db
    .select({
      pk_emp_id: sal_employee.pk_emp_id,
      employee: sal_employee.employee,
      emp_code: sal_employee.emp_code,
    })
    .from(sal_comp_employees)
    .innerJoin(sal_employee, eq(sal_employee.pk_emp_id, sal_comp_employees.fk_emp_id))
    .where(eq(sal_comp_employees.fk_com_id, id));

  // Fetch attachments
  const attachments = await db
    .select({
      pk_att_id: sal_comp_attachments.pk_att_id,
      file_name: sal_comp_attachments.file_name,
      file_path: sal_comp_attachments.file_path,
      doc_type: sal_comp_attachments.doc_type,
      uploaded_at: sal_comp_attachments.uploaded_at,
    })
    .from(sal_comp_attachments)
    .where(eq(sal_comp_attachments.fk_com_id, id));

  return {
    pk_com_id: complaint.pk_com_id,
    title: complaint.title,
    description: complaint.description,
    type: complaint.type,
    created_at: complaint.created_at,
    employees: employees.map((emp) => ({
      pk_emp_id: emp.pk_emp_id,
      employee: emp.employee || '',
      emp_code: emp.emp_code || '',
    })),
    attachments,
  };
}

/**
 * Lists complaints with pagination and filtering by title.
 */
export async function listComplaints(filter: {
  page: number;
  page_size: number;
  title?: string | undefined;
}): Promise<{
  data: ComplaintDTO[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
}> {
  const conditions = [];
  if (filter.title) {
    conditions.push(ilike(sal_emp_complaint.title, `%${filter.title}%`));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 1. Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sal_emp_complaint)
    .where(whereClause);

  const total = Number(countResult?.count || 0);
  const total_pages = Math.ceil(total / filter.page_size);

  // 2. Fetch paginated complaints
  const complaints = await db
    .select()
    .from(sal_emp_complaint)
    .where(whereClause)
    .orderBy(desc(sal_emp_complaint.created_at))
    .limit(filter.page_size)
    .offset((filter.page - 1) * filter.page_size);

  if (complaints.length === 0) {
    return {
      data: [],
      meta: {
        page: filter.page,
        page_size: filter.page_size,
        total,
        total_pages,
      },
    };
  }

  const comIds = complaints.map((c) => c.pk_com_id);

  // 3. Bulk fetch employee relations
  const allEmployees = await db
    .select({
      fk_com_id: sal_comp_employees.fk_com_id,
      pk_emp_id: sal_employee.pk_emp_id,
      employee: sal_employee.employee,
      emp_code: sal_employee.emp_code,
    })
    .from(sal_comp_employees)
    .innerJoin(sal_employee, eq(sal_employee.pk_emp_id, sal_comp_employees.fk_emp_id))
    .where(inArray(sal_comp_employees.fk_com_id, comIds));

  // 4. Bulk fetch attachments
  const allAttachments = await db
    .select({
      pk_att_id: sal_comp_attachments.pk_att_id,
      fk_com_id: sal_comp_attachments.fk_com_id,
      file_name: sal_comp_attachments.file_name,
      file_path: sal_comp_attachments.file_path,
      doc_type: sal_comp_attachments.doc_type,
      uploaded_at: sal_comp_attachments.uploaded_at,
    })
    .from(sal_comp_attachments)
    .where(inArray(sal_comp_attachments.fk_com_id, comIds));

  // 5. Group and Map
  const empMap: Record<string, typeof allEmployees> = {};
  const attMap: Record<string, typeof allAttachments> = {};

  allEmployees.forEach((emp) => {
    if (!empMap[emp.fk_com_id]) {
      empMap[emp.fk_com_id] = [];
    }
    empMap[emp.fk_com_id]!.push(emp);
  });

  allAttachments.forEach((att) => {
    if (!attMap[att.fk_com_id]) {
      attMap[att.fk_com_id] = [];
    }
    attMap[att.fk_com_id]!.push(att);
  });

  const data: ComplaintDTO[] = complaints.map((c) => {
    const emps = empMap[c.pk_com_id] || [];
    const atts = attMap[c.pk_com_id] || [];

    return {
      pk_com_id: c.pk_com_id,
      title: c.title,
      description: c.description,
      type: c.type,
      created_at: c.created_at,
      employees: emps.map((emp) => ({
        pk_emp_id: emp.pk_emp_id,
        employee: emp.employee || '',
        emp_code: emp.emp_code || '',
      })),
      attachments: atts.map((att) => ({
        pk_att_id: att.pk_att_id,
        file_name: att.file_name,
        file_path: att.file_path,
        doc_type: att.doc_type,
        uploaded_at: att.uploaded_at,
      })),
    };
  });

  return {
    data,
    meta: {
      page: filter.page,
      page_size: filter.page_size,
      total,
      total_pages,
    },
  };
}

/**
 * Deletes a complaint (cascade constraints in DB will auto-delete relations).
 */
export async function deleteComplaint(id: string): Promise<boolean> {
  const result = await db
    .delete(sal_emp_complaint)
    .where(eq(sal_emp_complaint.pk_com_id, id))
    .returning();

  return result.length > 0;
}
