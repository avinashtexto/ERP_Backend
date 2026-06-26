import { pgTable, varchar, date, boolean, index } from 'drizzle-orm/pg-core';

export const sal_attendance = pgTable(
  'sal_attendance',
  {
    pk_at_id: varchar('pk_at_id', { length: 50 }).primaryKey().notNull(),
    fk_ss_id: varchar('fk_ss_id', { length: 50 }).notNull(),
    at_date: date('at_date').notNull(),
    w_type: varchar('w_type', { length: 50 }),
    authorize: boolean('authorize').default(false),
  },
  (t) => [
    index('idx_sal_attendance_ss_date').on(t.fk_ss_id, t.at_date),
    index('idx_sal_attendance_w_type').on(t.w_type),
  ],
);
