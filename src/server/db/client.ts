// One database handle for the whole process. With DATABASE_URL set we talk to
// real Postgres; without it we run embedded PGlite from DATA_DIR, so a fresh
// checkout (or a single Railway service with a volume) works with no setup.
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import * as schema from './schema';

export type Db = PgliteDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export const dataDir = () => path.resolve(process.env.DATA_DIR || './data');
export const mediaDir = () => path.resolve(process.env.MEDIA_DIR || path.join(dataDir(), 'media'));

const migrationsFolder = () => path.resolve('./drizzle');

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;

  if (url === 'memory://') {
    // throwaway in-process database for the test suite
    const { PGlite } = await import('@electric-sql/pglite');
    const { drizzle } = await import('drizzle-orm/pglite');
    const { migrate } = await import('drizzle-orm/pglite/migrator');
    const db = drizzle(new PGlite(), { schema });
    await migrate(db, { migrationsFolder: migrationsFolder() });
    return db;
  }

  if (url) {
    const { default: postgres } = await import('postgres');
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const { migrate } = await import('drizzle-orm/postgres-js/migrator');
    const sql = postgres(url, { max: 10, onnotice: () => {} });
    const db = drizzle(sql, { schema });
    await migrate(db, { migrationsFolder: migrationsFolder() });
    // The two drivers expose the same query builder; we only use that surface.
    return db as unknown as Db;
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const dir = path.join(dataDir(), 'pglite');
  mkdirSync(dir, { recursive: true });
  const db = drizzle(new PGlite(dir), { schema });
  await migrate(db, { migrationsFolder: migrationsFolder() });
  return db;
}

// Survive Vite's module reloads in dev: PGlite allows one open handle per folder.
const store = globalThis as typeof globalThis & { __pasPlaceDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  if (!store.__pasPlaceDb) {
    store.__pasPlaceDb = connect().catch((err) => {
      store.__pasPlaceDb = undefined;
      throw err;
    });
  }
  return store.__pasPlaceDb;
}

/** Test helper: drop the cached handle so the next getDb() starts clean. */
export function resetDbForTests() {
  store.__pasPlaceDb = undefined;
}

export { schema };
