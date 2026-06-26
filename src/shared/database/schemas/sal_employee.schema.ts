import { pgTable, varchar, date, index, integer } from 'drizzle-orm/pg-core';

export const sal_employee = pgTable(
  'sal_employee',
  {
    pk_emp_id: integer('pk_emp_id').primaryKey().notNull().generatedByDefaultAsIdentity(),
    fk_set_id: varchar('fk_set_id', { length: 50 }),
    type: varchar('type', { length: 50 }),
    emp_code: varchar('emp_code', { length: 30 }),
    doj: date('doj'),
    employee: varchar('employee', { length: 150 }),
    fk_dep_id: varchar('fk_dep_id', { length: 50 }),
    fk_deg_id: varchar('fk_deg_id', { length: 50 }),
  },
  (t) => [index('idx_sal_employee_fk_set_id').on(t.fk_set_id)],
);
