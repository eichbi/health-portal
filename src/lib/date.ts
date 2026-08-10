import { TIME_ZONE } from './defaults';

/**
 * Todas las fechas del portal son fechas civiles (YYYY-MM-DD) en la zona
 * America/Monterrey. La aritmética se hace sobre UTC a mediodía, que es puro
 * calendario y por lo tanto inmune a cambios de horario de verano.
 */
export type ISODate = string;

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isISODate(value: unknown): value is ISODate {
  if (typeof value !== 'string' || !ISO_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

const isoFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Fecha de hoy en Monterrey. */
export function todayISO(now: Date = new Date()): ISODate {
  return isoFormatter.format(now);
}

/** Hora actual en Monterrey como HH:MM, para prellenar formularios. */
export function nowHHMM(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
}

function toUTC(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUTC(dt: Date): ISODate {
  return dt.toISOString().slice(0, 10);
}

export function addDays(iso: ISODate, days: number): ISODate {
  const dt = toUTC(iso);
  dt.setUTCDate(dt.getUTCDate() + days);
  return fromUTC(dt);
}

/** Días enteros de `from` a `to`. Negativo si `to` ya pasó. */
export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((toUTC(to).getTime() - toUTC(from).getTime()) / 86_400_000);
}

/** 0 = lunes … 6 = domingo. */
export function weekdayIndex(iso: ISODate): number {
  return (toUTC(iso).getUTCDay() + 6) % 7;
}

/** Lunes de la semana que contiene `iso`. */
export function startOfWeek(iso: ISODate): ISODate {
  return addDays(iso, -weekdayIndex(iso));
}

export function endOfWeek(iso: ISODate): ISODate {
  return addDays(startOfWeek(iso), 6);
}

export function weekDates(mondayISO: ISODate): ISODate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(mondayISO, i));
}

export const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/** "10 ago" */
export function formatShort(iso: ISODate): string {
  const dt = toUTC(iso);
  return `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]}`;
}

/** "10 ago 2026" */
export function formatLong(iso: ISODate): string {
  return `${formatShort(iso)} ${toUTC(iso).getUTCFullYear()}`;
}

const DAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

/** "lunes 10 de agosto" */
export function formatFull(iso: ISODate): string {
  const dt = toUTC(iso);
  const month = new Intl.DateTimeFormat('es-MX', { month: 'long', timeZone: 'UTC' }).format(dt);
  return `${DAY_NAMES[weekdayIndex(iso)]} ${dt.getUTCDate()} de ${month}`;
}

/** Minutos desde medianoche para "HH:MM". `null` si no parsea. */
export function parseHHMM(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Duración de sueño cruzando medianoche: 23:45 → 06:03 = 378 min (6h18).
 * Horas idénticas darían 24 h, que no es un registro válido: devuelve `null`.
 */
export function sleepDurationMin(bedTime: string, wakeTime: string): number | null {
  const bed = parseHHMM(bedTime);
  const wake = parseHHMM(wakeTime);
  if (bed === null || wake === null) return null;
  const diff = wake - bed;
  if (diff === 0) return null;
  return diff > 0 ? diff : diff + 24 * 60;
}

/** 378 → "6h18" */
export function formatDuration(minutes: number): string {
  const sign = minutes < 0 ? '-' : '';
  const abs = Math.abs(Math.round(minutes));
  return `${sign}${Math.floor(abs / 60)}h${String(abs % 60).padStart(2, '0')}`;
}

/** 378 → "6.3" (horas con un decimal), para gráficas. */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}
