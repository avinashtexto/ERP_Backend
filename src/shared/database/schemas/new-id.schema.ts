import { pgTable, varchar, boolean, numeric } from 'drizzle-orm/pg-core';

export const newId = pgTable('new_id', {
  form_name: varchar('form_name', { length: 100 }).primaryKey(),
  prefix: varchar('prefix', { length: 5 }),
  last_id: numeric('last_id', { precision: 18, scale: 0 }),
  start_with: numeric('start_with', { precision: 18, scale: 0 }),
  len: numeric('len', { precision: 18, scale: 0 }),
  module_name: varchar('module_name', { length: 50 }),
  module_caption: varchar('module_caption', { length: 50 }),
  module_id: numeric('module_id', { precision: 18, scale: 0 }),
  form_id: numeric('form_id', { precision: 18, scale: 0 }),
  news: boolean('news'),
});
