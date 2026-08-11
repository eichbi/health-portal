import type { WorkoutType } from '@/db/schema';

/**
 * Sesión de entreno en vivo: cronómetro + contador de rondas. Vive en
 * localStorage, no en la base de datos — es efímera, sólo existe mientras
 * entrenas, y sobrevive a que el teléfono se bloquee porque se mide por
 * diferencia de timestamps, no por un contador en memoria.
 */
export type LiveWorkoutSession = {
  type: WorkoutType;
  startedAt: number;
  rounds: number;
};

const KEY = 'fittrack.liveWorkout.v1';

function isSession(value: unknown): value is LiveWorkoutSession {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as LiveWorkoutSession).type === 'string' &&
    typeof (value as LiveWorkoutSession).startedAt === 'number' &&
    typeof (value as LiveWorkoutSession).rounds === 'number'
  );
}

export function readLiveSession(): LiveWorkoutSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeLiveSession(session: LiveWorkoutSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearLiveSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}

/** Minutos transcurridos, mínimo 1 para no guardar un entreno de 0 minutos. */
export function elapsedMinutes(session: LiveWorkoutSession, nowMs: number): number {
  return Math.max(1, Math.round((nowMs - session.startedAt) / 60000));
}
