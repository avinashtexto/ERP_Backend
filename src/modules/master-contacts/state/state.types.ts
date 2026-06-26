export interface State {
  pk_state_id: number;
  state: string;
  fk_ctry_id: number;
  state_code: string;
  date_time_stamp: Date | string;
  fk_user_id: number;
  last_status: string;
  // Joined fields
  country?: string;
  username?: string;
}
