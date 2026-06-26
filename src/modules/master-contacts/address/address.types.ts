// ─────────────────────────────────────────────
// address.types.ts
// ─────────────────────────────────────────────

export interface Address {
  pk_ca_id: number;
  fk_cont_id: number | null | undefined;
  address: string;
  fk_city_id: number | null | undefined;
  region: string;
  pincode: string | null | undefined; // numeric stored as string via Drizzle
  date_time_stamp: Date;
  fk_user_id: number;
  last_status: string;
}

/** Joined row returned by FillList / grList query (mirrors SELECT in VB code) */
export interface AddressListRow {
  pk_ca_id: number;
  address: string;
  date_time_stamp: Date;
  fk_user_id: number | null | undefined;
  last_status: string;
  username: string | null | undefined;
  pk_city_id: number | null | undefined;
  city: string | null | undefined;
  pk_ctry_id: number | null | undefined;
  country: string | null | undefined;
  pk_state_id: number | null | undefined;
  state: string | null | undefined;
  region: string;
  pincode: string | null | undefined;
  fk_cont_id: number | null | undefined;
  contact_name: string | null | undefined;
}

export interface CreateAddressDto {
  fk_cont_id: number;
  address: string;
  fk_city_id?: number | null;
  region?: string;
  pincode?: string | null;
  fk_user_id: number;
}

export interface UpdateAddressDto {
  fk_cont_id?: number | undefined;
  address?: string | undefined;
  fk_city_id?: number | null | undefined;
  region?: string | undefined;
  pincode?: string | null | undefined;
  fk_user_id?: number | undefined;
}

/** Parameters that mirror the grList FilterRow in VB */
export interface AddressFilterParams {
  contact_name?: string | undefined;
  address?: string | undefined;
  region?: string | undefined;
  pincode?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  country?: string | undefined;
  username?: string | undefined;
  last_status?: string | undefined;
  date_time_stamp?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Formatted address string (mirrors ReturnAddress() VB function)
 * Used to denormalize into TranSalMain.CAddress etc.
 */
export function buildReturnAddress(params: {
  address: string;
  region: string;
  city: string;
  pincode: string | null | undefined;
  state: string;
  country: string;
}): string {
  const { address, region, city, pincode, state, country } = params;
  let result = address.trim();
  if (region.trim()) result += (result ? ', ' : '') + region.trim();
  if (city.trim()) result += (result ? ', ' : '') + city.trim();
  if (pincode?.trim())
    result += city.trim() ? ` - ${pincode.trim()}` : (result ? ', ' : '') + pincode.trim();
  if (state.trim()) result += (result ? ', ' : '') + state.trim();
  if (country.trim()) result += (result ? ', ' : '') + country.trim();
  if (result) result += '.';
  return result;
}
