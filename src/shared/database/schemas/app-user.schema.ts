import { relations } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  numeric,
  bigint,
  integer,
} from 'drizzle-orm/pg-core';

import { app_questions } from './app-questions.schema.js';
import { appUserBranch } from './app-user-branch.schema.js';
import { appUserDashboard } from './app-user-dashboard.schema.js';
import { appUserOther } from './app-user-other.schema.js';
import { appUserProcess } from './app-user-process.schema.js';
import { appUserReport } from './app-user-report.schema.js';
import { appUserRight } from './app-user-right.schema.js';
import { appUserSpecial } from './app-user-special.schema.js';

export const appUser = pgTable('app_user', {
  pk_user_id: integer('pk_user_id').primaryKey().generatedByDefaultAsIdentity(),
  username: varchar('username', { length: 15 }).notNull(),
  password: varchar('password', { length: 255 }),
  answer: varchar('answer', { length: 50 }),
  security_question: varchar('security_question', { length: 200 }),
  sal: varchar('sal', { length: 10 }),
  date_time_stamp: timestamp('date_time_stamp').defaultNow(),
  fk_user_id: bigint('fk_user_id', { mode: 'number' }),
  last_status: varchar('last_status', { length: 10 }),
  fk_ec_id: numeric('fk_ec_id', { precision: 18, scale: 0 }),
  own_records: boolean('own_records'),
  other_records: boolean('other_records'),
  mobile: varchar('mobile', { length: 20 }),
  email: varchar('email', { length: 100 }),
  fk_emp_id: numeric('fk_emp_id', { precision: 18, scale: 0 }),
  security_question_id: integer('security_question_id').references(
    () => app_questions.pk_question_id,
  ),
});

export const appUserRelations = relations(appUser, ({ many }) => ({
  rights: many(appUserRight),
  reports: many(appUserReport),
  others: many(appUserOther),
  specials: many(appUserSpecial),
  branches: many(appUserBranch),
  dashboards: many(appUserDashboard),
  processes: many(appUserProcess),
}));
