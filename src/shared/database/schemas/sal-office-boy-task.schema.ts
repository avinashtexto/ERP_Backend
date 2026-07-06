import { pgTable, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { salOfficeBoy } from './sal-office-boy.schema.js';

export const salOfficeBoyTask = pgTable('sal_office_boy_task', {
  pk_obt_id: integer('pk_obt_id').primaryKey().generatedByDefaultAsIdentity(),
  fk_ob_id: integer('fk_ob_id').references(() => salOfficeBoy.pk_ob_id),
  task: varchar('task', { length: 500 }).notNull(),
  task_date: timestamp('task_date').notNull(),
  task_time: timestamp('task_time').notNull(),
  remarks: varchar('remarks', { length: 500 }),
  status: varchar('status', { length: 20 }).notNull().default('Pending'),
  priority: varchar('priority', { length: 20 }).notNull().default('Medium'),
});

export type SalOfficeBoyTask = typeof salOfficeBoyTask.$inferSelect;
export type NewSalOfficeBoyTask = typeof salOfficeBoyTask.$inferInsert;
