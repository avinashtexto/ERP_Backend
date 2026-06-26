// src/modules/hr-announcement/hr-announcement.dto.ts
import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------
const user_id_schema = z
  .string()
  .trim()
  .min(1)
  .max(5, "User ID must be at most 5 characters");

const set_id_schema = z
  .string()
  .trim()
  .max(5, "Set ID must be at most 5 characters")
  .nullable()
  .optional();

// ---------------------------------------------------------------------------
// Create announcement DTO
// ---------------------------------------------------------------------------
export const create_announcement_dto = z.object({
  ref_no: z
    .string()
    .trim()
    .min(1, "Reference No. is required")
    .max(20, "Reference No. must be at most 20 characters"),

  ref_date: z.coerce.date(),

  fk_nt_id: z
    .number()
    .int()
    .positive("Notice Type is required")
    .nullable()
    .optional(),

  announcement: z
    .string()
    .trim()
    .min(1, "Announcement / Notice text is required")
    .max(2000),

  file_name: z.string().trim().max(255).default(""),

  fk_user_id: user_id_schema,

  // IDs of SalStructure rows that should receive this announcement
  employee_ss_ids: z
    .array(z.number().int().positive())
    .min(1, "At least one employee must be selected"),

  authorize: z.boolean().default(false),
  fk_a_user_id: user_id_schema.optional(),
});

export type CreateAnnouncementDto = z.infer<typeof create_announcement_dto>;

// ---------------------------------------------------------------------------
// Update announcement DTO (all fields optional except primary key)
// ---------------------------------------------------------------------------
export const update_announcement_dto = create_announcement_dto
  .partial()
  .extend({
    pk_an_id: z.number().int().positive("Announcement ID is required"),
  });

export type UpdateAnnouncementDto = z.infer<typeof update_announcement_dto>;

// ---------------------------------------------------------------------------
// Authorize announcement DTO
// ---------------------------------------------------------------------------
export const authorize_announcement_dto = z.object({
  pk_an_id: z.number().int().positive(),
  fk_a_user_id: user_id_schema,
  a_user_name: z.string().trim().min(1),
});

export type AuthorizeAnnouncementDto = z.infer<
  typeof authorize_announcement_dto
>;

// ---------------------------------------------------------------------------
// Delete announcement DTO
// ---------------------------------------------------------------------------
export const delete_announcement_dto = z.object({
  pk_an_id: z.number().int().positive(),
  ref_no: z.string().trim().min(1),
});

export type DeleteAnnouncementDto = z.infer<typeof delete_announcement_dto>;

// ---------------------------------------------------------------------------
// List / filter DTO (query params)
// ---------------------------------------------------------------------------
export const list_announcement_dto = z.object({
  ref_no: z.string().trim().optional(),
  type: z.string().trim().optional(),
  announcement: z.string().trim().optional(),
  username: z.string().trim().optional(),
  last_status: z.string().trim().optional(),
  from_ref_date: z.coerce.date().optional(),
  to_ref_date: z.coerce.date().optional(),
  from_timestamp: z.coerce.date().optional(),
  to_timestamp: z.coerce.date().optional(),
  from_a_timestamp: z.coerce.date().optional(),
  to_a_timestamp: z.coerce.date().optional(),
  a_user: z.string().trim().optional(),
  own_record: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true")
    .optional(),
  fk_user_id: user_id_schema.optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(200).default(50),
});

export type ListAnnouncementDto = z.infer<typeof list_announcement_dto>;

// ---------------------------------------------------------------------------
// Notice-type create DTO
// ---------------------------------------------------------------------------
export const create_notice_type_dto = z.object({
  type: z
    .string()
    .trim()
    .min(1, "Type name is required")
    .max(100),
});

export type CreateNoticeTypeDto = z.infer<typeof create_notice_type_dto>;

// ---------------------------------------------------------------------------
// Notification insert DTO (internal use — called by service after save/delete)
// ---------------------------------------------------------------------------
export const create_notification_dto = z.object({
  not_date: z.coerce.date(),
  form_name: z.string().trim().max(100),
  announcement: z.string().trim().max(2500),
  file_name: z.string().trim().max(255).default(""),
  s_id: z.string().trim().max(30).nullable().optional(),
  n_id: z.number().int().nullable().optional(),
  edit_mode: z.number().int(),    // 0 = Add, 1 = Edit, 2 = Delete
  fk_user_id: user_id_schema,
  fk_set_id: set_id_schema,
  authorize: z.boolean().nullable().optional(),
  inform: z.boolean().nullable().optional(),
});

export type CreateNotificationDto = z.infer<typeof create_notification_dto>;
