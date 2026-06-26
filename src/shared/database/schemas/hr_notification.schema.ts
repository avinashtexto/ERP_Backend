import { pgTable, varchar, timestamp, text, smallint, boolean, index, integer } from 'drizzle-orm/pg-core';

export const hr_notification = pgTable(
  'hr_notification',
  {
    pk_notif_id: integer('pk_notif_id').primaryKey().notNull().generatedByDefaultAsIdentity(),
    not_date: timestamp('not_date').defaultNow().notNull(),
    form_name: varchar('form_name', { length: 100 }).notNull(),
    announcement: text('announcement'),
    file_name: varchar('file_name', { length: 255 }),
    s_id: varchar('s_id', { length: 50 }),
    n_id: integer('n_id').notNull(),
    edit_mode: smallint('edit_mode'),
    fk_user_id: integer('fk_user_id'),
    fk_set_id: varchar('fk_set_id', { length: 50 }),
    authorize: boolean('authorize').default(false),
  },
  (t) => [index('idx_hr_notification_form_nid').on(t.form_name, t.n_id)],
);
