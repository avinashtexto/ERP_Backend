import { pgTable, char, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

/* -------------------------------------------------------------------------- */
/*                              Cont Designation                              */
/* -------------------------------------------------------------------------- */

export const contDesignation = pgTable('cont_designation', {
  pk_des_id: integer('pk_des_id').primaryKey().generatedByDefaultAsIdentity(),
  designation: varchar('designation', { length: 30 }).notNull().unique(),
  date_time_stamp: timestamp('date_time_stamp').notNull(),
  fk_user_id: integer('fk_user_id')
    .notNull()
    .references(() => appUser.pk_user_id),
  last_status: varchar('last_status', { length: 10 }).notNull(),
  se: boolean('se').notNull(),
});

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type ContDesignation = typeof contDesignation.$inferSelect;
export type NewContDesignation = typeof contDesignation.$inferInsert;
