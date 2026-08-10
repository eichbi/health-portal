import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { connectionString } from './index';
import * as schema from './schema';
import { seed } from './seed';

/**
 * Se ejecuta antes de `next build` (y a mano con `npm run db:migrate`).
 * Sin URL de base no falla: permite construir el proyecto antes de conectar la DB.
 */
async function main() {
  const url = connectionString();
  if (!url) {
    console.warn('[migrate] POSTGRES_URL no definida; se omiten migraciones.');
    return;
  }

  const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
  try {
    const database = drizzle(client, { schema });
    await migrate(database, { migrationsFolder: 'drizzle' });
    await seed(database);
    console.log('[migrate] Migraciones y seed aplicados.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('[migrate] Falló:', error);
  process.exit(1);
});
