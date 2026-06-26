// ─── sal_nature_of_work.types.ts ──────────────────────────────────────────────

export type NatureOfWorkRow = {
  pk_nw_id: number;
  nature_of_work: string;
  date_timestamp: Date | null;
  fk_user_id: number | null;
  last_status: string | null;
  username: string | null;
};

export type CreateNatureOfWorkDto = {
  nature_of_work: string;
  fk_user_id: number;
};

export type UpdateNatureOfWorkDto = {
  pk_nw_id: number;
  nature_of_work: string;
  fk_user_id: number;
};

export type DeleteNatureOfWorkDto = {
  pk_nw_id: number;
};

export type NatureOfWorkListFilter = {
  nature_of_work?: string | undefined;
  username?: string | undefined;
  last_status?: string | undefined;
  date_timestamp?: string | undefined;
};

export type ApiResponse<T> = { success: true; data: T } | { success: false; message: string };
