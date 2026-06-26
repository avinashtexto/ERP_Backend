import { pgTable, varchar, integer, boolean, char, timestamp } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

export const email_configuration = pgTable('email_configuration', {
  pk_ec_id: integer('pk_ec_id').primaryKey().generatedByDefaultAsIdentity(),

  from_email: varchar('from_email', {
    length: 75,
  }).notNull(),

  password: varchar('password', {
    length: 30,
  }).notNull(),

  pop_server: varchar('pop_server', {
    length: 30,
  }).notNull(),

  pop_port: integer('pop_port').notNull(),

  smtp_server: varchar('smtp_server', {
    length: 30,
  }).notNull(),

  smtp_port: integer('smtp_port').notNull(),

  to_email: varchar('to_email', {
    length: 75,
  }).notNull(),

  ssl: boolean('ssl').notNull(),

  date_time_stamp: timestamp('date_time_stamp').notNull(),

  fk_user_id: integer('fk_user_id')
    .notNull()
    .references(() => appUser.pk_user_id),

  last_status: varchar('last_status', {
    length: 10,
  }).notNull(),

  m_default: boolean('m_default').notNull(),
});
