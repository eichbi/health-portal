import { addDays, type ISODate } from './date';

/**
 * Días consecutivos donde `complete(date)` es true, contando hacia atrás
 * desde `today`. Si hoy no está completo, no rompe la racha — sólo no cuenta
 * todavía, y el conteo arranca en ayer. Pura y sin DB para poder probarla
 * directo; `queries/streak.ts` sólo arma el `complete` a partir de Postgres.
 */
export function computeStreak(
  today: ISODate,
  complete: (date: ISODate) => boolean,
  maxLookbackDays = 60,
): number {
  let cursor = complete(today) ? today : addDays(today, -1);
  let streak = 0;
  for (let i = 0; i < maxLookbackDays; i++) {
    if (!complete(cursor)) break;
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
