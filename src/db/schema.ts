import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/** Tipos de entrenamiento del plan. Las etiquetas descriptivas viven en `settings`. */
export const WORKOUT_TYPES = ['A', 'B', 'C', 'D', 'E', 'OTHER'] as const;
export type WorkoutType = (typeof WORKOUT_TYPES)[number];

export const workoutTypeEnum = pgEnum('workout_type', WORKOUT_TYPES);

export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(),
  type: workoutTypeEnum('type').notNull(),
  durationMin: integer('duration_min').notNull(),
  rpe: integer('rpe'),
  rounds: integer('rounds'),
  /** FC media y máxima de la sesión: sin ellas no se puede verificar la zona 2. */
  avgHr: integer('avg_hr'),
  maxHr: integer('max_hr'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Toma del Omron: el plan la pide semanal, mismo día, misma hora y en ayunas.
 * Va aparte de daily_metrics porque su cadencia no es diaria.
 */
export const vitals = pgTable(
  'vitals',
  {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),
    systolic: integer('systolic'),
    diastolic: integer('diastolic'),
    restingHr: integer('resting_hr'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('vitals_date_key').on(t.date)],
);

/**
 * Un registro de sueño por día (el sueño "de anoche" que cierra ese día).
 * `durationMin` siempre se persiste ya calculado para no recalcular al leer.
 */
export const sleepLogs = pgTable(
  'sleep_logs',
  {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),
    bedTime: text('bed_time'),
    wakeTime: text('wake_time'),
    durationMin: integer('duration_min').notNull(),
    quality: integer('quality'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('sleep_logs_date_key').on(t.date)],
);

export const dailyMetrics = pgTable(
  'daily_metrics',
  {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),
    weightKg: numeric('weight_kg', { precision: 5, scale: 1, mode: 'number' }),
    steps: integer('steps'),
    kcal: integer('kcal'),
    proteinG: integer('protein_g'),
    waistCm: numeric('waist_cm', { precision: 5, scale: 1, mode: 'number' }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('daily_metrics_date_key').on(t.date)],
);

export const supplementDefs = pgTable('supplement_defs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  timingLabel: text('timing_label').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
});

export const supplementLogs = pgTable(
  'supplement_logs',
  {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),
    supplementDefId: integer('supplement_def_id')
      .notNull()
      .references(() => supplementDefs.id, { onDelete: 'cascade' }),
    taken: boolean('taken').notNull().default(false),
  },
  (t) => [unique('supplement_logs_date_def_key').on(t.date, t.supplementDefId)],
);

export const labPanels = pgTable('lab_panels', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const labResults = pgTable('lab_results', {
  id: serial('id').primaryKey(),
  panelId: integer('panel_id')
    .notNull()
    .references(() => labPanels.id, { onDelete: 'cascade' }),
  marker: text('marker').notNull(),
  value: numeric('value', { precision: 12, scale: 4, mode: 'number' }).notNull(),
  unit: text('unit').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const secaMeasurements = pgTable(
  'seca_measurements',
  {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),
    weightKg: numeric('weight_kg', { precision: 5, scale: 1, mode: 'number' }),
    fatPct: numeric('fat_pct', { precision: 4, scale: 1, mode: 'number' }),
    visceralFatL: numeric('visceral_fat_l', { precision: 4, scale: 1, mode: 'number' }),
    smmKg: numeric('smm_kg', { precision: 5, scale: 1, mode: 'number' }),
    waistCm: numeric('waist_cm', { precision: 5, scale: 1, mode: 'number' }),
    phaseAngle: numeric('phase_angle', { precision: 4, scale: 2, mode: 'number' }),
    notes: text('notes'),
  },
  (t) => [uniqueIndex('seca_measurements_date_key').on(t.date)],
);

/** Ideas sueltas capturadas al vuelo: sólo texto y el momento exacto en que se guardaron. */
export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const DOCUMENT_KINDS = ['PLAN', 'LAB', 'SECA', 'OTHER'] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const documentKindEnum = pgEnum('document_kind', DOCUMENT_KINDS);

/**
 * Archivos de respaldo (el plan en PDF, resultados de laboratorio escaneados…).
 * El binario vive en Vercel Blob con acceso privado; aquí sólo queda la
 * referencia. El navegador nunca ve la URL del blob: se sirve por una ruta que
 * exige sesión y que lee el archivo con el token del store.
 */
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  kind: documentKindEnum('kind').notNull().default('OTHER'),
  filename: text('filename').notNull(),
  contentType: text('content_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  blobUrl: text('blob_url').notNull(),
  blobPathname: text('blob_pathname').notNull(),
  docDate: date('doc_date'),
  notes: text('notes'),
  /** Si no es null, es una foto de evidencia de ese entreno, no un documento general. */
  workoutId: integer('workout_id').references(() => workouts.id, { onDelete: 'cascade' }),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Workout = typeof workouts.$inferSelect;
export type SleepLog = typeof sleepLogs.$inferSelect;
export type DailyMetric = typeof dailyMetrics.$inferSelect;
export type SupplementDef = typeof supplementDefs.$inferSelect;
export type SupplementLog = typeof supplementLogs.$inferSelect;
export type LabPanel = typeof labPanels.$inferSelect;
export type LabResult = typeof labResults.$inferSelect;
export type SecaMeasurement = typeof secaMeasurements.$inferSelect;
export type StoredDocument = typeof documents.$inferSelect;
export type Vitals = typeof vitals.$inferSelect;
export type Note = typeof notes.$inferSelect;
