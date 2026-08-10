import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Database = PostgresJsDatabase<typeof schema>;

export function connectionString(): string | undefined {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? undefined;
}

/**
 * El cliente se cachea a nivel de módulo, y además en globalThis porque el HMR
 * de Next re-evalúa el módulo en dev. Sin este caché cada acceso abriría un pool
 * nuevo y la base se quedaría sin conexiones ("too many clients").
 */
const globalForDb = globalThis as unknown as {
  __fittrackClient?: postgres.Sql;
  __fittrackDb?: Database;
};

let cachedDb: Database | undefined;

export function createClient(url: string): postgres.Sql {
  return postgres(url, {
    // Serverless: una conexión por invocación, sin prepared statements
    // (los poolers en modo transaction no los soportan).
    max: 1,
    prepare: false,
  });
}

function init(): Database {
  const existing = cachedDb ?? globalForDb.__fittrackDb;
  if (existing) return (cachedDb = existing);

  const url = connectionString();
  if (!url) {
    throw new Error(
      'Falta la variable de entorno POSTGRES_URL (o DATABASE_URL). ' +
        'Conecta una base Postgres en Vercel o define la URL en .env.local.',
    );
  }

  const client = globalForDb.__fittrackClient ?? createClient(url);
  cachedDb = drizzle(client, { schema });
  globalForDb.__fittrackClient = client;
  globalForDb.__fittrackDb = cachedDb;
  return cachedDb;
}

/**
 * Se inicializa en el primer acceso y no al importar, para que `next build`
 * no reviente en entornos donde la DB todavía no está conectada.
 */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const database = init();
    const value = Reflect.get(database, prop);
    // Se enlaza al objeto real para que `this` nunca sea el Proxy.
    return typeof value === 'function' ? value.bind(database) : value;
  },
});
