import { MARKER_DIRECTION } from './defaults';

export const GLUCOSE = 'Glucosa';
export const INSULIN = 'Insulina';
export const HOMA_IR = 'HOMA-IR';

/**
 * HOMA-IR = glucosa(mg/dL) × insulina(µU/mL) / 405.
 * Devuelve `null` si falta cualquiera de los dos.
 */
export function computeHomaIr(
  glucoseMgDl: number | null | undefined,
  insulinUIml: number | null | undefined,
): number | null {
  if (glucoseMgDl == null || insulinUIml == null) return null;
  if (!Number.isFinite(glucoseMgDl) || !Number.isFinite(insulinUIml)) return null;
  return Math.round(((glucoseMgDl * insulinUIml) / 405) * 100) / 100;
}

/** `none` = no hay con qué comparar o el marcador no tiene dirección deseable. */
export type Trend = 'better' | 'worse' | 'flat' | 'none';

/** Compara el valor más reciente contra el anterior según el marcador. */
export function markerTrend(
  marker: string,
  latest: number | undefined,
  previous: number | undefined,
): Trend {
  if (latest == null || previous == null) return 'none';
  if (latest === previous) return 'flat';

  const direction = MARKER_DIRECTION[marker] ?? 'none';
  if (direction === 'none') return 'none';
  const rising = latest > previous;
  return (direction === 'up') === rising ? 'better' : 'worse';
}

/** La flecha apunta al movimiento real del número; el color dice si es bueno. */
export function movementGlyph(
  latest: number | undefined,
  previous: number | undefined,
): string {
  if (latest == null || previous == null) return '';
  if (latest === previous) return '→';
  return latest > previous ? '↑' : '↓';
}
