'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { secaMeasurements } from '@/db/schema';
import {
  optionalNumber,
  optionalText,
  requiredDate,
  requiredId,
  run,
  ValidationError,
  type ActionState,
} from '@/lib/validation';

export async function saveSeca(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    const values = {
      date: requiredDate(formData),
      weightKg: optionalNumber(formData, 'weightKg', 'El peso', { min: 20, max: 400, decimals: 1 }),
      fatPct: optionalNumber(formData, 'fatPct', 'El % de grasa', { min: 0, max: 80, decimals: 1 }),
      visceralFatL: optionalNumber(formData, 'visceralFatL', 'La grasa visceral', {
        min: 0,
        max: 20,
        decimals: 1,
      }),
      smmKg: optionalNumber(formData, 'smmKg', 'La masa muscular', {
        min: 0,
        max: 100,
        decimals: 1,
      }),
      waistCm: optionalNumber(formData, 'waistCm', 'La cintura', { min: 30, max: 250, decimals: 1 }),
      phaseAngle: optionalNumber(formData, 'phaseAngle', 'El ángulo de fase', {
        min: 0,
        max: 15,
        decimals: 2,
      }),
      notes: optionalText(formData, 'notes'),
    };

    const hasValue = [
      values.weightKg,
      values.fatPct,
      values.visceralFatL,
      values.smmKg,
      values.waistCm,
      values.phaseAngle,
    ].some((value) => value !== null);

    if (!hasValue) throw new ValidationError('Captura al menos una medición.');

    const id = formData.get('id');
    if (id) {
      await db.update(secaMeasurements).set(values).where(eq(secaMeasurements.id, requiredId(formData)));
    } else {
      await db
        .insert(secaMeasurements)
        .values(values)
        .onConflictDoUpdate({ target: secaMeasurements.date, set: values });
    }

    revalidatePath('/', 'layout');
  });
}

export async function deleteSeca(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    await db.delete(secaMeasurements).where(eq(secaMeasurements.id, requiredId(formData)));
    revalidatePath('/', 'layout');
  });
}
