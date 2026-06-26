import { pgTable, varchar, integer, index } from 'drizzle-orm/pg-core';

export const sal_leave_encashment = pgTable(
  'sal_leave_encashment',
  {
    pk_sle_id: varchar('pk_sle_id', { length: 50 }).primaryKey().notNull(),
    fk_emp_id: varchar('fk_emp_id', { length: 50 }).notNull(),
    le_year: integer('le_year').notNull(),
    e_day: varchar('e_day', { length: 20 }).default('0'),
  },
  (t) => [index('idx_sal_leave_encashment_emp_year').on(t.fk_emp_id, t.le_year)],
);
