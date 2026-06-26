import { pgTable, varchar, char, integer } from 'drizzle-orm/pg-core';

export const sal_emp_contact = pgTable('sal_emp_contact', {
  pk_cont_id: integer('pk_cont_id').primaryKey().generatedByDefaultAsIdentity(),
  fk_emp_id: integer('fk_emp_id').notNull(),
  fk_moc_id: char('fk_moc_id', { length: 5 }).notNull(),
  contact: varchar('contact', { length: 50 }).notNull(),
  ext: varchar('ext', { length: 10 }).notNull(),
  sr_no: integer('sr_no').notNull(),
});

export type SalEmpContact = typeof sal_emp_contact.$inferSelect;
export type NewSalEmpContact = typeof sal_emp_contact.$inferInsert;
