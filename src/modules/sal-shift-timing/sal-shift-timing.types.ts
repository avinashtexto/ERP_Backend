export interface ShiftTimingInput {
  shift: string;
  s_work: Date;
  e_work: Date;
  t_work: string;
  s_break: Date;
  e_break: Date;
  t_break: string;
  sd: boolean;
  date_time_stamp: Date;
  fk_user_id: string;
  last_status: string;
}

export interface ShiftTimingUpdate {
  shift?: string;
  s_work?: Date;
  e_work?: Date;
  t_work?: string;
  s_break?: Date;
  e_break?: Date;
  t_break?: string;
  sd?: boolean;
  date_time_stamp?: Date;
  fk_user_id?: string;
  last_status?: string;
}

export interface ShiftTimingResponse {
  pk_st_id: number;
  shift: string;
  s_work: Date;
  e_work: Date;
  t_work: string;
  s_break: Date;
  e_break: Date;
  t_break: string;
  sd: boolean;
  date_time_stamp: Date;
  fk_user_id: string;
  last_status: string;
}
