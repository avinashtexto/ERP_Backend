// src/modules/hr-announcement/hr-announcement.types.ts
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  hr_announcement,
  hr_emp_announcement,
  hr_notice_type,
} from "../../shared/database/schemas/hr-announcement.schema.js";
import type { hr_notification } from "../../shared/database/schemas/hr_notification.schema.js";
import type { temp_table } from "../../shared/database/schemas/temp_table.schema.js";

// ---------------------------------------------------------------------------
// Base row types (full DB row)
// ---------------------------------------------------------------------------
export type HrAnnouncement = InferSelectModel<typeof hr_announcement>;
export type HrEmpAnnouncement = InferSelectModel<typeof hr_emp_announcement>;
export type HrNotification = InferSelectModel<typeof hr_notification>;
export type HrNoticeType = InferSelectModel<typeof hr_notice_type>;
export type TempTable = InferSelectModel<typeof temp_table>;

// ---------------------------------------------------------------------------
// Insert types (omit auto-generated primary keys)
// ---------------------------------------------------------------------------
export type NewHrAnnouncement = InferInsertModel<typeof hr_announcement>;
export type NewHrEmpAnnouncement = InferInsertModel<typeof hr_emp_announcement>;
export type NewHrNotification = InferInsertModel<typeof hr_notification>;
export type NewHrNoticeType = InferInsertModel<typeof hr_notice_type>;

// ---------------------------------------------------------------------------
// Rich / joined view types used by the list grid
// ---------------------------------------------------------------------------
export type HrAnnouncementListRow = HrAnnouncement & {
  type: string | null;           // from hr_notice_type.type
  username: string;              // resolved display name of the entry user
  a_user: string | null;        // display name of the authorising user
};

// ---------------------------------------------------------------------------
// Filter / pagination parameters passed from the client
// ---------------------------------------------------------------------------
export type AnnouncementListFilter = {
  ref_no?: string | undefined;
  type?: string | undefined;
  announcement?: string | undefined;
  username?: string | undefined;
  last_status?: string | undefined;
  from_ref_date?: Date | undefined;
  to_ref_date?: Date | undefined;
  from_timestamp?: Date | undefined;
  to_timestamp?: Date | undefined;
  from_a_timestamp?: Date | undefined;
  to_a_timestamp?: Date | undefined;
  a_user?: string | undefined;
  own_record?: boolean | undefined;
  fk_user_id?: string | undefined;
};

export type PaginationParams = {
  page: number;
  page_size: number;
};

// ---------------------------------------------------------------------------
// Service-layer result wrappers
// ---------------------------------------------------------------------------
export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Attachment / document metadata
// ---------------------------------------------------------------------------
export type DocAttachment = {
  file_name: string;       // stored filename in the Documents/Notice folder
  local_path: string;      // absolute path on the current server
  ftp_path: string;        // FTP destination path
};

// ---------------------------------------------------------------------------
// Authorization payload
// ---------------------------------------------------------------------------
export type AuthorizePayload = {
  pk_an_id: number;
  fk_a_user_id: string;
  a_user_name: string;
};
