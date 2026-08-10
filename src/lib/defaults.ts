import type { WorkoutType } from '@/db/schema';

/** Zona horaria fija del portal (Open Question §10: default sí). */
export const TIME_ZONE = 'America/Monterrey';

/**
 * Etiquetas por defecto de los tipos de entrenamiento del plan.
 * Son marcadores de posición editables desde Config: el PRD nombra los tipos
 * A-E pero no su contenido. Las reglas de secuencia (C↔D, A↔E) sí son fijas.
 */
export const DEFAULT_WORKOUT_LABELS: Record<WorkoutType, string> = {
  A: 'Circuito metabólico',
  B: 'Fuerza tren superior',
  C: 'Fuerza-resistencia',
  D: 'Fuerza tren inferior',
  E: 'Intervalos / HIIT',
  OTHER: 'Otro',
};

/** Tipos donde el campo "rondas" es relevante (R1). */
export const ROUNDS_RELEVANT_TYPES: WorkoutType[] = ['A', 'C', 'E'];

/**
 * Pares de tipos que no deben caer en días consecutivos (R6).
 * Se comparan sin orden: [C,D] cubre C→D y D→C.
 */
export const SEQUENCE_RULES: Array<[WorkoutType, WorkoutType]> = [
  ['C', 'D'],
  ['A', 'E'],
];

export const SUPPLEMENT_SEED: Array<{ name: string; timingLabel: string }> = [
  { name: 'Inositol', timingLabel: 'Antes de comer' },
  { name: 'Omega-3', timingLabel: 'Con comida grasa' },
  { name: 'Creatina 5 g', timingLabel: 'Cualquier momento' },
  { name: 'Magnesio', timingLabel: 'Antes de dormir' },
  { name: 'D3 + K2', timingLabel: 'Con comida grasa' },
  { name: 'HMB', timingLabel: 'Peri-entreno' },
  { name: 'B12', timingLabel: 'Sublingual, en ayunas' },
  { name: 'Proteína', timingLabel: 'Según objetivo del día' },
];

/** Marcadores sugeridos para captura de laboratorio (R7). */
export const SUGGESTED_MARKERS: Array<{ marker: string; unit: string }> = [
  { marker: 'Glucosa', unit: 'mg/dL' },
  { marker: 'Insulina', unit: 'µU/mL' },
  { marker: 'HOMA-IR', unit: '' },
  { marker: 'HbA1c', unit: '%' },
  { marker: 'HDL', unit: 'mg/dL' },
  { marker: 'LDL', unit: 'mg/dL' },
  { marker: 'Triglicéridos', unit: 'mg/dL' },
  { marker: 'Creatinina', unit: 'mg/dL' },
  { marker: 'Cistatina C', unit: 'mg/L' },
  { marker: 'ALT', unit: 'U/L' },
  { marker: 'AST', unit: 'U/L' },
  { marker: 'Vitamina D', unit: 'ng/mL' },
];

/**
 * Para cada marcador, si "más alto es mejor" (`up`), "más bajo es mejor" (`down`)
 * o si no hay dirección deseable (`none`). Alimenta las flechas de tendencia.
 */
export const MARKER_DIRECTION: Record<string, 'up' | 'down' | 'none'> = {
  Glucosa: 'down',
  Insulina: 'down',
  'HOMA-IR': 'down',
  HbA1c: 'down',
  HDL: 'up',
  LDL: 'down',
  Triglicéridos: 'down',
  Creatinina: 'none',
  'Cistatina C': 'down',
  ALT: 'down',
  AST: 'down',
  'Vitamina D': 'up',
};

export const SETTINGS_DEFAULTS = {
  goal_steps: '8000',
  goal_sleep_min: '375', // 6h15
  goal_protein_g: '130',
  goal_workouts_per_week: '5',
  kcal_workout_min: '1900',
  kcal_workout_max: '2100',
  kcal_rest_min: '1700',
  kcal_rest_max: '1800',
  date_extraction: '2026-09-11',
  date_appointment: '2026-09-17',
  date_challenge_end: '2026-10-17',
  plan_start: '2026-08-10',
  workout_labels: JSON.stringify(DEFAULT_WORKOUT_LABELS),
} as const;

export type SettingKey = keyof typeof SETTINGS_DEFAULTS;
