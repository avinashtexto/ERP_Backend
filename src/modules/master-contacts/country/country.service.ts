import type { Country } from './country.types.js';

import { db } from '@/config/db.config.js';
import { cont_country } from '@/shared/database/schemas/cont-country.schema.js';

export async function getCountryDropdown(): Promise<Country[]> {
  const rows = await db.select().from(cont_country).orderBy(cont_country.country);
  return rows as Country[];
}
