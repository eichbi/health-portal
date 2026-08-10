import 'server-only';
import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import {
  dailyMetrics,
  sleepLogs,
  supplementDefs,
  supplementLogs,
  workouts,
  type DailyMetric,
  type SleepLog,
  type Workout,
} from '@/db/schema';
import type { ISODate } from '../date';

export type SupplementRow = {
  id: number;
  name: string;
  timingLabel: string;
  taken: boolean;
};

export type DaySnapshot = {
  date: ISODate;
  workouts: Workout[];
  sleep: SleepLog | null;
  metrics: DailyMetric | null;
  supplements: SupplementRow[];
};

export async function getDay(date: ISODate): Promise<DaySnapshot> {
  const [dayWorkouts, sleep, metrics, supplements] = await Promise.all([
    db.select().from(workouts).where(eq(workouts.date, date)).orderBy(asc(workouts.id)),
    db.select().from(sleepLogs).where(eq(sleepLogs.date, date)).limit(1),
    db.select().from(dailyMetrics).where(eq(dailyMetrics.date, date)).limit(1),
    getSupplementsForDay(date),
  ]);

  return {
    date,
    workouts: dayWorkouts,
    sleep: sleep[0] ?? null,
    metrics: metrics[0] ?? null,
    supplements,
  };
}

export async function getSupplementsForDay(date: ISODate): Promise<SupplementRow[]> {
  const rows = await db
    .select({
      id: supplementDefs.id,
      name: supplementDefs.name,
      timingLabel: supplementDefs.timingLabel,
      sortOrder: supplementDefs.sortOrder,
      taken: supplementLogs.taken,
    })
    .from(supplementDefs)
    .leftJoin(
      supplementLogs,
      and(eq(supplementLogs.supplementDefId, supplementDefs.id), eq(supplementLogs.date, date)),
    )
    .where(eq(supplementDefs.active, true))
    .orderBy(asc(supplementDefs.sortOrder), asc(supplementDefs.id));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    timingLabel: r.timingLabel,
    taken: r.taken ?? false,
  }));
}

export async function getWorkoutsBetween(from: ISODate, to: ISODate): Promise<Workout[]> {
  return db
    .select()
    .from(workouts)
    .where(and(gte(workouts.date, from), lte(workouts.date, to)))
    .orderBy(asc(workouts.date), asc(workouts.id));
}

export async function getSleepBetween(from: ISODate, to: ISODate): Promise<SleepLog[]> {
  return db
    .select()
    .from(sleepLogs)
    .where(and(gte(sleepLogs.date, from), lte(sleepLogs.date, to)))
    .orderBy(asc(sleepLogs.date));
}

export async function getMetricsBetween(from: ISODate, to: ISODate): Promise<DailyMetric[]> {
  return db
    .select()
    .from(dailyMetrics)
    .where(and(gte(dailyMetrics.date, from), lte(dailyMetrics.date, to)))
    .orderBy(asc(dailyMetrics.date));
}

/** Días distintos con al menos un entreno en el rango (para % de cumplimiento). */
export async function countWorkoutDays(from: ISODate, to: ISODate): Promise<number> {
  const rows = await getWorkoutsBetween(from, to);
  return new Set(rows.map((r) => r.date)).size;
}
