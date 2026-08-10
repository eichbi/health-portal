import { sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db';
import { settings as settingsTable, type WorkoutType } from '@/db/schema';
import { DEFAULT_WORKOUT_LABELS, SETTINGS_DEFAULTS, type SettingKey } from './defaults';
import { isISODate, type ISODate } from './date';

export type AppSettings = {
  goalSteps: number;
  goalSleepMin: number;
  goalProteinG: number;
  goalWorkoutsPerWeek: number;
  kcalWorkoutMin: number;
  kcalWorkoutMax: number;
  kcalRestMin: number;
  kcalRestMax: number;
  dateExtraction: ISODate;
  dateAppointment: ISODate;
  dateChallengeEnd: ISODate;
  planStart: ISODate;
  workoutLabels: Record<WorkoutType, string>;
};

function num(raw: Record<string, string>, key: SettingKey): number {
  const value = Number(raw[key] ?? SETTINGS_DEFAULTS[key]);
  return Number.isFinite(value) ? value : Number(SETTINGS_DEFAULTS[key]);
}

function iso(raw: Record<string, string>, key: SettingKey): ISODate {
  const value = raw[key];
  return isISODate(value) ? value : (SETTINGS_DEFAULTS[key] as ISODate);
}

function labels(raw: Record<string, string>): Record<WorkoutType, string> {
  try {
    const parsed = JSON.parse(raw.workout_labels ?? '{}') as Partial<Record<WorkoutType, string>>;
    const merged = { ...DEFAULT_WORKOUT_LABELS };
    for (const key of Object.keys(merged) as WorkoutType[]) {
      const value = parsed[key];
      if (typeof value === 'string' && value.trim()) merged[key] = value.trim();
    }
    return merged;
  } catch {
    return { ...DEFAULT_WORKOUT_LABELS };
  }
}

/** Cacheado por request: el dashboard lo consulta desde varios componentes. */
export const getSettings = cache(async (): Promise<AppSettings> => {
  const rows = await db.select().from(settingsTable);
  const raw = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return {
    goalSteps: num(raw, 'goal_steps'),
    goalSleepMin: num(raw, 'goal_sleep_min'),
    goalProteinG: num(raw, 'goal_protein_g'),
    goalWorkoutsPerWeek: num(raw, 'goal_workouts_per_week'),
    kcalWorkoutMin: num(raw, 'kcal_workout_min'),
    kcalWorkoutMax: num(raw, 'kcal_workout_max'),
    kcalRestMin: num(raw, 'kcal_rest_min'),
    kcalRestMax: num(raw, 'kcal_rest_max'),
    dateExtraction: iso(raw, 'date_extraction'),
    dateAppointment: iso(raw, 'date_appointment'),
    dateChallengeEnd: iso(raw, 'date_challenge_end'),
    planStart: iso(raw, 'plan_start'),
    workoutLabels: labels(raw),
  };
});

export async function writeSettings(entries: Record<string, string>): Promise<void> {
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value }));
  if (rows.length === 0) return;
  await db
    .insert(settingsTable)
    .values(rows)
    // `excluded.value` es el valor que se intentó insertar: un solo statement
    // para todas las claves en lugar de un UPDATE por fila.
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: { value: sql`excluded.value` },
    });
}
