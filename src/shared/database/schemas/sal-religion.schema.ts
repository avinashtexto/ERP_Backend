import { pgTable, integer, varchar, char, boolean, timestamp } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

export const sal_religion = pgTable('sal_religion', {
  pk_rg_id: integer('pk_rg_id').primaryKey().generatedByDefaultAsIdentity(),
  religion: varchar('religion', {
    length: 50,
  }),
  date_time_stamp: timestamp('date_time_stamp'),
  fk_user_id: integer('fk_user_id').references(() => appUser.pk_user_id),
  last_status: varchar('last_status', {
    length: 10,
  }),
});
