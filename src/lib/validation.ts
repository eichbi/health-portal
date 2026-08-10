import { isISODate, type ISODate } from './date';

export class ValidationError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

export type ActionState = { ok?: boolean; error?: string; code?: string };

function raw(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function optionalText(formData: FormData, name: string, maxLength = 2000): string | null {
  const value = raw(formData, name);
  if (!value) return null;
  if (value.length > maxLength) {
    throw new ValidationError(`El campo ${name} es demasiado largo.`);
  }
  return value;
}

export function requiredText(formData: FormData, name: string, label: string): string {
  const value = raw(formData, name);
  if (!value) throw new ValidationError(`Falta ${label}.`);
  return value;
}

type NumberOptions = { min?: number; max?: number; integer?: boolean; decimals?: number };

function parseNumber(value: string, label: string, options: NumberOptions): number {
  const normalized = value.replace(',', '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) throw new ValidationError(`${label} debe ser un número.`);
  if (options.integer && !Number.isInteger(parsed)) {
    throw new ValidationError(`${label} debe ser un número entero.`);
  }
  if (options.min !== undefined && parsed < options.min) {
    throw new ValidationError(`${label} debe ser al menos ${options.min}.`);
  }
  if (options.max !== undefined && parsed > options.max) {
    throw new ValidationError(`${label} no puede pasar de ${options.max}.`);
  }
  if (options.decimals !== undefined) {
    const factor = 10 ** options.decimals;
    return Math.round(parsed * factor) / factor;
  }
  return parsed;
}

export function requiredNumber(
  formData: FormData,
  name: string,
  label: string,
  options: NumberOptions = {},
): number {
  const value = raw(formData, name);
  if (!value) throw new ValidationError(`Falta ${label}.`);
  return parseNumber(value, label, options);
}

export function optionalNumber(
  formData: FormData,
  name: string,
  label: string,
  options: NumberOptions = {},
): number | null {
  const value = raw(formData, name);
  if (!value) return null;
  return parseNumber(value, label, options);
}

export function requiredDate(formData: FormData, name = 'date'): ISODate {
  const value = raw(formData, name);
  if (!isISODate(value)) throw new ValidationError('La fecha no es válida.');
  return value;
}

export function optionalHHMM(formData: FormData, name: string, label: string): string | null {
  const value = raw(formData, name);
  if (!value) return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new ValidationError(`${label} debe tener formato HH:MM.`);
  }
  return value;
}

export function requiredId(formData: FormData, name = 'id'): number {
  return requiredNumber(formData, name, 'El identificador', { integer: true, min: 1 });
}

export function oneOf<T extends string>(
  formData: FormData,
  name: string,
  label: string,
  allowed: readonly T[],
): T {
  const value = raw(formData, name) as T;
  if (!allowed.includes(value)) throw new ValidationError(`${label} no es válido.`);
  return value;
}

/** Envuelve una server action para devolver errores de validación al formulario. */
export async function run(fn: () => Promise<void>): Promise<ActionState> {
  try {
    await fn();
    return { ok: true };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { ok: false, error: error.message, code: error.code };
    }
    throw error;
  }
}
