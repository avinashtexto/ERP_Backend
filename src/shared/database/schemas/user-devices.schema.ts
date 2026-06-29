import { pgTable, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUser } from './app-user.schema.js';

export const userDevices = pgTable('user_devices', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  user_id: integer('user_id')
    .notNull()
    .references(() => appUser.pk_user_id, { onDelete: 'cascade' }),
  device_token: text('device_token').notNull().unique(),
  device_type: varchar('device_type', { length: 50 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(appUser, {
    fields: [userDevices.user_id],
    references: [appUser.pk_user_id],
  }),
}));
