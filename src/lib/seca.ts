import type { SecaMeasurement } from '@/db/schema';

/**
 * Campos de la medición SECA, en el orden en que se capturan y se comparan.
 * Vive fuera de los componentes porque lo usan tanto el formulario (cliente)
 * como la tabla comparativa (servidor).
 */
export const SECA_FIELDS = [
  { name: 'weightKg', label: 'Peso', unit: 'kg', step: '0.1' },
  { name: 'fatPct', label: '% grasa', unit: '%', step: '0.1' },
  { name: 'visceralFatL', label: 'Grasa visceral', unit: 'L', step: '0.1' },
  { name: 'smmKg', label: 'Masa músculo esquelético', unit: 'kg', step: '0.1' },
  { name: 'waistCm', label: 'Cintura', unit: 'cm', step: '0.1' },
  { name: 'phaseAngle', label: 'Ángulo de fase', unit: '°', step: '0.01' },
] as const satisfies ReadonlyArray<{
  name: keyof SecaMeasurement;
  label: string;
  unit: string;
  step: string;
}>;
