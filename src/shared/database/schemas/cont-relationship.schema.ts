import { pgTable, char, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

/* -------------------------------------------------------------------------- */
/*                             Cont Relationship                              */
/* -------------------------------------------------------------------------- */

export const contRelationship = pgTable('cont_relationship', {
  pk_rel_id: integer('pk_rel_id').primaryKey().generatedByDefaultAsIdentity(),
  relationship: varchar('relationship', { length: 30 }).notNull().unique(),
  date_time_stamp: timestamp('date_time_stamp').notNull(),
  fk_user_id: integer('fk_user_id')
    .notNull()
    .references(() => appUser.pk_user_id),
  last_status: varchar('last_status', { length: 10 }).notNull(),
});

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type ContRelationship = typeof contRelationship.$inferSelect;
export type NewContRelationship = typeof contRelationship.$inferInsert;
