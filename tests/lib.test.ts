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
import { DEFAULT_WEEKLY_TEMPLATE, REST } from '../src/lib/defaults';
import { computeHomaIr, markerTrend, movementGlyph } from '../src/lib/labs';
import {
  PLAN_SESSIONS,
  heartRateVerdict,
  plannedFor,
  violatesExtractionQuiet,
} from '../src/lib/plan';
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

test('la plantilla semanal por defecto respeta las reglas duras del plan', () => {
  const week = ['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16'];
  const typesByDate = new Map<string, WorkoutType[]>();

  // Dos semanas seguidas, para cazar también la violación que cruza el domingo.
  for (const offset of [0, 7]) {
    for (const date of week) {
      const shifted = addDays(date, offset);
      const planned = plannedFor(shifted, DEFAULT_WEEKLY_TEMPLATE);
      if (planned !== REST) typesByDate.set(shifted, [planned]);
    }
  }

  const dates = [...week.map((d) => addDays(d, 0)), ...week.map((d) => addDays(d, 7))];
  assert.deepEqual(findSequenceViolations(typesByDate, dates), []);

  // Y son 5 entrenos por semana, la meta del plan.
  assert.equal(DEFAULT_WEEKLY_TEMPLATE.filter((day) => day !== REST).length, 5);
});

test('plannedFor mapea por día de la semana, no por posición', () => {
  assert.equal(plannedFor('2026-08-10', DEFAULT_WEEKLY_TEMPLATE), 'A'); // lunes
  assert.equal(plannedFor('2026-08-12', DEFAULT_WEEKLY_TEMPLATE), REST); // miércoles
  assert.equal(plannedFor('2026-08-16', DEFAULT_WEEKLY_TEMPLATE), REST); // domingo
  assert.equal(plannedFor('2026-08-17', DEFAULT_WEEKLY_TEMPLATE), 'A'); // lunes siguiente
});

test('ventana de silencio: 48h sin nada intenso antes de la extracción', () => {
  const extraction = '2026-09-11';

  // Dentro de la ventana: los tipos intensos se bloquean.
  for (const type of ['A', 'C', 'D', 'E'] as WorkoutType[]) {
    assert.equal(violatesExtractionQuiet('2026-09-09', type, extraction), true, type);
    assert.equal(violatesExtractionQuiet('2026-09-10', type, extraction), true, type);
    assert.equal(violatesExtractionQuiet('2026-09-11', type, extraction), true, type);
  }

  // B es zona 2 a RPE 4-5: prácticamente caminata, no ensucia la toma.
  assert.equal(violatesExtractionQuiet('2026-09-09', 'B', extraction), false);

  // Fuera de la ventana no se estorba: el 8 el plan sí programa entreno.
  assert.equal(violatesExtractionQuiet('2026-09-08', 'C', extraction), false);
  // Y después de la toma tampoco.
  assert.equal(violatesExtractionQuiet('2026-09-12', 'C', extraction), false);
});

test('veredicto de zona 2 contra el objetivo del día B', () => {
  const target = PLAN_SESSIONS.B.hrTarget!;
  assert.deepEqual({ min: target.min, max: target.max, cap: target.cap }, {
    min: 113,
    max: 131,
    cap: 135,
  });

  assert.equal(heartRateVerdict(target, 122, 130), 'en-zona');
  assert.equal(heartRateVerdict(target, 105, 115), 'baja');
  assert.equal(heartRateVerdict(target, 134, 135), 'alta');
  // El techo manda sobre la media: pasarlo invalida la sesión como zona 2.
  assert.equal(heartRateVerdict(target, 120, 148), 'sobre-techo');
  assert.equal(heartRateVerdict(target, null, null), 'sin-dato');
  // Los tipos sin objetivo de FC no opinan.
  assert.equal(heartRateVerdict(PLAN_SESSIONS.A.hrTarget, 150, 170), 'sin-dato');
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
