// ─── sal-it-section.types.ts ────────────────────────────────────────────────
import { sal_it_section } from '@/shared/database/schemas/sal-it-section.schema.js';

export type SalItSectionRow = typeof sal_it_section.$inferSelect & {
  username?: string | null;
};

export type CreateSalItSectionDto = {
  it_section: string;
  deduction?: string | null;
  fk_fy_id?: number | null;
  fk_user_id: number;
  additraction: 'Addition' | 'Subtraction';
};

export type UpdateSalItSectionDto = {
  pk_sec_id: number;
  it_section?: string;
  deduction?: string | null;
  fk_fy_id?: number | null;
  fk_user_id: number;
  additraction?: 'Addition' | 'Subtraction';
};

export type DeleteSalItSectionDto = {
  pk_sec_id: number;
};

export type SalItSectionListFilter = {
  it_section?: string | undefined;
  username?: string | undefined;
  last_status?: string | undefined;
  date_timestamp?: string | undefined;
  additraction?: string | undefined;
};

export type ApiResponse<T> = { success: true; data: T } | { success: false; message: string };
