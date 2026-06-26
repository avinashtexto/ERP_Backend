import { and, eq, ilike, or, sql } from 'drizzle-orm';

import type {
  CreateIndividualBody,
  ListIndividualQuery,
  UpdateIndividualBody,
} from './individual.dto.js';

import { db } from '@/config/db.config.js';
import type { ContIndividual } from '@/shared/database/schemas/cont-individual.schema.js';
import { cont_common, cont_individual } from '@/shared/database/schemas/index.js';

export interface IndividualRow extends ContIndividual {
  contact_name: string;
  title_name: string | null;
  qualification_name: string | null;
  organisation_name: string | null;
  department_name: string | null;
  designation_name: string | null;
  spouse_name: string | null;
  postfix: string | null;
  address: string | null;
  fk_city_id: number | null;
  region: string | null;
  pincode: string | null;
}

export interface PaginatedIndividuals {
  data: IndividualRow[];
  total: number;
  page: number;
  limit: number;
}

export async function findAllIndividuals(
  query: ListIndividualQuery,
): Promise<PaginatedIndividuals> {
  const {
    search,
    fk_org_id,
    fk_dep_id,
    fk_deg_id,
    fk_qual_id,
    gender,
    marital_status,
    page,
    limit,
  } = query;
  const offset = (page - 1) * limit;

  const conditions = [
    search
      ? or(
          ilike(cont_individual.first_name, `%${search}%`),
          ilike(cont_individual.surname, `%${search}%`),
          ilike(cont_individual.middle_name, `%${search}%`),
          ilike(cont_common.contact_name, `%${search}%`),
        )
      : undefined,
    fk_org_id !== undefined ? eq(cont_individual.fk_org_id, fk_org_id) : undefined,
    fk_dep_id !== undefined ? eq(cont_individual.fk_dep_id, fk_dep_id) : undefined,
    fk_deg_id !== undefined ? eq(cont_individual.fk_deg_id, fk_deg_id) : undefined,
    fk_qual_id !== undefined ? eq(cont_individual.fk_qual_id, fk_qual_id) : undefined,
    gender !== undefined ? eq(cont_individual.gender, gender) : undefined,
    marital_status !== undefined ? eq(cont_individual.marital_status, marital_status) : undefined,
  ].filter(Boolean) as any[];

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      pk_ind_id: cont_individual.pk_ind_id,
      fk_com_id: cont_individual.fk_com_id,
      fk_tit_id: cont_individual.fk_tit_id,
      first_name: cont_individual.first_name,
      middle_name: cont_individual.middle_name,
      surname: cont_individual.surname,
      dob: cont_individual.dob,
      photo_url: cont_individual.photo_url,
      fk_qual_id: cont_individual.fk_qual_id,
      gender: cont_individual.gender,
      marital_status: cont_individual.marital_status,
      fk_org_id: cont_individual.fk_org_id,
      fk_dep_id: cont_individual.fk_dep_id,
      fk_deg_id: cont_individual.fk_deg_id,
      fk_spo_id: cont_individual.fk_spo_id,
      anniversary: cont_individual.anniversary,
      ext: cont_individual.ext,
      contact_name: cont_common.contact_name,
      title_name: sql<string | null>`tit.title`,
      qualification_name: sql<string | null>`qual.qualification`,
      organisation_name: sql<string | null>`org.contact_name`,
      department_name: sql<string | null>`dep.department`,
      designation_name: sql<string | null>`deg.designation`,
      spouse_name: sql<string | null>`spo.contact_name`,
      address: cont_common.address,
      fk_city_id: cont_common.fk_city_id,
      region: cont_common.region,
      pincode: cont_common.pincode,
      postfix: cont_common.postfix,
    })
    .from(cont_individual)
    .innerJoin(cont_common, eq(cont_individual.fk_com_id, cont_common.pk_cont_id))
    .leftJoin(sql`cont_title tit`, sql`tit.pk_tit_id = ${cont_individual.fk_tit_id}`)
    .leftJoin(sql`cont_qualification qual`, sql`qual.pk_qua_id = ${cont_individual.fk_qual_id}`)
    .leftJoin(sql`cont_common org`, sql`org.pk_cont_id = ${cont_individual.fk_org_id}`)
    .leftJoin(sql`cont_department dep`, sql`dep.pk_dep_id = ${cont_individual.fk_dep_id}`)
    .leftJoin(sql`cont_designation deg`, sql`deg.pk_des_id = ${cont_individual.fk_deg_id}`)
    .leftJoin(sql`cont_common spo`, sql`spo.pk_cont_id = ${cont_individual.fk_spo_id}`)
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cont_individual)
    .innerJoin(cont_common, eq(cont_individual.fk_com_id, cont_common.pk_cont_id))
    .where(whereClause);

  const count = countResult[0]?.count ?? 0;

  return {
    data: rows as IndividualRow[],
    total: count,
    page,
    limit,
  };
}

export async function findIndividualById(id: number): Promise<IndividualRow | null> {
  const rows = await db
    .select({
      pk_ind_id: cont_individual.pk_ind_id,
      fk_com_id: cont_individual.fk_com_id,
      fk_tit_id: cont_individual.fk_tit_id,
      first_name: cont_individual.first_name,
      middle_name: cont_individual.middle_name,
      surname: cont_individual.surname,
      dob: cont_individual.dob,
      photo_url: cont_individual.photo_url,
      fk_qual_id: cont_individual.fk_qual_id,
      gender: cont_individual.gender,
      marital_status: cont_individual.marital_status,
      fk_org_id: cont_individual.fk_org_id,
      fk_dep_id: cont_individual.fk_dep_id,
      fk_deg_id: cont_individual.fk_deg_id,
      fk_spo_id: cont_individual.fk_spo_id,
      anniversary: cont_individual.anniversary,
      ext: cont_individual.ext,
      contact_name: cont_common.contact_name,
      title_name: sql<string | null>`tit.title`,
      qualification_name: sql<string | null>`qual.qualification`,
      organisation_name: sql<string | null>`org.contact_name`,
      department_name: sql<string | null>`dep.department`,
      designation_name: sql<string | null>`deg.designation`,
      spouse_name: sql<string | null>`spo.contact_name`,
      address: cont_common.address,
      fk_city_id: cont_common.fk_city_id,
      region: cont_common.region,
      pincode: cont_common.pincode,
      postfix: cont_common.postfix,
    })
    .from(cont_individual)
    .innerJoin(cont_common, eq(cont_individual.fk_com_id, cont_common.pk_cont_id))
    .leftJoin(sql`cont_title tit`, sql`tit.pk_tit_id = ${cont_individual.fk_tit_id}`)
    .leftJoin(sql`cont_qualification qual`, sql`qual.pk_qua_id = ${cont_individual.fk_qual_id}`)
    .leftJoin(sql`cont_common org`, sql`org.pk_cont_id = ${cont_individual.fk_org_id}`)
    .leftJoin(sql`cont_department dep`, sql`dep.pk_dep_id = ${cont_individual.fk_dep_id}`)
    .leftJoin(sql`cont_designation deg`, sql`deg.pk_des_id = ${cont_individual.fk_deg_id}`)
    .leftJoin(sql`cont_common spo`, sql`spo.pk_cont_id = ${cont_individual.fk_spo_id}`)
    .where(eq(cont_individual.pk_ind_id, id))
    .limit(1);

  return (rows[0] as IndividualRow) ?? null;
}

export async function createIndividual(body: CreateIndividualBody): Promise<ContIndividual> {
  if (body.pk_ind_id) {
    const existing = await db
      .select({ pk_ind_id: cont_individual.pk_ind_id })
      .from(cont_individual)
      .where(eq(cont_individual.pk_ind_id, body.pk_ind_id))
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`CONFLICT:Individual with ID "${body.pk_ind_id}" already exists`);
    }
  }

  let fk_com_id = body.fk_com_id;
  const contactName =
    `${body.first_name} ${body.middle_name ? body.middle_name + ' ' : ''}${body.surname}`.trim();

  if (!fk_com_id) {
    // Automatically create a new cont_common record with type 'I'
    const [newCommon] = await db
      .insert(cont_common)
      .values({
        type: 'I',
        contact_name: contactName,
        address: body.address ?? '',
        fk_city_id: body.fk_city_id ?? null,
        region: body.region ?? '',
        pincode: body.pincode ?? '',
        postfix: body.postfix ?? '',
        last_status: 'Added',
      })
      .returning();

    if (!newCommon) {
      throw new Error('Failed to create common contact record');
    }
    fk_com_id = newCommon.pk_cont_id;
  } else {
    // If it is provided, verify it exists and update it
    const parentContact = await db
      .select({ pk_cont_id: cont_common.pk_cont_id })
      .from(cont_common)
      .where(eq(cont_common.pk_cont_id, fk_com_id))
      .limit(1);

    if (parentContact.length === 0) {
      throw new Error(`NOT_FOUND:Contact with ID "${fk_com_id}" not found`);
    }

    await db
      .update(cont_common)
      .set({
        type: 'I',
        contact_name: contactName,
        address: body.address ?? '',
        fk_city_id: body.fk_city_id ?? null,
        region: body.region ?? '',
        pincode: body.pincode ?? '',
        postfix: body.postfix ?? '',
        last_status: 'Edited',
      })
      .where(eq(cont_common.pk_cont_id, fk_com_id));
  }

  const [created] = await db
    .insert(cont_individual)
    .values({
      ...(body.pk_ind_id && { pk_ind_id: body.pk_ind_id }),
      fk_com_id: fk_com_id,
      fk_tit_id: body.fk_tit_id ?? null,
      first_name: body.first_name,
      middle_name: body.middle_name ?? '',
      surname: body.surname,
      dob: body.dob ?? null,
      photo_url: body.photo_url ?? body.photo ?? null,
      fk_qual_id: body.fk_qual_id ?? null,
      gender: body.gender ?? '',
      marital_status: body.marital_status ?? 'single',
      fk_org_id: body.fk_org_id ?? null,
      fk_dep_id: body.fk_dep_id ?? null,
      fk_deg_id: body.fk_deg_id ?? null,
      fk_spo_id: body.fk_spo_id ?? null,
      anniversary: body.anniversary ?? null,
      ext: body.ext ?? null,
    })
    .returning();

  if (!created) {
    throw new Error('Failed to create individual record');
  }

  return created;
}

export async function updateIndividual(
  id: number,
  body: UpdateIndividualBody,
): Promise<ContIndividual> {
  const existing = await db
    .select({ pk_ind_id: cont_individual.pk_ind_id, fk_com_id: cont_individual.fk_com_id })
    .from(cont_individual)
    .where(eq(cont_individual.pk_ind_id, id))
    .limit(1);

  if (existing.length === 0 || !existing[0]) {
    throw new Error(`NOT_FOUND:Individual with ID "${id}" not found`);
  }

  const fk_com_id = existing[0].fk_com_id;

  // Make sure type is set to 'I' in cont_common
  await db.update(cont_common).set({ type: 'I' }).where(eq(cont_common.pk_cont_id, fk_com_id));

  const [updated] = await db
    .update(cont_individual)
    .set({
      ...(body.fk_tit_id !== undefined && { fk_tit_id: body.fk_tit_id }),
      ...(body.first_name !== undefined && { first_name: body.first_name }),
      ...(body.middle_name !== undefined && { middle_name: body.middle_name }),
      ...(body.surname !== undefined && { surname: body.surname }),
      ...(body.dob !== undefined && { dob: body.dob }),
      ...((body.photo_url !== undefined || body.photo !== undefined) && {
        photo_url: body.photo_url ?? body.photo,
      }),
      ...(body.fk_qual_id !== undefined && { fk_qual_id: body.fk_qual_id }),
      ...(body.gender !== undefined && { gender: body.gender }),
      ...(body.marital_status !== undefined && {
        marital_status: body.marital_status,
      }),
      ...(body.fk_org_id !== undefined && { fk_org_id: body.fk_org_id }),
      ...(body.fk_dep_id !== undefined && { fk_dep_id: body.fk_dep_id }),
      ...(body.fk_deg_id !== undefined && { fk_deg_id: body.fk_deg_id }),
      ...(body.fk_spo_id !== undefined && { fk_spo_id: body.fk_spo_id }),
      ...(body.anniversary !== undefined && { anniversary: body.anniversary }),
      ...(body.ext !== undefined && { ext: body.ext }),
    })
    .where(eq(cont_individual.pk_ind_id, id))
    .returning();

  if (!updated) {
    throw new Error('Failed to update individual record');
  }

  return updated;
}

export async function removeIndividual(id: number): Promise<void> {
  const existing = await db
    .select({ pk_ind_id: cont_individual.pk_ind_id })
    .from(cont_individual)
    .where(eq(cont_individual.pk_ind_id, id))
    .limit(1);

  if (existing.length === 0) {
    throw new Error(`NOT_FOUND:Individual with ID "${id}" not found`);
  }

  await db.delete(cont_individual).where(eq(cont_individual.pk_ind_id, id));
}
