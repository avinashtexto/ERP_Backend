import { pgTable, varchar, integer, index } from 'drizzle-orm/pg-core';

export const sal_annual_leave = pgTable(
  'sal_annual_leave',
  {
    pk_sal_id: integer('pk_sal_id').primaryKey().generatedAlwaysAsIdentity(),
    fk_emp_id: varchar('fk_emp_id', { length: 50 }).notNull(),
    cal_year: integer('cal_year').notNull(),
    al_roff: integer('al_roff').default(0),
    py_bal: integer('py_bal').default(0),
    tot_al: integer('tot_al').default(0),
  },
  (t) => [index('idx_sal_annual_leave_emp_year').on(t.fk_emp_id, t.cal_year)],
);
