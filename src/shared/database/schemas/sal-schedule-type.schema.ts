import { pgTable, integer, varchar, char, boolean, timestamp } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

export const sal_schedule_type = pgTable('sal_schedule_type', {
  pk_st_id: integer('pk_st_id').primaryKey().generatedByDefaultAsIdentity(),
  type: varchar('type', {
    length: 100,
  }),
  date_time_stamp: timestamp('date_time_stamp'),
  fk_user_id: integer('fk_user_id').references(() => appUser.pk_user_id),
  last_status: varchar('last_status', {
    length: 10,
  }),
});
