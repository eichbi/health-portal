import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addDays,
  daysBetween,
  formatDuration,
  isISODate,
  parseHHMM,
  sleepDurationMin,
  startOfWeek,
  todayISO,
  weekdayIndex,
} from '../src/lib/date';
import { computeHomaIr, markerTrend, movementGlyph } from '../src/lib/labs';
import { findSequenceViolations } from '../src/lib/rules';
import type { WorkoutType } from '../src/db/schema';

test('sueño cruzando medianoche: 23:45 → 06:03 = 6h18 (R2)', () => {
  assert.equal(sleepDurationMin('23:45', '06:03'), 378);
  assert.equal(formatDuration(378), '6h18');
});

test('sueño sin cruzar medianoche y casos límite', () => {
  assert.equal(sleepDurationMin('01:00', '07:30'), 390);
  assert.equal(sleepDurationMin('22:00', '22:00'), null);
  assert.equal(sleepDurationMin('25:00', '07:00'), null);
  assert.equal(parseHHMM('7:05'), 425);
  assert.equal(parseHHMM(''), null);
});

test('aritmética de fechas civiles', () => {
  assert.equal(addDays('2026-08-31', 1), '2026-09-01');
  assert.equal(addDays('2026-01-01', -1), '2025-12-31');
  assert.equal(daysBetween('2026-08-10', '2026-09-11'), 32);
  assert.equal(daysBetween('2026-09-17', '2026-08-10'), -38);
  // El horario de verano no debe alterar el conteo de días.
  assert.equal(daysBetween('2026-10-25', '2026-11-02'), 8);
});

test('la semana empieza en lunes', () => {
  assert.equal(weekdayIndex('2026-08-10'), 0); // lunes
  assert.equal(weekdayIndex('2026-08-16'), 6); // domingo
  assert.equal(startOfWeek('2026-08-16'), '2026-08-10');
  assert.equal(startOfWeek('2026-08-10'), '2026-08-10');
});

test('validación de fechas ISO', () => {
  assert.equal(isISODate('2026-02-29'), false); // 2026 no es bisiesto
  assert.equal(isISODate('2024-02-29'), true);
  assert.equal(isISODate('2026-13-01'), false);
  assert.equal(isISODate('10/08/2026'), false);
});

test('todayISO usa la zona de Monterrey, no UTC', () => {
  // 2026-08-10T03:30Z son las 22:30 del 9 de agosto en Monterrey (UTC-5).
  assert.equal(todayISO(new Date('2026-08-10T03:30:00Z')), '2026-08-09');
  assert.equal(todayISO(new Date('2026-08-10T12:00:00Z')), '2026-08-10');
});

test('HOMA-IR = glucosa × insulina / 405 (R7)', () => {
  assert.equal(computeHomaIr(98, 14.2), 3.44);
  assert.equal(computeHomaIr(90, 5), 1.11);
  assert.equal(computeHomaIr(98, null), null);
  assert.equal(computeHomaIr(undefined, 14.2), null);
});

test('la tendencia de un marcador depende de su dirección deseable', () => {
  assert.equal(markerTrend('HDL', 52, 41), 'better'); // subir HDL es bueno
  assert.equal(markerTrend('HOMA-IR', 3.4, 2.1), 'worse'); // subir HOMA-IR es malo
  assert.equal(markerTrend('Creatinina', 1.1, 1.0), 'none'); // sin dirección
  assert.equal(markerTrend('HDL', 41, 41), 'flat');
  assert.equal(markerTrend('HDL', 41, undefined), 'none');
  assert.equal(movementGlyph(52, 41), '↑');
  assert.equal(movementGlyph(41, 52), '↓');
});

test('reglas de secuencia: C↔D y A↔E consecutivos (R6)', () => {
  const types = (entries: Array<[string, WorkoutType[]]>) => new Map(entries);

  const cThenD = findSequenceViolations(
    types([
      ['2026-08-10', ['C']],
      ['2026-08-11', ['D']],
    ]),
    ['2026-08-10', '2026-08-11'],
  );
  assert.equal(cThenD.length, 1);
  assert.deepEqual(cThenD[0].pair, ['C', 'D']);

  // También al revés (D seguido de C).
  assert.equal(
    findSequenceViolations(
      types([
        ['2026-08-10', ['D']],
        ['2026-08-11', ['C']],
      ]),
      ['2026-08-11'],
    ).length,
    1,
  );

  // A y E consecutivos.
  assert.equal(
    findSequenceViolations(
      types([
        ['2026-08-10', ['A']],
        ['2026-08-11', ['E']],
      ]),
      ['2026-08-11'],
    ).length,
    1,
  );

  // Un día de descanso en medio no es violación.
  assert.equal(
    findSequenceViolations(
      types([
        ['2026-08-10', ['C']],
        ['2026-08-12', ['D']],
      ]),
      ['2026-08-10', '2026-08-11', '2026-08-12'],
    ).length,
    0,
  );

  // Pares permitidos.
  assert.equal(
    findSequenceViolations(
      types([
        ['2026-08-10', ['A']],
        ['2026-08-11', ['B']],
      ]),
      ['2026-08-11'],
    ).length,
    0,
  );
});
