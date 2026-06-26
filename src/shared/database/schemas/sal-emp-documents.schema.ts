import { pgTable, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const sal_emp_documents = pgTable('sal_emp_documents', {
  pk_d_emp_id: integer('pk_d_emp_id').primaryKey().generatedByDefaultAsIdentity(),
  fk_emp_id: integer('fk_emp_id').notNull(),
  fk_dt_id: integer('fk_dt_id').notNull(),
  doc_file: varchar('doc_file', { length: 100 }).notNull(),
  valid_until: timestamp('valid_until'),
});

export type SalEmpDocuments = typeof sal_emp_documents.$inferSelect;
export type NewSalEmpDocuments = typeof sal_emp_documents.$inferInsert;
