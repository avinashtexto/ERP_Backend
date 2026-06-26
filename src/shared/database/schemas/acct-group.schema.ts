import { relations } from 'drizzle-orm';
import { pgTable, integer, varchar, char, boolean, timestamp, bigint } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

// ---------------------------------------------------------------------------
// acct_group
// Self-referencing hierarchy:
//   fk_main_id -> root / main group   (level-1 ancestor)
//   fk_sub_id  -> sub  / own anchor   (level-2 anchor; equals pk when it IS the sub-group)
//   fk_prt_id  -> immediate parent    (direct parent node in the tree)
// ---------------------------------------------------------------------------

export const acct_group = pgTable('acct_group', {
  pk_grp_id: integer('pk_grp_id').primaryKey().generatedByDefaultAsIdentity(),
  group_name: varchar('group_name', { length: 40 }).notNull().unique(),
  fk_main_id: integer('fk_main_id')
    .notNull()
    .references((): any => acct_group.pk_grp_id),
  fk_sub_id: integer('fk_sub_id')
    .notNull()
    .references((): any => acct_group.pk_grp_id),
  fk_prt_id: integer('fk_prt_id')
    .notNull()
    .references((): any => acct_group.pk_grp_id),
  grouping: integer('grouping').notNull(),
  prefix: varchar('prefix', { length: 1 }).notNull(),
  dc: varchar('dc', { length: 2 }).notNull(),
  date_time_stamp: timestamp('date_time_stamp', { mode: 'date' }).notNull(),
  fk_user_id: bigint('fk_user_id', { mode: 'number' })
    .notNull()
    .references(() => appUser.pk_user_id),
  last_status: varchar('last_status', { length: 10 }).notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const acct_group_relations = relations(acct_group, ({ one, many }) => ({
  main_group: one(acct_group, {
    fields: [acct_group.fk_main_id],
    references: [acct_group.pk_grp_id],
    relationName: 'main_group',
  }),

  /** The sub-group anchor */
  sub_group: one(acct_group, {
    fields: [acct_group.fk_sub_id],
    references: [acct_group.pk_grp_id],
    relationName: 'sub_group',
  }),

  /** Direct parent in the hierarchy */
  parent_group: one(acct_group, {
    fields: [acct_group.fk_prt_id],
    references: [acct_group.pk_grp_id],
    relationName: 'parent_group',
  }),

  /** All groups whose immediate parent is this record */
  children: many(acct_group, {
    relationName: 'parent_group',
  }),

  /** The user who last modified this group */
  user: one(appUser, {
    fields: [acct_group.fk_user_id],
    references: [appUser.pk_user_id],
  }),
}));

export type AcctGroup = typeof acct_group.$inferSelect;
export type NewAcctGroup = typeof acct_group.$inferInsert;
