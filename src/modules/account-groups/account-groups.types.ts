import { acct_group } from '@/shared/database/schemas/acct-group.schema.js';

// ---------------------------------------------------------------------------
// Re-export inferred DB types
// ---------------------------------------------------------------------------
export type AcctGroup = typeof acct_group.$inferSelect;
export type NewAcctGroup = Omit<typeof acct_group.$inferInsert, 'pk_grp_id'> & {
  pk_grp_id?: number;
};

// ---------------------------------------------------------------------------
// Request / Response shapes
// ---------------------------------------------------------------------------

/** Payload accepted for POST /acct-groups */
export interface CreateAcctGroupDto {
  pk_grp_id?: number | undefined;
  group_name: string;
  fk_main_id?: number | undefined;
  fk_sub_id?: number | undefined;
  fk_prt_id: number;
  grouping: number;
  prefix: string; // max 1 char
  dc: 'DR' | 'CR' | 'D' | 'C';
  fk_user_id: string; // char(5)
}

/** Payload accepted for PUT /acct-groups/:id */
export interface UpdateAcctGroupDto {
  group_name?: string | undefined;
  fk_main_id?: number | undefined;
  fk_sub_id?: number | undefined;
  fk_prt_id?: number | undefined;
  grouping?: number | undefined;
  prefix?: string | undefined;
  dc?: 'DR' | 'CR' | 'D' | 'C' | undefined;
  fk_user_id?: string | undefined;
}

/** Shape returned to clients (adds computed / joined fields) */
export interface AcctGroupResponse extends AcctGroup {
  /** GroupName of the immediate parent, joined in the SELECT */
  parent_name?: string | null;
  /** Display name of the user who last modified */
  username?: string | null;
}

/** Flat tree node used when building the hierarchy */
export interface AcctGroupTreeNode extends AcctGroupResponse {
  children: AcctGroupTreeNode[];
}

// ---------------------------------------------------------------------------
// Filter / query params
// ---------------------------------------------------------------------------
export interface AcctGroupQuery {
  group_name?: string | undefined;
  parent_name?: string | undefined;
  username?: string | undefined;
  last_status?: string | undefined;
  date_time_stamp?: string | undefined; // ISO date string
}
