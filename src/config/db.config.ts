import { AsyncLocalStorage } from 'async_hooks';

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';

export const tenantStorage = new AsyncLocalStorage<string>();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('\n❌ ERROR: DATABASE_URL is not set in the environment variables!');
  console.error('Please configure the DATABASE_URL environment variable on your hosting provider (e.g. Render Dashboard).\n');
  process.exit(1);
}

let commonDatabaseUrl = process.env.COMMON_DATABASE_URL;

if (!commonDatabaseUrl && databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    parsed.pathname = '/AAAcommon';
    commonDatabaseUrl = parsed.toString();
  } catch {
    commonDatabaseUrl = databaseUrl.replace(/\/([^/?]+)(\?|$)/, '/AAAcommon$2');
  }
}

// Supabase requires SSL (both pooler and direct connections)
const isSupabase = (url?: string) =>
  !!url && (url.includes('supabase.co') || url.includes('pooler.supabase.com'));

const getPoolConfig = (connectionString?: string) => {
  const ssl = isSupabase(connectionString) ? { rejectUnauthorized: false } : false;
  return { connectionString, ssl };
};

const defaultPool = new pg.Pool(getPoolConfig(databaseUrl));
const defaultDb = drizzle(defaultPool);

const commonPool = new pg.Pool(getPoolConfig(commonDatabaseUrl));
export const commonDb = drizzle(commonPool);

const dbCache = new Map<string, NodePgDatabase<any>>();

export function getTenantDb(dbName: string): NodePgDatabase<any> {
  let cached = dbCache.get(dbName);
  if (!cached) {
    let tenantUrl = databaseUrl;
    if (databaseUrl) {
      try {
        const parsed = new URL(databaseUrl);
        parsed.pathname = `/${dbName}`;
        tenantUrl = parsed.toString();
      } catch {
        tenantUrl = databaseUrl.replace(/\/([^/?]+)(\?|$)/, `/${dbName}$2`);
      }
    }
    const tenantPool = new pg.Pool(getPoolConfig(tenantUrl));
    cached = drizzle(tenantPool);
    dbCache.set(dbName, cached);
  }
  return cached;
}

type DbWithClient = NodePgDatabase<any> & { $client: pg.Pool };

export const db = new Proxy(defaultDb as DbWithClient, {
  get(target, prop, receiver) {
    const tenantDbName = tenantStorage.getStore();
    const activeDb = tenantDbName ? getTenantDb(tenantDbName) : defaultDb;
    const value = Reflect.get(activeDb, prop);
    if (typeof value === 'function') {
      return value.bind(activeDb);
    }
    return value;
  },
});
