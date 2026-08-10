import type { WorkoutType } from '@/db/schema';

/** Zona horaria fija del portal (Open Question §10: default sí). */
export const TIME_ZONE = 'America/Monterrey';

/** Etiquetas de los tipos de entrenamiento, tomadas del Plan Metabólico. */
export const DEFAULT_WORKOUT_LABELS: Record<WorkoutType, string> = {
  A: 'Fuerza metabólica tren superior',
  B: 'Zona 2 en caminadora',
  C: 'Fuerza metabólica tren inferior + core',
  D: 'Intervalos en caminadora',
  E: 'Circuito full body «HYROX en casa»',
  OTHER: 'Otro',
};

/** Etiqueta corta para donde no cabe el nombre completo (celda del calendario). */
export const SHORT_WORKOUT_LABELS: Record<WorkoutType, string> = {
  A: 'Superior',
  B: 'Zona 2',
  C: 'Inferior + core',
  D: 'Intervalos',
  E: 'Full body',
  OTHER: 'Otro',
};

/** Día de descanso activo dentro de la plantilla semanal. */
export const REST = 'REST' as const;
export type PlannedDay = WorkoutType | typeof REST;

/**
 * Plantilla semanal por defecto (índice 0 = lunes), editable en Config.
 * El plan sugiere la secuencia A → D → C → B → E con 2 días de descanso activo
 * "donde acomode": los descansos van en miércoles y domingo porque es la única
 * colocación que respeta las reglas duras — D→C consecutivos estarían prohibidos,
 * y el descanso del domingo evita que E caiga junto a la A del lunes siguiente.
 */
export const DEFAULT_WEEKLY_TEMPLATE: PlannedDay[] = ['A', 'D', REST, 'C', 'B', 'E', REST];

/**
 * Tipos donde el campo "rondas" es relevante: A y C son circuitos de 4 rondas,
 * y en E el plan pide registrar las rondas del AMRAP como métrica de progreso.
 */
export const ROUNDS_RELEVANT_TYPES: WorkoutType[] = ['A', 'C', 'E'];

/**
 * Pares de tipos que no deben caer en días consecutivos (R6).
 * Se comparan sin orden: [C,D] cubre C→D y D→C.
 */
export const SEQUENCE_RULES: Array<[WorkoutType, WorkoutType]> = [
  ['C', 'D'],
  ['A', 'E'],
];

/** Los 8 suplementos del plan, en su orden de impacto sobre el panel. */
export const SUPPLEMENT_SEED: Array<{ name: string; timingLabel: string }> = [
  { name: 'Inositol (myo-D-chiro)', timingLabel: 'Pre-prandial, comida principal' },
  { name: 'Omega-3 1,400 mg EPA+DHA', timingLabel: 'Diario, con comida grasa' },
  { name: 'Creatina 5 g', timingLabel: 'Diaria, hora indistinta' },
  { name: 'Magnesio bisglicinato', timingLabel: '30-60 min antes de dormir' },
  { name: 'D3+K2', timingLabel: 'Con la comida más grasa' },
  { name: 'HMB-Ca', timingLabel: 'Alrededor del entreno' },
  { name: 'B12 metilcobalamina', timingLabel: 'Sublingual' },
  { name: 'Proteína Birdman Falcon', timingLabel: 'Para llegar a 130-150 g' },
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
  weekly_template: JSON.stringify(DEFAULT_WEEKLY_TEMPLATE),
} as const;

export type SettingKey = keyof typeof SETTINGS_DEFAULTS;
