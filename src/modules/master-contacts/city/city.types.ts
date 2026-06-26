// ─────────────────────────────────────────────
// city.types.ts
// ─────────────────────────────────────────────

export interface City {
  pk_city_id: number;
  city: string;
  fk_state_id: number | null | undefined;
  fk_ctry_id: number;
  std_code: string;
  date_time_stamp: Date;
  fk_user_id: number;
  last_status: string;
}

/** Joined / enriched view returned by FillCity query */
export interface CityDropdownItem {
  pk_city_id: number;
  city: string;
  fk_state_id: number | null | undefined;
  fk_ctry_id: number;
  std_code: string;
  state: string | null | undefined;
  country: string | null | undefined;
  isd_code: string | null | undefined;
}

export interface CreateCityDto {
  city: string;
  fk_state_id?: number | null;
  fk_ctry_id: number;
  std_code?: string;
  fk_user_id: number;
}

export interface UpdateCityDto {
  city?: string | undefined;
  fk_state_id?: number | null | undefined;
  fk_ctry_id?: number | undefined;
  std_code?: string | undefined;
  fk_user_id?: number | undefined;
}

export interface CityFilterParams {
  city?: string | undefined;
  state?: string | undefined;
  country?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
