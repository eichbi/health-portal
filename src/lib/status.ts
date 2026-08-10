import type { Status } from '@/components/ui';
import { formatDuration } from './date';
import type { DaySnapshot } from './queries/day';
import type { AppSettings } from './settings';

export type Tile = {
  key: string;
  label: string;
  value: string;
  target: string;
  status: Status;
};

/** ok si llega a la meta, warn si se queda cerca, bad si se queda lejos. */
function against(value: number, goal: number, warnRatio = 0.85): Status {
  if (value >= goal) return 'ok';
  if (value >= goal * warnRatio) return 'warn';
  return 'bad';
}

function inRange(value: number, min: number, max: number, slack = 0.08): Status {
  if (value >= min && value <= max) return 'ok';
  if (value >= min * (1 - slack) && value <= max * (1 + slack)) return 'warn';
  return 'bad';
}

export function kcalRange(settings: AppSettings, trained: boolean): [number, number] {
  return trained
    ? [settings.kcalWorkoutMin, settings.kcalWorkoutMax]
    : [settings.kcalRestMin, settings.kcalRestMax];
}

export function buildDayTiles(day: DaySnapshot, settings: AppSettings): Tile[] {
  const trained = day.workouts.length > 0;
  const totalMin = day.workouts.reduce((sum, w) => sum + w.durationMin, 0);
  const [kcalMin, kcalMax] = kcalRange(settings, trained);
  const takenSupps = day.supplements.filter((s) => s.taken).length;
  const totalSupps = day.supplements.length;

  const tiles: Tile[] = [
    {
      key: 'workout',
      label: 'Entreno',
      // Un día sin entreno es descanso planeado, no un fallo: se queda neutro.
      value: trained ? `${day.workouts.map((w) => w.type).join('+')} · ${totalMin}m` : 'Descanso',
      target: `${settings.goalWorkoutsPerWeek}/sem`,
      status: trained ? 'ok' : 'idle',
    },
    {
      key: 'sleep',
      label: 'Sueño',
      value: day.sleep ? formatDuration(day.sleep.durationMin) : '—',
      target: formatDuration(settings.goalSleepMin),
      status: day.sleep ? against(day.sleep.durationMin, settings.goalSleepMin) : 'idle',
    },
    {
      key: 'steps',
      label: 'Pasos',
      value: day.metrics?.steps != null ? day.metrics.steps.toLocaleString('es-MX') : '—',
      target: settings.goalSteps.toLocaleString('es-MX'),
      status: day.metrics?.steps != null ? against(day.metrics.steps, settings.goalSteps, 0.75) : 'idle',
    },
    {
      key: 'protein',
      label: 'Proteína',
      value: day.metrics?.proteinG != null ? `${day.metrics.proteinG} g` : '—',
      target: `${settings.goalProteinG} g`,
      status:
        day.metrics?.proteinG != null ? against(day.metrics.proteinG, settings.goalProteinG, 0.8) : 'idle',
    },
    {
      key: 'kcal',
      label: 'Kcal',
      value: day.metrics?.kcal != null ? day.metrics.kcal.toLocaleString('es-MX') : '—',
      // Sin separador de miles: en 3 columnas de 390 px el rango no cabe con él.
      target: `${kcalMin}–${kcalMax}`,
      status: day.metrics?.kcal != null ? inRange(day.metrics.kcal, kcalMin, kcalMax) : 'idle',
    },
    {
      key: 'supplements',
      label: 'Suplem.',
      value: totalSupps > 0 ? `${takenSupps}/${totalSupps}` : '—',
      target: totalSupps > 0 ? `${totalSupps}/${totalSupps}` : '—',
      status:
        totalSupps === 0 || takenSupps === 0 ? 'idle' : takenSupps === totalSupps ? 'ok' : 'warn',
    },
  ];

  return tiles;
}

/** El día está "completo" cuando ningún semáforo está en ámbar, rojo o vacío. */
export function isDayComplete(tiles: Tile[]): boolean {
  return tiles.every((t) => t.status === 'ok' || (t.key === 'workout' && t.status === 'idle'));
}
