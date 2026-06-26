import { eq, ilike, and, ne, type SQL, getTableColumns } from 'drizzle-orm';

import type {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateDesignationDto,
  UpdateDesignationDto,
  CreateQualificationDto,
  UpdateQualificationDto,
  CreateRelationshipDto,
  UpdateRelationshipDto,
  CreateTitleDto,
  UpdateTitleDto,
} from './master-contacts.dto.js';
import type {
  ContCategory,
  NewContCategory,
  ContDepartment,
  NewContDepartment,
  ContDesignation,
  NewContDesignation,
  ContQualification,
  NewContQualification,
  ContRelationship,
  NewContRelationship,
  ContTitle,
  NewContTitle,
  MasterContactQuery,
} from './master-contacts.types.js';

import { db } from '@/config/db.config.js';
import { appUser } from '@/shared/database/schemas/app-user.schema.js';
import { contCategory } from '@/shared/database/schemas/cont-category.schema.js';
import { contDepartment } from '@/shared/database/schemas/cont-department.schema.js';
import { contDesignation } from '@/shared/database/schemas/cont-designation.schema.js';
import { contQualification } from '@/shared/database/schemas/cont-qualification.schema.js';
import { contRelationship } from '@/shared/database/schemas/cont-relationship.schema.js';
import { contTitle } from '@/shared/database/schemas/cont-title.schema.js';
import { logger } from '@/shared/utils/devHelper.js';

// ---------------------------------------------------------------------------
// Helper: attach username via join
// ---------------------------------------------------------------------------

type WithUsername = { username?: string | null };

// ---------------------------------------------------------------------------
// Private Validation Helpers
// ---------------------------------------------------------------------------

async function _requireExists(table: any, pkCol: any, id: number, label: string): Promise<void> {
  const rows = await db.select().from(table).where(eq(pkCol, id)).limit(1);
  if (!rows[0]) throw new Error(`${label} with id "${id}" not found.`);
}

/** Throws if a record with the same value already exists (optionally excluding current ID). */
async function _assertUnique(
  table: any,
  fieldName: string,
  col: any,
  value: string,
  pkCol: any,
  excludeId?: number,
): Promise<void> {
  const conditions: SQL[] = [ilike(col, value.trim())];
  if (excludeId !== undefined) conditions.push(ne(pkCol, excludeId));

  const rows = await db
    .select()
    .from(table)
    .where(and(...conditions));

  const duplicate = rows.some((r: any) => {
    const dbVal = String(r[col.name] || '')
      .trim()
      .toLowerCase();
    return dbVal === value.trim().toLowerCase();
  });

  if (duplicate) {
    throw new Error(`"${value}" already exists in ${fieldName}.`);
  }
}

/** Guards delete: catches FK violations. */
async function _guardDelete(table: any, pkCol: any, id: number, label: string): Promise<void> {
  const rows = await db.select().from(table).where(eq(pkCol, id)).limit(1);
  const record = rows[0] as any;
  if (!record) throw new Error(`${label} with id "${id}" not found.`);
}

function _requireRecord<T>(record: T | undefined, label: string): T {
  if (!record) throw new Error(`${label} operation failed to return the record.`);
  return record;
}

// ---------------------------------------------------------------------------
// CATEGORY
// ---------------------------------------------------------------------------

export async function findAllCategories(
  filters: MasterContactQuery = {},
): Promise<(ContCategory & WithUsername)[]> {
  const conditions: SQL[] = [];
  if (filters.search) conditions.push(ilike(contCategory.category, `%${filters.search}%`));
  if (filters.last_status)
    conditions.push(ilike(contCategory.last_status, `${filters.last_status}%`));

  return db
    .select({ ...getTableColumns(contCategory), username: appUser.username })
    .from(contCategory)
    .leftJoin(appUser, eq(contCategory.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(contCategory.category) as any;
}

export async function findCategoryById(id: number): Promise<(ContCategory & WithUsername) | null> {
  const rows = await db
    .select({ ...getTableColumns(contCategory), username: appUser.username })
    .from(contCategory)
    .leftJoin(appUser, eq(contCategory.fk_user_id, appUser.pk_user_id))
    .where(eq(contCategory.pk_cat_id, id))
    .limit(1);

  return (rows[0] as any) || null;
}

export async function createCategory(dto: CreateCategoryDto): Promise<ContCategory> {
  await _assertUnique(
    contCategory,
    'category',
    contCategory.category,
    dto.category,
    contCategory.pk_cat_id,
  );
  const payload: NewContCategory = {
    ...dto,
    date_time_stamp: new Date(),
    last_status: 'Added',
  };

  logger.info(`Creating Category: "${payload.category}"`);
  const [created] = await db.insert(contCategory).values(payload).returning();
  return _requireRecord(created, 'Category');
}

export async function updateCategory(id: number, dto: UpdateCategoryDto): Promise<ContCategory> {
  await _requireExists(contCategory, contCategory.pk_cat_id, id, 'Category');
  if (dto.category) {
    await _assertUnique(
      contCategory,
      'category',
      contCategory.category,
      dto.category,
      contCategory.pk_cat_id,
      id,
    );
  }
  const [updated] = await db
    .update(contCategory)
    .set({
      ...dto,
      date_time_stamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(contCategory.pk_cat_id, id))
    .returning();

  return _requireRecord(updated, 'Category');
}

export async function deleteCategory(id: number): Promise<void> {
  await _guardDelete(contCategory, contCategory.pk_cat_id, id, 'Category');
  try {
    logger.info(`Deleting Category ID: ${id}`);
    await db.delete(contCategory).where(eq(contCategory.pk_cat_id, id));
  } catch (err: any) {
    if (err.code === '23503') {
      throw new Error('This record cannot be deleted because it is referenced elsewhere.');
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// DEPARTMENT
// ---------------------------------------------------------------------------

export async function findAllDepartments(
  filters: MasterContactQuery = {},
): Promise<(ContDepartment & WithUsername)[]> {
  const conditions: SQL[] = [];
  if (filters.search) conditions.push(ilike(contDepartment.department, `%${filters.search}%`));
  if (filters.last_status)
    conditions.push(ilike(contDepartment.last_status, `${filters.last_status}%`));

  return db
    .select({ ...getTableColumns(contDepartment), username: appUser.username })
    .from(contDepartment)
    .leftJoin(appUser, eq(contDepartment.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(contDepartment.department) as any;
}

export async function findDepartmentById(
  id: number,
): Promise<(ContDepartment & WithUsername) | null> {
  const rows = await db
    .select({ ...getTableColumns(contDepartment), username: appUser.username })
    .from(contDepartment)
    .leftJoin(appUser, eq(contDepartment.fk_user_id, appUser.pk_user_id))
    .where(eq(contDepartment.pk_dep_id, id))
    .limit(1);

  return (rows[0] as any) || null;
}

export async function createDepartment(dto: CreateDepartmentDto): Promise<ContDepartment> {
  await _assertUnique(
    contDepartment,
    'department',
    contDepartment.department,
    dto.department,
    contDepartment.pk_dep_id,
  );
  const payload: NewContDepartment = {
    ...dto,
    date_time_stamp: new Date(),
    last_status: 'Added',
  };

  logger.info(`Creating Department: "${payload.department}"`);
  const [created] = await db.insert(contDepartment).values(payload).returning();
  return _requireRecord(created, 'Department');
}

export async function updateDepartment(
  id: number,
  dto: UpdateDepartmentDto,
): Promise<ContDepartment> {
  await _requireExists(contDepartment, contDepartment.pk_dep_id, id, 'Department');
  if (dto.department) {
    await _assertUnique(
      contDepartment,
      'department',
      contDepartment.department,
      dto.department,
      contDepartment.pk_dep_id,
      id,
    );
  }
  const [updated] = await db
    .update(contDepartment)
    .set({
      ...dto,
      date_time_stamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(contDepartment.pk_dep_id, id))
    .returning();

  return _requireRecord(updated, 'Department');
}

export async function deleteDepartment(id: number): Promise<void> {
  await _guardDelete(contDepartment, contDepartment.pk_dep_id, id, 'Department');
  try {
    logger.info(`Deleting Department ID: ${id}`);
    await db.delete(contDepartment).where(eq(contDepartment.pk_dep_id, id));
  } catch (err: any) {
    if (err.code === '23503') {
      throw new Error('This record cannot be deleted because it is referenced elsewhere.');
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// DESIGNATION
// ---------------------------------------------------------------------------

export async function findAllDesignations(
  filters: MasterContactQuery = {},
): Promise<(ContDesignation & WithUsername)[]> {
  const conditions: SQL[] = [];
  if (filters.search) conditions.push(ilike(contDesignation.designation, `%${filters.search}%`));
  if (filters.last_status)
    conditions.push(ilike(contDesignation.last_status, `${filters.last_status}%`));

  return db
    .select({ ...getTableColumns(contDesignation), username: appUser.username })
    .from(contDesignation)
    .leftJoin(appUser, eq(contDesignation.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(contDesignation.designation) as any;
}

export async function findDesignationById(
  id: number,
): Promise<(ContDesignation & WithUsername) | null> {
  const rows = await db
    .select({ ...getTableColumns(contDesignation), username: appUser.username })
    .from(contDesignation)
    .leftJoin(appUser, eq(contDesignation.fk_user_id, appUser.pk_user_id))
    .where(eq(contDesignation.pk_des_id, id))
    .limit(1);

  return (rows[0] as any) || null;
}

export async function createDesignation(dto: CreateDesignationDto): Promise<ContDesignation> {
  await _assertUnique(
    contDesignation,
    'designation',
    contDesignation.designation,
    dto.designation,
    contDesignation.pk_des_id,
  );
  const payload: NewContDesignation = {
    ...dto,
    date_time_stamp: new Date(),
    last_status: 'Added',
  };

  logger.info(`Creating Designation: "${payload.designation}"`);
  const [created] = await db.insert(contDesignation).values(payload).returning();
  return _requireRecord(created, 'Designation');
}

export async function updateDesignation(
  id: number,
  dto: UpdateDesignationDto,
): Promise<ContDesignation> {
  await _requireExists(contDesignation, contDesignation.pk_des_id, id, 'Designation');
  if (dto.designation) {
    await _assertUnique(
      contDesignation,
      'designation',
      contDesignation.designation,
      dto.designation,
      contDesignation.pk_des_id,
      id,
    );
  }
  const [updated] = await db
    .update(contDesignation)
    .set({
      ...dto,
      date_time_stamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(contDesignation.pk_des_id, id))
    .returning();

  return _requireRecord(updated, 'Designation');
}

export async function deleteDesignation(id: number): Promise<void> {
  await _guardDelete(contDesignation, contDesignation.pk_des_id, id, 'Designation');
  try {
    logger.info(`Deleting Designation ID: ${id}`);
    await db.delete(contDesignation).where(eq(contDesignation.pk_des_id, id));
  } catch (err: any) {
    if (err.code === '23503') {
      throw new Error('This record cannot be deleted because it is referenced elsewhere.');
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// QUALIFICATION
// ---------------------------------------------------------------------------

export async function findAllQualifications(
  filters: MasterContactQuery = {},
): Promise<(ContQualification & WithUsername)[]> {
  const conditions: SQL[] = [];
  if (filters.search)
    conditions.push(ilike(contQualification.qualification, `%${filters.search}%`));
  if (filters.last_status)
    conditions.push(ilike(contQualification.last_status, `${filters.last_status}%`));

  return db
    .select({ ...getTableColumns(contQualification), username: appUser.username })
    .from(contQualification)
    .leftJoin(appUser, eq(contQualification.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(contQualification.qualification) as any;
}

export async function findQualificationById(
  id: number,
): Promise<(ContQualification & WithUsername) | null> {
  const rows = await db
    .select({ ...getTableColumns(contQualification), username: appUser.username })
    .from(contQualification)
    .leftJoin(appUser, eq(contQualification.fk_user_id, appUser.pk_user_id))
    .where(eq(contQualification.pk_qua_id, id))
    .limit(1);

  return (rows[0] as any) || null;
}

export async function createQualification(dto: CreateQualificationDto): Promise<ContQualification> {
  await _assertUnique(
    contQualification,
    'qualification',
    contQualification.qualification,
    dto.qualification,
    contQualification.pk_qua_id,
  );
  const payload: NewContQualification = {
    ...dto,
    date_time_stamp: new Date(),
    last_status: 'Added',
  };

  logger.info(`Creating Qualification: "${payload.qualification}"`);
  const [created] = await db.insert(contQualification).values(payload).returning();
  return _requireRecord(created, 'Qualification');
}

export async function updateQualification(
  id: number,
  dto: UpdateQualificationDto,
): Promise<ContQualification> {
  await _requireExists(contQualification, contQualification.pk_qua_id, id, 'Qualification');
  if (dto.qualification) {
    await _assertUnique(
      contQualification,
      'qualification',
      contQualification.qualification,
      dto.qualification,
      contQualification.pk_qua_id,
      id,
    );
  }
  const [updated] = await db
    .update(contQualification)
    .set({
      ...dto,
      date_time_stamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(contQualification.pk_qua_id, id))
    .returning();

  return _requireRecord(updated, 'Qualification');
}

export async function deleteQualification(id: number): Promise<void> {
  await _guardDelete(contQualification, contQualification.pk_qua_id, id, 'Qualification');
  try {
    logger.info(`Deleting Qualification ID: ${id}`);
    await db.delete(contQualification).where(eq(contQualification.pk_qua_id, id));
  } catch (err: any) {
    if (err.code === '23503') {
      throw new Error('This record cannot be deleted because it is referenced elsewhere.');
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// RELATIONSHIP
// ---------------------------------------------------------------------------

export async function findAllRelationships(
  filters: MasterContactQuery = {},
): Promise<(ContRelationship & WithUsername)[]> {
  const conditions: SQL[] = [];
  if (filters.search) conditions.push(ilike(contRelationship.relationship, `%${filters.search}%`));
  if (filters.last_status)
    conditions.push(ilike(contRelationship.last_status, `${filters.last_status}%`));

  return db
    .select({ ...getTableColumns(contRelationship), username: appUser.username })
    .from(contRelationship)
    .leftJoin(appUser, eq(contRelationship.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(contRelationship.relationship) as any;
}

export async function findRelationshipById(
  id: number,
): Promise<(ContRelationship & WithUsername) | null> {
  const rows = await db
    .select({ ...getTableColumns(contRelationship), username: appUser.username })
    .from(contRelationship)
    .leftJoin(appUser, eq(contRelationship.fk_user_id, appUser.pk_user_id))
    .where(eq(contRelationship.pk_rel_id, id))
    .limit(1);

  return (rows[0] as any) || null;
}

export async function createRelationship(dto: CreateRelationshipDto): Promise<ContRelationship> {
  await _assertUnique(
    contRelationship,
    'relationship',
    contRelationship.relationship,
    dto.relationship,
    contRelationship.pk_rel_id,
  );
  const payload: NewContRelationship = {
    ...dto,
    date_time_stamp: new Date(),
    last_status: 'Added',
  };

  logger.info(`Creating Relationship: "${payload.relationship}"`);
  const [created] = await db.insert(contRelationship).values(payload).returning();
  return _requireRecord(created, 'Relationship');
}

export async function updateRelationship(
  id: number,
  dto: UpdateRelationshipDto,
): Promise<ContRelationship> {
  await _requireExists(contRelationship, contRelationship.pk_rel_id, id, 'Relationship');
  if (dto.relationship) {
    await _assertUnique(
      contRelationship,
      'relationship',
      contRelationship.relationship,
      dto.relationship,
      contRelationship.pk_rel_id,
      id,
    );
  }
  const [updated] = await db
    .update(contRelationship)
    .set({
      ...dto,
      date_time_stamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(contRelationship.pk_rel_id, id))
    .returning();

  return _requireRecord(updated, 'Relationship');
}

export async function deleteRelationship(id: number): Promise<void> {
  await _guardDelete(contRelationship, contRelationship.pk_rel_id, id, 'Relationship');
  try {
    logger.info(`Deleting Relationship ID: ${id}`);
    await db.delete(contRelationship).where(eq(contRelationship.pk_rel_id, id));
  } catch (err: any) {
    if (err.code === '23503') {
      throw new Error('This record cannot be deleted because it is referenced elsewhere.');
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// TITLE
// ---------------------------------------------------------------------------

export async function findAllTitles(
  filters: MasterContactQuery = {},
): Promise<(ContTitle & WithUsername)[]> {
  const conditions: SQL[] = [];
  if (filters.search) conditions.push(ilike(contTitle.title, `%${filters.search}%`));
  if (filters.last_status) conditions.push(ilike(contTitle.last_status, `${filters.last_status}%`));

  return db
    .select({ ...getTableColumns(contTitle), username: appUser.username })
    .from(contTitle)
    .leftJoin(appUser, eq(contTitle.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(contTitle.title) as any;
}

export async function findTitleById(id: number): Promise<(ContTitle & WithUsername) | null> {
  const rows = await db
    .select({ ...getTableColumns(contTitle), username: appUser.username })
    .from(contTitle)
    .leftJoin(appUser, eq(contTitle.fk_user_id, appUser.pk_user_id))
    .where(eq(contTitle.pk_tit_id, id))
    .limit(1);

  return (rows[0] as any) || null;
}

export async function createTitle(dto: CreateTitleDto): Promise<ContTitle> {
  await _assertUnique(contTitle, 'title', contTitle.title, dto.title, contTitle.pk_tit_id);
  const payload: NewContTitle = {
    ...dto,
    date_time_stamp: new Date(),
    last_status: 'Added',
  };

  logger.info(`Creating Title: "${payload.title}"`);
  const [created] = await db.insert(contTitle).values(payload).returning();
  return _requireRecord(created, 'Title');
}

export async function updateTitle(id: number, dto: UpdateTitleDto): Promise<ContTitle> {
  await _requireExists(contTitle, contTitle.pk_tit_id, id, 'Title');
  if (dto.title) {
    await _assertUnique(contTitle, 'title', contTitle.title, dto.title, contTitle.pk_tit_id, id);
  }
  const [updated] = await db
    .update(contTitle)
    .set({
      ...dto,
      date_time_stamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(contTitle.pk_tit_id, id))
    .returning();

  return _requireRecord(updated, 'Title');
}

export async function deleteTitle(id: number): Promise<void> {
  await _guardDelete(contTitle, contTitle.pk_tit_id, id, 'Title');
  try {
    logger.info(`Deleting Title ID: ${id}`);
    await db.delete(contTitle).where(eq(contTitle.pk_tit_id, id));
  } catch (err: any) {
    if (err.code === '23503') {
      throw new Error('This record cannot be deleted because it is referenced elsewhere.');
    }
    throw err;
  }
}
