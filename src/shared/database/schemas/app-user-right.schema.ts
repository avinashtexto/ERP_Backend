import { relations } from 'drizzle-orm';
import { pgTable, varchar, boolean, timestamp, bigint, uniqueIndex } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';
import { newId } from './new-id.schema.js';

export const appUserRight = pgTable(
  'app_user_right',
  {
    pk_right_id: bigint('pk_right_id', { mode: 'number' })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    form: varchar('form', { length: 100 })
      .notNull()
      .references(() => newId.form_name),
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => appUser.pk_user_id),
    add: boolean('add'),
    edit: boolean('edit'),
    delete: boolean('delete'),
    view: boolean('view'),
    print: boolean('print'),
    export: boolean('export'),
    authorize: boolean('authorize'),
    date_time_stamp: timestamp('date_time_stamp').notNull().defaultNow(),
    fk_user_id: bigint('fk_user_id', { mode: 'number' })
      .notNull()
      .references(() => appUser.pk_user_id),
    last_status: varchar('last_status', { length: 10 }).notNull().default(''),
  },
  (table) => [uniqueIndex('uq_app_user_right').on(table.user_id, table.form)],
);

export const appUserRightRelations = relations(appUserRight, ({ one }) => ({
  user: one(appUser, { fields: [appUserRight.user_id], references: [appUser.pk_user_id] }),
}));
