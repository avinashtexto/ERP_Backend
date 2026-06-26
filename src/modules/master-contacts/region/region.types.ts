export interface Region {
  pk_reg_id: number;
  region: string;
  rate1: string | number;
  rate2: string | number;
  date_timestamp: Date | string;
  fk_user_id: number;
  last_status: string;
  username?: string;
}
