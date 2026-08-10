import 'server-only';
import { addDays, minutesToHours, startOfWeek, weekdayIndex, type ISODate } from '../date';
import { getMetricsBetween, getSleepBetween, getWorkoutsBetween } from './day';

export type DailyPoint = { date: ISODate; value: number | null };
export type WeeklyPoint = {
  week: ISODate;
  sleepHours: number | null;
  steps: number | null;
  workouts: number;
};

export type Trends = {
  from: ISODate;
  to: ISODate;
  /** Peso suavizado con media móvil de 7 días. `null` = sin dato, no cero. */
  weight: DailyPoint[];
  weekly: WeeklyPoint[];
};

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function getTrends(today: ISODate, weeks = 12): Promise<Trends> {
  const to = today;
  const from = addDays(startOfWeek(today), -7 * (weeks - 1));

  const [metrics, sleep, workouts] = await Promise.all([
    getMetricsBetween(from, to),
    getSleepBetween(from, to),
    getWorkoutsBetween(from, to),
  ]);

  const weightByDate = new Map<ISODate, number>();
  for (const row of metrics) {
    if (row.weightKg != null) weightByDate.set(row.date, row.weightKg);
  }

  // Media móvil de 7 días, calculada sólo en los días que sí tienen pesada:
  // así una racha sin datos queda como hueco en la línea y no como caída a cero.
  const weight: DailyPoint[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    if (!weightByDate.has(date)) {
      weight.push({ date, value: null });
      continue;
    }
    const window: number[] = [];
    for (let offset = 0; offset < 7; offset++) {
      const value = weightByDate.get(addDays(date, -offset));
      if (value != null) window.push(value);
    }
    const average = mean(window);
    weight.push({ date, value: average === null ? null : Math.round(average * 10) / 10 });
  }

  const weekBuckets = new Map<
    ISODate,
    { weekdaySleep: number[]; steps: number[]; workoutDays: Set<ISODate> }
  >();
  const bucket = (date: ISODate) => {
    const key = startOfWeek(date);
    let entry = weekBuckets.get(key);
    if (!entry) {
      entry = { weekdaySleep: [], steps: [], workoutDays: new Set() };
      weekBuckets.set(key, entry);
    }
    return entry;
  };

  for (let week = startOfWeek(from); week <= to; week = addDays(week, 7)) bucket(week);

  for (const row of sleep) {
    // "Sueño promedio entre semana" = lunes a viernes (§2, meta 3).
    if (weekdayIndex(row.date) <= 4) bucket(row.date).weekdaySleep.push(row.durationMin);
  }
  for (const row of metrics) {
    if (row.steps != null) bucket(row.date).steps.push(row.steps);
  }
  for (const row of workouts) {
    bucket(row.date).workoutDays.add(row.date);
  }

  const weekly: WeeklyPoint[] = [...weekBuckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, entry]) => {
      const sleepAvg = mean(entry.weekdaySleep);
      const stepsAvg = mean(entry.steps);
      return {
        week,
        sleepHours: sleepAvg === null ? null : minutesToHours(sleepAvg),
        steps: stepsAvg === null ? null : Math.round(stepsAvg),
        workouts: entry.workoutDays.size,
      };
    });

  return { from, to, weight, weekly };
}
