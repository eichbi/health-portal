import type { WorkoutType } from '@/db/schema';
import { weekdayIndex, type ISODate } from './date';
import { REST, type PlannedDay } from './defaults';

/**
 * Plan Metabólico — 38 días (Alberto Martínez, 10 ago – 17 sept 2026).
 * Transcripción del PDF del plan para que el portal se baste solo y no haya
 * que abrir el documento. El PDF original vive en la sección Documentos.
 */

export type Exercise = {
  name: string;
  reps: string;
  load: string;
  note: string;
};

export type PlanSession = {
  type: WorkoutType;
  title: string;
  durationMin: number;
  /** Por qué existe este día: la razón fisiológica del plan. */
  benefit: string;
  format: string;
  rpeTarget: string;
  /** Regla del plan sobre qué puede venir al día siguiente. */
  nextDay: string;
  exercises?: Exercise[];
  /** Bloques de texto para los días de caminadora, que no son circuitos. */
  blocks?: Array<{ label: string; detail: string }>;
  /** El plan pide registrar rondas en estos días. */
  tracksRounds: boolean;
};

export const PLAN_SESSIONS: Record<Exclude<WorkoutType, 'OTHER'>, PlanSession> = {
  A: {
    type: 'A',
    title: 'Fuerza metabólica tren superior',
    durationMin: 40,
    benefit:
      'Captación de glucosa vía GLUT4 en la masa muscular rezagada (tren superior); estímulo de hipertrofia con volumen alto.',
    format: 'Circuito, 4 rondas. Descanso 60-90s entre rondas, mínimo entre ejercicios.',
    rpeTarget: '7-8 en las últimas 2 rondas',
    nextDay: 'B o D (cardio). No C ni E.',
    tracksRounds: true,
    exercises: [
      {
        name: 'Dominadas (o negativas de 5s)',
        reps: '6-10',
        load: 'Corporal',
        note: 'Si logras 10 limpias, pausa 2s arriba',
      },
      { name: 'Fondos en barra', reps: '8-12', load: 'Corporal', note: 'Bajada controlada de 3s' },
      {
        name: 'Press de hombro de pie',
        reps: '12-15',
        load: '9 kg c/u',
        note: 'Sin impulso de piernas',
      },
      {
        name: 'Remo con mancuerna unilateral',
        reps: '12-15 x lado',
        load: '9 kg',
        note: 'Pausa 1s arriba',
      },
      {
        name: 'Slam ball overhead',
        reps: '15',
        load: '7 kg',
        note: 'Explosivo — ensayo de wall ball',
      },
      {
        name: 'Rueda abdominal',
        reps: '8-12',
        load: 'Corporal',
        note: 'Rango parcial si se arquea la espalda baja',
      },
    ],
  },
  B: {
    type: 'B',
    title: 'Zona 2 en caminadora',
    durationMin: 40,
    benefit:
      'Palanca principal para HDL y oxidación de grasa; mejora densidad mitocondrial; día que recupera mientras suma.',
    format: '5 min calentamiento progresivo · 32-35 min en zona 2.',
    rpeTarget: '4-5 (hablas en frases completas)',
    nextDay: 'Cualquiera — no genera deuda de recuperación.',
    tracksRounds: false,
    blocks: [
      { label: 'Calentamiento', detail: '5 min progresivo' },
      { label: 'Bloque principal', detail: '32-35 min · inclinación 6-10% · 5.5-6.5 km/h' },
      { label: 'Frecuencia cardiaca', detail: '~113-131 bpm (65-73% de máx. estimada 180)' },
      { label: 'Si la FC pasa de 135', detail: 'Baja inclinación, no velocidad' },
    ],
  },
  C: {
    type: 'C',
    title: 'Fuerza metabólica tren inferior + core',
    durationMin: 40,
    benefit:
      'Piernas y glúteos son el mayor reservorio de glucógeno — vaciarlo y rellenarlo es la herramienta #1 contra HOMA-IR.',
    format: 'Circuito, 4 rondas.',
    rpeTarget: '7-8',
    nextDay: 'B o descanso activo. Nunca D — piernas fatigadas arruinan la calidad del intervalo.',
    tracksRounds: true,
    exercises: [
      {
        name: 'Sentadilla goblet',
        reps: '15-20',
        load: '9 kg al pecho',
        note: 'Tempo 3s en bajada',
      },
      {
        name: 'Zancada inversa',
        reps: '12 x pierna',
        load: '9 kg c/mano (18 kg)',
        note: 'Rodilla trasera casi toca el piso',
      },
      {
        name: 'Sentadilla búlgara',
        reps: '10 x pierna',
        load: '9 kg una mano',
        note: 'El más duro — RPE 8-9 es normal',
      },
      {
        name: 'Puente de glúteo a 1 pierna',
        reps: '15 x lado',
        load: 'Corporal o 9 kg',
        note: 'Pausa 2s arriba',
      },
      { name: 'Slam ball rotacional', reps: '10 x lado', load: '7 kg', note: 'Potencia de core' },
      {
        name: 'Plancha con toque de hombro',
        reps: '20 total',
        load: 'Corporal',
        note: 'Cadera estable',
      },
    ],
  },
  D: {
    type: 'D',
    title: 'Intervalos en caminadora',
    durationMin: 40,
    benefit:
      'El estímulo más potente por minuto para sensibilidad a la insulina; ventana de mejora post-sesión de 24-48h.',
    format: '8 min calentamiento (últimos 2 acelerando) · 10 rondas: 1 min fuerte / 2 min suave · 2 min enfriamiento.',
    rpeTarget: '8 en el bloque fuerte, 3 en el suave',
    nextDay: 'A o B, no C.',
    tracksRounds: false,
    blocks: [
      { label: 'Calentamiento', detail: '8 min, los últimos 2 acelerando' },
      { label: 'Fuerte (1 min × 10)', detail: 'Inclinación 10-12%, 6.5-7.5 km/h · o trote 8-9 km/h plano si las rodillas responden · RPE 8, solo palabras sueltas' },
      { label: 'Suave (2 min × 10)', detail: 'Inclinación 2%, 5 km/h · RPE 3' },
      { label: 'Enfriamiento', detail: '2 min' },
    ],
  },
  E: {
    type: 'E',
    title: 'Circuito full body «HYROX en casa»',
    durationMin: 40,
    benefit:
      'Densidad de trabajo total, gasto calórico alto, mantiene el patrón mental de competencia como motivador.',
    format: 'AMRAP de 30 min (máximas rondas posibles, ritmo sostenible) + 10 min calentamiento/enfriamiento.',
    rpeTarget: '7 sostenido',
    nextDay: 'Descanso activo o B.',
    tracksRounds: true,
    exercises: [
      { name: 'Caminadora rápida (inclinación 5%)', reps: '400 m', load: '—', note: '' },
      { name: 'Dominadas australianas o remo con mancuernas', reps: '10', load: '9 kg', note: '' },
      { name: 'Slam balls', reps: '15', load: '7 kg', note: '' },
      { name: 'Fondos', reps: '10', load: 'Corporal', note: '' },
      { name: 'Sentadillas goblet', reps: '15', load: '9 kg', note: '' },
      { name: 'Rueda abdominal', reps: '10', load: 'Corporal', note: '' },
    ],
  },
};

export const PLAN_META = {
  title: 'Plan Metabólico — 38 días',
  start: '2026-08-10' as ISODate,
  suggestedSequence: 'A → D → C → B → E, con 2 días de descanso activo intercalados.',
  hardRules: [
    'Nunca C y D en días consecutivos.',
    'Nunca A y E en días consecutivos.',
    'B puede ir junto a cualquiera.',
  ],
  progression:
    'Semana 1 a RPE 6-7 (reintroducción). Semanas 2-4 a RPE completo. Los circuitos progresan agregando 1 ronda o recortando 15s de descanso, no más peso.',
  loadLimit:
    'Mancuernas de 9 kg. La intensidad se genera con tempo lento, trabajo unilateral, descansos cortos y repeticiones altas, no con peso.',
  trainingWindow: '18:30–20:00',
  windowRationale:
    'Terminar, cenar y tener 3+ horas antes de dormir. Entrenar en la mañana con 5h de sueño es contraproducente para HOMA-IR; entrenar después de las 21:00 sabotea el sueño.',
  sleepTarget:
    'Acostarse 23:30–23:45 (recorte de ~45-60 min vs el promedio actual de 00:32). Con despertar a las 6:03 da ~6h15-6h30 reales.',
  restDays:
    'Descanso activo, no total: 8,000-10,000 pasos. La caminata post-cena de 15-20 min cuenta doble — pasos y control del pico de glucosa de la comida más grande del día. Descanso total solo con dolor articular real o enfermedad.',
} as const;

export type PlanPhase = {
  name: string;
  from: ISODate;
  to: ISODate;
  detail: string;
};

export const PLAN_PHASES: PlanPhase[] = [
  {
    name: 'Fase 1 · Empuje metabólico',
    from: '2026-08-10',
    to: '2026-09-08',
    detail: '5 entrenos/semana (~22-23 sesiones antes de la toma).',
  },
  {
    name: 'Fase 2 · Descarga pre-extracción',
    from: '2026-09-09',
    to: '2026-09-11',
    detail: 'Nada intenso 48h+ antes de la toma.',
  },
  {
    name: 'Post 17 sept · Pivote',
    from: '2026-09-18',
    to: '2026-10-17',
    detail:
      'Enfoque según resultados del panel: hipertrofia tren superior o HYROX individual.',
  },
];

/** Semana de la extracción (7-11 de septiembre): agenda cerrada del plan. */
export const EXTRACTION_WEEK: Array<{ date: ISODate; label: string; action: string }> = [
  {
    date: '2026-09-07',
    label: 'Lunes 7',
    action: 'Último entreno de fuerza intenso (A o C).',
  },
  { date: '2026-09-08', label: 'Martes 8', action: 'B — zona 2 suave.' },
  {
    date: '2026-09-09',
    label: 'Miércoles 9',
    action:
      'Solo caminata, nada intenso. 48h+ limpias para no ensuciar creatinina/CK (clave para cistatina C).',
  },
  {
    date: '2026-09-10',
    label: 'Jueves 10',
    action:
      'Extracción en ayuno. Dormir bien la noche previa: una mala noche eleva glucosa e insulina en ayunas.',
  },
  {
    date: '2026-09-11',
    label: 'Viernes 11',
    action: 'Extracción en ayuno (día alterno). Retomar entrenamiento normal el mismo día si se desea.',
  },
];

export const NUTRITION = {
  pre: 'Pre (60-90 min antes, ~17:00-17:30): carbohidrato ligero + proteína. Ej.: 1 manzana + 10 almendras, o 1 taza de fresas + ½ scoop Birdman. Evitar grasa pesada.',
  post: 'Post (dentro de 60 min): la cena funge como comida post-entreno, 30-40 g de proteína + carbohidrato. Las cenas del plan rondan 30 g de pollo — subir a 90-120 g esos días o complementar con scoop completo de Birdman Falcon.',
  rows: [
    { concept: 'REE medido (SECA)', value: '~1,800 kcal' },
    { concept: 'Gasto estimado en días de entreno', value: '2,400-2,600 kcal' },
    { concept: 'Objetivo días de entrenamiento', value: '1,900-2,100 kcal' },
    { concept: 'Objetivo días de descanso activo', value: '1,700-1,800 kcal' },
    { concept: 'Proteína diaria', value: '130-150 g (1.6-1.8 g/kg)' },
  ],
  caveat:
    'El plan SCyF de 1,400 kcal fue prescrito el 29/dic con 93.7 kg y ejercicio ligero. Con 10 kg menos y 5 entrenos/semana es déficit excesivo. Usar la estructura de los menús con proteína al doble y este techo calórico. Validar en la cita del 17 de septiembre.',
} as const;

/** Suplementos en orden de impacto sobre el panel, según el plan. */
export const SUPPLEMENT_PLAN: Array<{
  name: string;
  timing: string;
  purpose: string;
}> = [
  {
    name: 'Inositol (myo-D-chiro)',
    timing: 'Pre-prandial, comida principal',
    purpose: 'Sensibilidad a la insulina / HOMA-IR',
  },
  {
    name: 'Omega-3 1,400 mg EPA+DHA',
    timing: 'Diario, con comida grasa',
    purpose: 'HDL / triglicéridos',
  },
  {
    name: 'Creatina 5 g',
    timing: 'Diaria, hora indistinta',
    purpose: 'Sostiene músculo en déficit',
  },
  {
    name: 'Magnesio bisglicinato',
    timing: '30-60 min antes de dormir',
    purpose: 'Recuperación + apoyo al sueño',
  },
  {
    name: 'D3+K2 (dosis terapéutica)',
    timing: 'Con la comida más grasa',
    purpose: 'Confirmar dosis con Dr. Gallardo',
  },
  {
    name: 'HMB-Ca',
    timing: 'Alrededor del entreno',
    purpose: 'Anti-catabólico en déficit',
  },
  {
    name: 'B12 metilcobalamina',
    timing: 'Sublingual, mantener',
    purpose: 'Energía / sistema nervioso',
  },
  {
    name: 'Proteína Birdman Falcon',
    timing: 'Para llegar a 130-150 g',
    purpose: 'Herramienta, no suplemento per se',
  },
];

export const TRACKING_NOTES = [
  'Omron: semanal, mismo día, misma hora, en ayunas.',
  'Bevel: tendencia de sueño/recovery.',
  'Apple Watch: zonas de FC y anillos de actividad.',
  'Métrica estrella: duración media de sueño entre semana.',
];

export function sessionFor(type: WorkoutType): PlanSession | null {
  return type === 'OTHER' ? null : PLAN_SESSIONS[type];
}

/** Qué toca ese día según la plantilla semanal (índice 0 = lunes). */
export function plannedFor(date: ISODate, template: PlannedDay[]): PlannedDay {
  return template[weekdayIndex(date)] ?? REST;
}

export function phaseFor(date: ISODate): PlanPhase | null {
  return PLAN_PHASES.find((phase) => date >= phase.from && date <= phase.to) ?? null;
}
