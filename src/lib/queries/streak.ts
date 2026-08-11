import 'server-only';
import { and, eq, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { supplementDefs, supplementLogs } from '@/db/schema';
import { addDays, type ISODate } from '../date';
import type { AppSettings } from '../settings';
import { computeStreak } from '../streak';
import { buildDayTiles, isDayComplete } from '../status';
import {
  getMetricsBetween,
  getSleepBetween,
  getWorkoutsBetween,
  type DaySnapshot,
  type SupplementRow,
} from './day';

async function activeSupplementCount(): Promise<number> {
  const rows = await db
    .select({ id: supplementDefs.id })
    .from(supplementDefs)
    .where(eq(supplementDefs.active, true));
  return rows.length;
}

/** Cuántos suplementos activos se marcaron, por día, en el rango. */
async function takenCountsByDate(from: ISODate, to: ISODate): Promise<Map<ISODate, number>> {
  const rows = await db
    .select({ date: supplementLogs.date })
    .from(supplementLogs)
    .innerJoin(supplementDefs, eq(supplementLogs.supplementDefId, supplementDefs.id))
    .where(
      and(
        eq(supplementDefs.active, true),
        eq(supplementLogs.taken, true),
        gte(supplementLogs.date, from),
        lte(supplementLogs.date, to),
      ),
    );

  const map = new Map<ISODate, number>();
  for (const row of rows) map.set(row.date, (map.get(row.date) ?? 0) + 1);
  return map;
}

/**
 * Racha de días consecutivos "completos" (mismo criterio que el semáforo de
 * Hoy) terminando en `today`. Si hoy todavía no está completo no la rompe —
 * sólo no cuenta hasta que lo esté, y la racha se calcula sobre ayer hacia
 * atrás en ese caso. Se detiene sola en el primer día sin datos (antes del
 * arranque del plan, o un día que se dejó ir), sin necesitar la fecha de
 * inicio: un día sin captura nunca cuenta como completo.
 */
export async function getStreak(
  today: ISODate,
  settings: AppSettings,
  maxLookbackDays = 60,
): Promise<number> {
  const from = addDays(today, -maxLookbackDays);
  const [workoutsInRange, sleepInRange, metricsInRange, totalSupps, takenByDate] =
    await Promise.all([
      getWorkoutsBetween(from, today),
      getSleepBetween(from, today),
      getMetricsBetween(from, today),
      activeSupplementCount(),
      takenCountsByDate(from, today),
    ]);

  const workoutsByDate = new Map<ISODate, typeof workoutsInRange>();
  for (const workout of workoutsInRange) {
    const list = workoutsByDate.get(workout.date) ?? [];
    list.push(workout);
    workoutsByDate.set(workout.date, list);
  }
  const sleepByDate = new Map(sleepInRange.map((s) => [s.date, s]));
  const metricsByDate = new Map(metricsInRange.map((m) => [m.date, m]));

  const dayComplete = (date: ISODate): boolean => {
    const takenCount = takenByDate.get(date) ?? 0;
    // Sólo hacen falta length y cuántos vienen marcados: buildDayTiles no lee
    // nada más del suplemento para armar el semáforo del día.
    const supplements: SupplementRow[] = Array.from({ length: totalSupps }, (_, i) => ({
      id: i,
      name: '',
      timingLabel: '',
      taken: i < takenCount,
    }));
    const snapshot: DaySnapshot = {
      date,
      workouts: workoutsByDate.get(date) ?? [],
      sleep: sleepByDate.get(date) ?? null,
      metrics: metricsByDate.get(date) ?? null,
      supplements,
    };
    return isDayComplete(buildDayTiles(snapshot, settings));
  };

  return computeStreak(today, dayComplete, maxLookbackDays);
}
