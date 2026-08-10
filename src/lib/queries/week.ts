import 'server-only';
import type { DailyMetric, SleepLog, Workout, WorkoutType } from '@/db/schema';
import { addDays, endOfWeek, weekDates, weekdayIndex, type ISODate } from '../date';
import { findSequenceViolations, type SequenceViolation } from '../rules';
import { getMetricsBetween, getSleepBetween, getWorkoutsBetween } from './day';

export type WeekDay = {
  date: ISODate;
  workouts: Workout[];
  sleep: SleepLog | null;
  metrics: DailyMetric | null;
  violation: SequenceViolation | null;
};

export type WeekSummary = {
  monday: ISODate;
  sunday: ISODate;
  days: WeekDay[];
  workoutDays: number;
  /** Sueño promedio de lunes a viernes: la variable de mayor apalancamiento. */
  weekdaySleepAvgMin: number | null;
  stepsAvg: number | null;
  weightAvg: number | null;
  proteinAvg: number | null;
};

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function getWeek(monday: ISODate): Promise<WeekSummary> {
  const sunday = endOfWeek(monday);
  // Se pide un día extra hacia atrás para detectar violaciones que cruzan semanas.
  const from = addDays(monday, -1);

  const [workouts, sleep, metrics] = await Promise.all([
    getWorkoutsBetween(from, sunday),
    getSleepBetween(monday, sunday),
    getMetricsBetween(monday, sunday),
  ]);

  const workoutsByDate = new Map<ISODate, Workout[]>();
  for (const workout of workouts) {
    const list = workoutsByDate.get(workout.date) ?? [];
    list.push(workout);
    workoutsByDate.set(workout.date, list);
  }

  const typesByDate = new Map<ISODate, WorkoutType[]>(
    [...workoutsByDate].map(([date, list]) => [date, list.map((w) => w.type)]),
  );

  const dates = weekDates(monday);
  const violations = findSequenceViolations(typesByDate, dates);
  const violationByDate = new Map(violations.map((v) => [v.date, v]));

  const sleepByDate = new Map(sleep.map((row) => [row.date, row]));
  const metricsByDate = new Map(metrics.map((row) => [row.date, row]));

  const days: WeekDay[] = dates.map((date) => ({
    date,
    workouts: workoutsByDate.get(date) ?? [],
    sleep: sleepByDate.get(date) ?? null,
    metrics: metricsByDate.get(date) ?? null,
    violation: violationByDate.get(date) ?? null,
  }));

  const weekdaySleep = days
    .filter((day) => weekdayIndex(day.date) <= 4 && day.sleep)
    .map((day) => day.sleep!.durationMin);

  return {
    monday,
    sunday,
    days,
    workoutDays: days.filter((day) => day.workouts.length > 0).length,
    weekdaySleepAvgMin: average(weekdaySleep),
    stepsAvg: average(days.map((d) => d.metrics?.steps).filter((v): v is number => v != null)),
    weightAvg: average(days.map((d) => d.metrics?.weightKg).filter((v): v is number => v != null)),
    proteinAvg: average(days.map((d) => d.metrics?.proteinG).filter((v): v is number => v != null)),
  };
}
