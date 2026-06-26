import { eq, ilike, and, ne, gt, type SQL, aliasedTable } from 'drizzle-orm';

import type {
  AcctGroup,
  NewAcctGroup,
  CreateAcctGroupDto,
  UpdateAcctGroupDto,
  AcctGroupResponse,
  AcctGroupTreeNode,
  AcctGroupQuery,
} from './account-groups.types.js';

import { db } from '@/config/db.config.js';
import { acct_group } from '@/shared/database/schemas/acct-group.schema.js';
import { appUser } from '@/shared/database/schemas/app-user.schema.js';
import { logger } from '@/shared/utils/devHelper.js';

// ---------------------------------------------------------------------------
function mapResponse(row: any): any {
  if (!row) return row;
  const { dc, DC, ...rest } = row;
  const originalDc = dc || DC;
  return {
    ...rest,
    dc: originalDc === 'D' ? 'DR' : originalDc === 'C' ? 'CR' : originalDc,
  };
}

/**
 * Transforms a flat array of self-referencing nodes into a nested tree structure.
 * Safe against cycles and handles orphan nodes by pushing them as root nodes.
 */
function buildTree(rows: AcctGroupResponse[]): AcctGroupTreeNode[] {
  const map = new Map<number, AcctGroupTreeNode>();
  const roots: AcctGroupTreeNode[] = [];

  for (const row of rows) {
    map.set(row.pk_grp_id, { ...row, children: [] });
  }

  for (const node of map.values()) {
    // A node is a root if it points to itself as a parent (standard SQL hierarchy style)
    // or if its parent is not present in the current set.
    if (node.fk_prt_id === node.pk_grp_id) {
      roots.push(node);
    } else {
      const parent = map.get(node.fk_prt_id);
      if (parent) {
        parent.children.push(node);
      } else {
        // Orphan node fallback
        roots.push(node);
      }
    }
  }

  return roots;
}

// ---------------------------------------------------------------------------
// Private Helpers
// ---------------------------------------------------------------------------

async function _requireById(id: number, label = 'Record'): Promise<AcctGroup> {
  const row = await findById(id);
  if (!row) throw new Error(`${label} with id ${id} not found.`);
  return row;
}

async function _assertNameUnique(name: string, excludeId?: number): Promise<void> {
  const conditions: SQL[] = [ilike(acct_group.group_name, name.trim())];
  if (excludeId !== undefined) {
    conditions.push(ne(acct_group.pk_grp_id, excludeId));
  }
  const existing = await db
    .select({ pk_grp_id: acct_group.pk_grp_id })
    .from(acct_group)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(`Account Group "${name}" already exists.`);
  }
}

// ---------------------------------------------------------------------------
// Service Layer (Standalone Functions)
// ---------------------------------------------------------------------------

/**
 * Retrieves user-defined groups (pk_grp_id > 20) with search filters.
 * Performs joins to include parent group names and creator/updater usernames.
 */
export async function findAll(filters: AcctGroupQuery = {}): Promise<AcctGroupResponse[]> {
  const parentGroup = aliasedTable(acct_group, 'parent_group');
  const conditions: SQL[] = [gt(acct_group.pk_grp_id, 20)];

  if (filters.group_name) {
    conditions.push(ilike(acct_group.group_name, `${filters.group_name}%`));
  }
  if (filters.last_status) {
    conditions.push(ilike(acct_group.last_status, `${filters.last_status}%`));
  }

  const rows = await db
    .select({
      pk_grp_id: acct_group.pk_grp_id,
      group_name: acct_group.group_name,
      fk_main_id: acct_group.fk_main_id,
      fk_sub_id: acct_group.fk_sub_id,
      fk_prt_id: acct_group.fk_prt_id,
      grouping: acct_group.grouping,
      prefix: acct_group.prefix,
      dc: acct_group.dc,
      date_time_stamp: acct_group.date_time_stamp,
      fk_user_id: acct_group.fk_user_id,
      last_status: acct_group.last_status,
      parent_name: parentGroup.group_name,
      username: appUser.username,
    })
    .from(acct_group)
    .leftJoin(parentGroup, eq(acct_group.fk_prt_id, parentGroup.pk_grp_id))
    .leftJoin(appUser, eq(acct_group.fk_user_id, appUser.pk_user_id))
    .where(and(...conditions))
    .orderBy(acct_group.group_name);

  return rows.map(mapResponse) as AcctGroupResponse[];
}

/**
 * Returns the entire hierarchy tree, including system-defined roots.
 */
export async function findTree(): Promise<AcctGroupTreeNode[]> {
  const rows = await db
    .select({
      pk_grp_id: acct_group.pk_grp_id,
      group_name: acct_group.group_name,
      fk_main_id: acct_group.fk_main_id,
      fk_sub_id: acct_group.fk_sub_id,
      fk_prt_id: acct_group.fk_prt_id,
      grouping: acct_group.grouping,
      prefix: acct_group.prefix,
      dc: acct_group.dc,
    })
    .from(acct_group)
    .where(gt(acct_group.pk_grp_id, 0))
    .orderBy(acct_group.group_name);

  return buildTree(rows.map(mapResponse) as AcctGroupResponse[]);
}

/**
 * Finds a single account group by ID, with fully resolved joins.
 */
export async function findById(id: number): Promise<AcctGroupResponse | null> {
  const parentGroup = aliasedTable(acct_group, 'parent_group');
  const rows = await db
    .select({
      pk_grp_id: acct_group.pk_grp_id,
      group_name: acct_group.group_name,
      fk_main_id: acct_group.fk_main_id,
      fk_sub_id: acct_group.fk_sub_id,
      fk_prt_id: acct_group.fk_prt_id,
      grouping: acct_group.grouping,
      prefix: acct_group.prefix,
      dc: acct_group.dc,
      date_time_stamp: acct_group.date_time_stamp,
      fk_user_id: acct_group.fk_user_id,
      last_status: acct_group.last_status,
      parent_name: parentGroup.group_name,
      username: appUser.username,
    })
    .from(acct_group)
    .leftJoin(parentGroup, eq(acct_group.fk_prt_id, parentGroup.pk_grp_id))
    .leftJoin(appUser, eq(acct_group.fk_user_id, appUser.pk_user_id))
    .where(eq(acct_group.pk_grp_id, id))
    .limit(1);

  if (!rows[0]) return null;
  return mapResponse(rows[0]) as AcctGroupResponse;
}

/**
 * Returns all eligible parent groups (where pkGrpID matches fkSubId).
 */
export async function findParentCandidates(): Promise<AcctGroup[]> {
  const { sql } = await import('drizzle-orm');
  return db
    .select()
    .from(acct_group)
    .where(and(sql`${acct_group.pk_grp_id} = ${acct_group.fk_sub_id}`, gt(acct_group.pk_grp_id, 0)))
    .orderBy(acct_group.group_name);
}

/**
 * Creates a new account group, inheriting attributes (main group, dc type, grouping)
 * from its parent node according to legacy VB.NET business rules.
 */
export async function create(dto: CreateAcctGroupDto): Promise<AcctGroupResponse> {
  await _assertNameUnique(dto.group_name);

  const parent = await _requireById(dto.fk_prt_id, 'Parent group');

  // For fk_sub_id: if parent is user-defined (ID > 20), inherit parent's pk as sub-group anchor.
  // Otherwise, the new node is its own sub-group anchor — but we don't know the ID yet,
  // so we temporarily set fk_sub_id to the parent's pk and fix it up after insert.
  const needsSelfSubId = parent.pk_grp_id <= 20;

  const payload: NewAcctGroup = {
    // pk_grp_id is omitted — PostgreSQL generates it via GENERATED ALWAYS AS IDENTITY
    group_name: dto.group_name.trim(),
    fk_main_id: parent.fk_main_id,
    fk_prt_id: parent.pk_grp_id,
    fk_sub_id: needsSelfSubId ? parent.pk_grp_id : parent.pk_grp_id, // temporary placeholder
    grouping: parent.grouping,
    prefix: parent.prefix,
    dc: parent.dc?.toUpperCase() === 'DR' || parent.dc?.toUpperCase() === 'D' ? 'D' : 'C',
    date_time_stamp: new Date(),
    fk_user_id: parseInt(dto.fk_user_id, 10),
    last_status: 'Added',
  };

  logger.info(`Creating Account Group: "${payload.group_name}"`);

  const [created] = await db.insert(acct_group).values(payload).returning();

  if (!created) {
    throw new Error('Failed to create account group — no row returned.');
  }

  // Fix up fk_sub_id: when the new node should be its own sub-group anchor, update it to its own ID
  if (needsSelfSubId) {
    await db
      .update(acct_group)
      .set({ fk_sub_id: created.pk_grp_id })
      .where(eq(acct_group.pk_grp_id, created.pk_grp_id));
    created.fk_sub_id = created.pk_grp_id;
  }

  return mapResponse(created) as AcctGroupResponse;
}

/**
 * Updates an existing account group and adjusts inherited rules if the parent moves.
 */
export async function update(id: number, dto: UpdateAcctGroupDto): Promise<AcctGroupResponse> {
  await _requireById(id, 'Account group');

  if (dto.group_name) {
    await _assertNameUnique(dto.group_name, id);
  }

  let inherited: Partial<NewAcctGroup> = {};
  if (dto.fk_prt_id !== undefined) {
    const parent = await _requireById(dto.fk_prt_id, 'Parent group');
    inherited = {
      fk_main_id: parent.fk_main_id,
      fk_prt_id: parent.pk_grp_id,
      fk_sub_id: parent.pk_grp_id > 20 ? parent.pk_grp_id : id,
      grouping: parent.grouping,
      prefix: parent.prefix,
      dc: parent.dc?.toUpperCase() === 'DR' || parent.dc?.toUpperCase() === 'D' ? 'D' : 'C',
    };
  }

  const patch: Partial<NewAcctGroup> = {
    ...inherited,
    ...(dto.group_name && { group_name: dto.group_name.trim() }),
    ...(dto.fk_user_id && { fk_user_id: parseInt(dto.fk_user_id, 10) }),
    date_time_stamp: new Date(),
    last_status: 'Edited',
  };

  logger.info(`Updating Account Group ID: ${id}`);

  const [updated] = await db
    .update(acct_group)
    .set(patch)
    .where(eq(acct_group.pk_grp_id, id))
    .returning();

  return mapResponse(updated) as AcctGroupResponse;
}

/**
 * Deletes an account group if it has no dependent references.
 */
export async function deleteGroup(id: number): Promise<void> {
  const record = await _requireById(id, 'Account group');

  try {
    logger.info(`Deleting Account Group ID: ${id}`);
    await db.delete(acct_group).where(eq(acct_group.pk_grp_id, id));
  } catch (err: unknown) {
    // Catch foreign key violation error (PostgreSQL error code 23503)
    if (err && typeof err === 'object' && 'code' in err && err.code === '23503') {
      throw new Error('Selected record cannot be deleted because it is related to other data.');
    }
    throw err;
  }
}
