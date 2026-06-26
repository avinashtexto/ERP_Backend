// src/shared/database/schemas/hr-announcement.schema.ts
import {
  pgTable,
  numeric,
  varchar,
  char,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// hr_announcement  (HRAnnouncement)
// Referenced by hr_emp_announcement and hr_notification — defined first so
// foreign keys can reference it below.
// ---------------------------------------------------------------------------
export const hr_announcement = pgTable("hr_announcement", {
  pk_an_id: integer("pk_an_id").primaryKey().generatedByDefaultAsIdentity(),

  ref_no: varchar("ref_no", { length: 20 }).notNull(),
  ref_date: timestamp("ref_date", { mode: "date" }).notNull(),

  fk_nt_id: integer("fk_nt_id"), // FK -> hr_notice_type.pk_nt_id (nullable)

  announcement: varchar("announcement", { length: 2000 }).notNull(),
  file_name: varchar("file_name", { length: 255 }).notNull().default(""),

  sys_defined: boolean("sys_defined").notNull().default(false),
  date_timestamp: timestamp("date_timestamp", { mode: "date" }).notNull(),

  fk_user_id: char("fk_user_id", { length: 5 }).notNull(),

  last_status: varchar("last_status", { length: 10 }).notNull(),

  authorize: boolean("authorize").notNull().default(false),
  a_timestamp: timestamp("a_timestamp", { mode: "date" }),
  fk_a_user_id: char("fk_a_user_id", { length: 5 }),

  sync: char("sync", { length: 1 }).notNull().default("N"),
});

// ---------------------------------------------------------------------------
// hr_emp_announcement  (HREmpAnnouncement)
// ---------------------------------------------------------------------------
export const hr_emp_announcement = pgTable("hr_emp_announcement", {
  pk_san_id: integer("pk_san_id").primaryKey().generatedByDefaultAsIdentity(),

  fk_an_id: integer("fk_an_id")
    .notNull()
    .references(() => hr_announcement.pk_an_id),

  // References SalStructure.pkSSId — declared as plain integer because
  // sal_structure lives outside this module boundary.
  fk_ss_id: integer("fk_ss_id").notNull(),
});

// ---------------------------------------------------------------------------
// hr_notice_type  (HRNoticeType) — lookup table referenced by hr_announcement
// ---------------------------------------------------------------------------
export const hr_notice_type = pgTable("hr_notice_type", {
  pk_nt_id: integer("pk_nt_id").primaryKey().generatedByDefaultAsIdentity(),
  type: varchar("type", { length: 100 }).notNull(),
});

// ============ Audit Log Table ============
export const audit_log = pgTable(
  'audit_log',
  {
    pk_audit_id: integer('pk_audit_id').primaryKey().generatedByDefaultAsIdentity(),
    action: varchar('action', { length: 50 }).notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    resource_id: integer('resource_id'),
    old_values: jsonb('old_values'),
    new_values: jsonb('new_values'),
    user_id: varchar('user_id', { length: 50 }),
    user_ip: varchar('user_ip', { length: 45 }),
    user_agent: varchar('user_agent', { length: 255 }),
    timestamp: timestamp('timestamp', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_audit_log_resource').on(table.resource, table.resource_id),
    index('idx_audit_log_user').on(table.user_id),
  ]
);

// ============ Notification Log Table ============
export const notification_log = pgTable(
  'notification_log',
  {
    pk_notif_log_id: integer('pk_notif_log_id').primaryKey().generatedByDefaultAsIdentity(),
    announcement_id: integer('announcement_id').references(() => hr_announcement.pk_an_id, { onDelete: 'cascade' }),
    user_id: varchar('user_id', { length: 50 }),
    channel: varchar('channel', { length: 50 }).notNull(),
    status: varchar('status', { length: 50 }).notNull(),
    sent_at: timestamp('sent_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
    delivered_at: timestamp('delivered_at', { mode: 'date', withTimezone: true }),
    error_message: varchar('error_message', { length: 255 }),
  },
  (table) => [
    index('idx_notification_log_announcement').on(table.announcement_id),
    index('idx_notification_log_user').on(table.user_id),
  ]
);

// ============ Sync Log Table ============
export const sync_log = pgTable(
  'sync_log',
  {
    pk_sync_id: integer('pk_sync_id').primaryKey().generatedByDefaultAsIdentity(),
    announcement_id: integer('announcement_id').references(() => hr_announcement.pk_an_id, { onDelete: 'cascade' }),
    destination: varchar('destination', { length: 50 }).notNull(),
    status: varchar('status', { length: 50 }).notNull(),
    sync_data: jsonb('sync_data'),
    error: text('error'),
    attempted_at: timestamp('attempted_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
    completed_at: timestamp('completed_at', { mode: 'date', withTimezone: true }),
  },
  (table) => [
    index('idx_sync_log_announcement').on(table.announcement_id),
  ]
);

// ============ File Metadata Table ============
export const file_metadata = pgTable(
  'file_metadata',
  {
    pk_file_id: integer('pk_file_id').primaryKey().generatedByDefaultAsIdentity(),
    announcement_id: integer('announcement_id').references(() => hr_announcement.pk_an_id, { onDelete: 'cascade' }),
    file_name: varchar('file_name', { length: 255 }).notNull(),
    file_size: integer('file_size').notNull(),
    mime_type: varchar('mime_type', { length: 100 }).notNull(),
    storage_path: varchar('storage_path', { length: 500 }).notNull(),
    virus_scanned: boolean('virus_scanned').default(false).notNull(),
    scan_result: varchar('scan_result', { length: 255 }),
    uploaded_by: varchar('uploaded_by', { length: 50 }),
    uploaded_at: timestamp('uploaded_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
    accessed_count: integer('accessed_count').default(0).notNull(),
    last_accessed: timestamp('last_accessed', { mode: 'date', withTimezone: true }),
  },
  (table) => [
    index('idx_file_metadata_announcement').on(table.announcement_id),
  ]
);

// ---------------------------------------------------------------------------
// Drizzle relations
// ---------------------------------------------------------------------------
export const hr_announcement_relations = relations(
  hr_announcement,
  ({ one, many }) => ({
    notice_type: one(hr_notice_type, {
      fields: [hr_announcement.fk_nt_id],
      references: [hr_notice_type.pk_nt_id],
    }),
    emp_announcements: many(hr_emp_announcement),
  })
);

export const hr_emp_announcement_relations = relations(
  hr_emp_announcement,
  ({ one }) => ({
    announcement: one(hr_announcement, {
      fields: [hr_emp_announcement.fk_an_id],
      references: [hr_announcement.pk_an_id],
    }),
  })
);

export const hr_notice_type_relations = relations(
  hr_notice_type,
  ({ many }) => ({
    announcements: many(hr_announcement),
  })
);

export type HrAnnouncement = typeof hr_announcement.$inferSelect;
export type HrAnnouncementInsert = typeof hr_announcement.$inferInsert;
export type HrNoticeType = typeof hr_notice_type.$inferSelect;
export type HrNoticeTypeInsert = typeof hr_notice_type.$inferInsert;
export type HrEmpAnnouncement = typeof hr_emp_announcement.$inferSelect;
export type HrEmpAnnouncementInsert = typeof hr_emp_announcement.$inferInsert;
export type AuditLog = typeof audit_log.$inferSelect;
export type AuditLogInsert = typeof audit_log.$inferInsert;
export type NotificationLog = typeof notification_log.$inferSelect;
export type NotificationLogInsert = typeof notification_log.$inferInsert;
export type SyncLog = typeof sync_log.$inferSelect;
export type SyncLogInsert = typeof sync_log.$inferInsert;
export type FileMetadata = typeof file_metadata.$inferSelect;
export type FileMetadataInsert = typeof file_metadata.$inferInsert;
