// ─── Shared DTO Types ─────────────────────────────────────────────────────────

export interface ModeOfContactDto {
  pk_moc_id: number;
  moc: string;
  fk_mt_id: number;
  date_timestamp: Date | string;
  fk_user_id: number;
  last_status: string;
  // Joined fields
  mode?: string; // from cont_moc_type
  username?: string; // from app_user
}

export interface ModeOfContactTypeDto {
  pk_mt_id: number;
  mode: string;
}
