import { pgTable, char, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

/* -------------------------------------------------------------------------- */
/*                              Cont Department                               */
/* -------------------------------------------------------------------------- */

export const contDepartment = pgTable('cont_department', {
  pk_dep_id: integer('pk_dep_id').primaryKey().generatedByDefaultAsIdentity(),
  department: varchar('department', { length: 30 }).notNull().unique(),
  date_time_stamp: timestamp('date_time_stamp').notNull(),
  fk_user_id: integer('fk_user_id')
    .notNull()
    .references(() => appUser.pk_user_id),
  last_status: varchar('last_status', { length: 10 }).notNull(),
});

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type ContDepartment = typeof contDepartment.$inferSelect;
export type NewContDepartment = typeof contDepartment.$inferInsert;
