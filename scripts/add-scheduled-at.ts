// scripts/add-scheduled-at.ts
// Run: npx tsx scripts/add-scheduled-at.ts
import '../src/load-env.js';
import { db } from '../src/config/db.config.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('[Migration] Adding scheduled_at column to hr_announcement...');
  await db.execute(sql`
    ALTER TABLE hr_announcement
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ
  `);
  console.log('[Migration] ✅ scheduled_at column added (or already existed).');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[Migration] ❌ Failed:', err);
  process.exit(1);
});
