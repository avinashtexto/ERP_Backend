import { sal_castes } from '@/shared/database/schemas/sal-castes.schema.js';
import { sal_religion } from '@/shared/database/schemas/sal-religion.schema.js';
import { sal_schedule_type } from '@/shared/database/schemas/sal-schedule-type.schema.js';
import { sal_skintone } from '@/shared/database/schemas/sal-skintone.schema.js';

// --- Skintone Types ---
export type SalSkintone = typeof sal_skintone.$inferSelect;
export type NewSalSkintone = typeof sal_skintone.$inferInsert;

export interface CreateSalSkintoneDto {
  colour: string;
  fk_user_id: number;
}

export interface UpdateSalSkintoneDto {
  colour?: string | undefined;
  fk_user_id?: number | undefined;
}

export interface SalSkintoneResponse extends SalSkintone {
  username?: string | null;
}

export interface SalSkintoneQuery {
  colour?: string | undefined;
  last_status?: string | undefined;
}

// --- Castes Types ---
export type SalCastes = typeof sal_castes.$inferSelect;
export type NewSalCastes = typeof sal_castes.$inferInsert;

export interface CreateSalCastesDto {
  caste: string;
  fk_user_id: number;
}

export interface UpdateSalCastesDto {
  caste?: string | undefined;
  fk_user_id?: number | undefined;
}

export interface SalCastesResponse extends SalCastes {
  username?: string | null;
}

export interface SalCastesQuery {
  caste?: string | undefined;
  last_status?: string | undefined;
}

// --- Religion Types ---
export type SalReligion = typeof sal_religion.$inferSelect;
export type NewSalReligion = typeof sal_religion.$inferInsert;

export interface CreateSalReligionDto {
  religion: string;
  fk_user_id: number;
}

export interface UpdateSalReligionDto {
  religion?: string | undefined;
  fk_user_id?: number | undefined;
}

export interface SalReligionResponse extends SalReligion {
  username?: string | null;
}

export interface SalReligionQuery {
  religion?: string | undefined;
  last_status?: string | undefined;
}

// --- ScheduleType Types ---
export type SalScheduleType = typeof sal_schedule_type.$inferSelect;
export type NewSalScheduleType = typeof sal_schedule_type.$inferInsert;

export interface CreateSalScheduleTypeDto {
  type: string;
  fk_user_id: number;
}

export interface UpdateSalScheduleTypeDto {
  type?: string | undefined;
  fk_user_id?: number | undefined;
}

export interface SalScheduleTypeResponse extends SalScheduleType {
  username?: string | null;
}

export interface SalScheduleTypeQuery {
  type?: string | undefined;
  last_status?: string | undefined;
}
