import 'server-only';
import { and, asc, desc, eq, gte, isNotNull, lte } from 'drizzle-orm';
import { db } from '@/db';
import { vitals, workouts, type Vitals, type WorkoutType } from '@/db/schema';
import type { ISODate } from '../date';

export async function getVitalsForDate(date: ISODate): Promise<Vitals | null> {
  const rows = await db.select().from(vitals).where(eq(vitals.date, date)).limit(1);
  return rows[0] ?? null;
}

export async function getLatestVitals(): Promise<Vitals | null> {
  const rows = await db.select().from(vitals).orderBy(desc(vitals.date)).limit(1);
  return rows[0] ?? null;
}

export async function getVitalsBetween(from: ISODate, to: ISODate): Promise<Vitals[]> {
  return db
    .select()
    .from(vitals)
    .where(and(gte(vitals.date, from), lte(vitals.date, to)))
    .orderBy(asc(vitals.date));
}

export type RoundsPoint = { date: ISODate; type: WorkoutType; rounds: number };

/**
 * Rondas completadas por sesión. El plan las llama la métrica de progreso
 * semana a semana, así que se leen como serie por tipo, no agregadas.
 */
export async function getRoundsSeries(from: ISODate, to: ISODate): Promise<RoundsPoint[]> {
  const rows = await db
    .select({ date: workouts.date, type: workouts.type, rounds: workouts.rounds })
    .from(workouts)
    .where(and(gte(workouts.date, from), lte(workouts.date, to), isNotNull(workouts.rounds)))
    .orderBy(asc(workouts.date), asc(workouts.id));

  return rows
    .filter((row): row is RoundsPoint => row.rounds !== null)
    .map((row) => ({ date: row.date, type: row.type, rounds: row.rounds }));
}
