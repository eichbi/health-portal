import { sql } from 'drizzle-orm';
import { SETTINGS_DEFAULTS, SUPPLEMENT_SEED } from '../lib/defaults';
import type { Database } from './index';
import { settings, supplementDefs } from './schema';

/**
 * Idempotente: inserta las metas por defecto que falten y la lista base de
 * suplementos sólo si la tabla está vacía, para no resucitar los que se hayan
 * borrado desde Config.
 */
export async function seed(database: Database): Promise<void> {
  const rows = Object.entries(SETTINGS_DEFAULTS).map(([key, value]) => ({ key, value }));
  await database.insert(settings).values(rows).onConflictDoNothing();

  const [{ count }] = await database
    .select({ count: sql<number>`count(*)::int` })
    .from(supplementDefs);

  if (count === 0) {
    await database.insert(supplementDefs).values(
      SUPPLEMENT_SEED.map((s, index) => ({
        name: s.name,
        timingLabel: s.timingLabel,
        sortOrder: index,
        active: true,
      })),
    );
  }
}
