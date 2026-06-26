import { pgTable, char, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

/* -------------------------------------------------------------------------- */
/*                             Cont Qualification                             */
/* -------------------------------------------------------------------------- */

export const contQualification = pgTable('cont_qualification', {
  pk_qua_id: integer('pk_qua_id').primaryKey().generatedByDefaultAsIdentity(),
  qualification: varchar('qualification', { length: 40 }).notNull().unique(),
  date_time_stamp: timestamp('date_time_stamp').notNull(),
  fk_user_id: integer('fk_user_id')
    .notNull()
    .references(() => appUser.pk_user_id),
  last_status: varchar('last_status', { length: 10 }).notNull(),
});

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type ContQualification = typeof contQualification.$inferSelect;
export type NewContQualification = typeof contQualification.$inferInsert;
