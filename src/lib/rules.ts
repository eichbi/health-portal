import type { WorkoutType } from '@/db/schema';
import { addDays, type ISODate } from './date';
import { SEQUENCE_RULES } from './defaults';

export type SequenceViolation = {
  /** Segundo día del par: es donde se pinta el aviso. */
  date: ISODate;
  previousDate: ISODate;
  pair: [WorkoutType, WorkoutType];
};

/**
 * R6: detecta pares de tipos prohibidos en días consecutivos (C↔D, A↔E).
 * `typesByDate` debe incluir el día anterior al rango que se va a pintar para
 * no perder la violación que cruza el límite de la semana.
 */
export function findSequenceViolations(
  typesByDate: Map<ISODate, WorkoutType[]>,
  dates: ISODate[],
): SequenceViolation[] {
  const violations: SequenceViolation[] = [];

  for (const date of dates) {
    const previousDate = addDays(date, -1);
    const today = typesByDate.get(date) ?? [];
    const yesterday = typesByDate.get(previousDate) ?? [];
    if (today.length === 0 || yesterday.length === 0) continue;

    for (const [first, second] of SEQUENCE_RULES) {
      const forward = yesterday.includes(first) && today.includes(second);
      const backward = yesterday.includes(second) && today.includes(first);
      if (forward || backward) {
        violations.push({ date, previousDate, pair: [first, second] });
      }
    }
  }

  return violations;
}
