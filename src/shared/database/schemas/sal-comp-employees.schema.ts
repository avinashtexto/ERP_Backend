import { pgTable, numeric, varchar, text, serial, foreignKey, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { salEmployee as sal_employee } from './sal-employees.schema.js';

// 1. Complaint Table
export const sal_emp_complaint = pgTable('sal_emp_complaint', {
  pk_com_id: numeric('pk_com_id', { precision: 18, scale: 0 }).primaryKey().notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).default('complaint').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 2. Complaint-Employee Junction Table
export const sal_comp_employees = pgTable(
  'sal_comp_employees',
  {
    pk_ecom_id: integer('pk_ecom_id').primaryKey().generatedByDefaultAsIdentity().notNull(),
    fk_com_id: numeric('fk_com_id', { precision: 18, scale: 0 }).notNull(),
    fk_emp_id: integer('fk_emp_id').notNull(), // Matches pk_emp_id of sal_employee
  },
  (table) => [
    foreignKey({
      columns: [table.fk_com_id],
      foreignColumns: [sal_emp_complaint.pk_com_id],
      name: 'fk_sal_comp_em_com',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.fk_emp_id],
      foreignColumns: [sal_employee.pk_emp_id],
      name: 'fk_sal_comp_em_emp',
    }).onDelete('cascade'),
  ]
);

// 3. Complaint Attachments Table (Multiple attachments: doc, doc_type, etc.)
export const sal_comp_attachments = pgTable(
  'sal_comp_attachments',
  {
    pk_att_id: integer('pk_att_id').primaryKey().generatedByDefaultAsIdentity().notNull(),
    fk_com_id: numeric('fk_com_id', { precision: 18, scale: 0 }).notNull(),
    file_name: varchar('file_name', { length: 255 }).notNull(),
    file_path: varchar('file_path', { length: 500 }).notNull(),
    doc_type: varchar('doc_type', { length: 100 }).notNull(), // doc, pdf, png, etc.
    uploaded_at: timestamp('uploaded_at').defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.fk_com_id],
      foreignColumns: [sal_emp_complaint.pk_com_id],
      name: 'fk_sal_comp_att_com',
    }).onDelete('cascade'),
  ]
);

// Drizzle Relations
export const sal_emp_complaint_relations = relations(sal_emp_complaint, ({ many }) => ({
  employees: many(sal_comp_employees),
  attachments: many(sal_comp_attachments),
}));

export const sal_comp_employees_relations = relations(sal_comp_employees, ({ one }) => ({
  complaint: one(sal_emp_complaint, {
    fields: [sal_comp_employees.fk_com_id],
    references: [sal_emp_complaint.pk_com_id],
  }),
  employee: one(sal_employee, {
    fields: [sal_comp_employees.fk_emp_id],
    references: [sal_employee.pk_emp_id],
  }),
}));

export const sal_comp_attachments_relations = relations(sal_comp_attachments, ({ one }) => ({
  complaint: one(sal_emp_complaint, {
    fields: [sal_comp_attachments.fk_com_id],
    references: [sal_emp_complaint.pk_com_id],
  }),
}));

export type SalEmpComplaint = typeof sal_emp_complaint.$inferSelect;
export type NewSalEmpComplaint = typeof sal_emp_complaint.$inferInsert;
export type SalCompEmployee = typeof sal_comp_employees.$inferSelect;
export type NewSalCompEmployee = typeof sal_comp_employees.$inferInsert;
export type SalCompAttachment = typeof sal_comp_attachments.$inferSelect;
export type NewSalCompAttachment = typeof sal_comp_attachments.$inferInsert;
