import { pgTable, varchar, date } from 'drizzle-orm/pg-core';

export const sal_holidays = pgTable('sal_holidays', {
  pk_sh_id: varchar('pk_sh_id', { length: 50 }).primaryKey().notNull(),
  holiday_date: date('holiday_date').notNull(),
  holiday_name: varchar('holiday_name', { length: 100 }),
});
