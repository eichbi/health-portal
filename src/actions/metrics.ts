'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { dailyMetrics } from '@/db/schema';
import {
  optionalNumber,
  requiredDate,
  requiredId,
  run,
  ValidationError,
  type ActionState,
} from '@/lib/validation';

export async function saveMetrics(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    const date = requiredDate(formData);
    const values = {
      date,
      weightKg: optionalNumber(formData, 'weightKg', 'El peso', { min: 20, max: 400, decimals: 1 }),
      steps: optionalNumber(formData, 'steps', 'Los pasos', { integer: true, min: 0, max: 200000 }),
      kcal: optionalNumber(formData, 'kcal', 'Las kcal', { integer: true, min: 0, max: 20000 }),
      proteinG: optionalNumber(formData, 'proteinG', 'La proteína', {
        integer: true,
        min: 0,
        max: 1000,
      }),
      waistCm: optionalNumber(formData, 'waistCm', 'La cintura', { min: 30, max: 250, decimals: 1 }),
      updatedAt: new Date(),
    };

    if (
      values.weightKg === null &&
      values.steps === null &&
      values.kcal === null &&
      values.proteinG === null &&
      values.waistCm === null
    ) {
      throw new ValidationError('Captura al menos un dato.');
    }

    // R4: un registro por día. Si ya existe, se sobrescribe — pero sólo con
    // confirmación explícita desde el formulario.
    const existing = await db
      .select({ id: dailyMetrics.id })
      .from(dailyMetrics)
      .where(eq(dailyMetrics.date, date))
      .limit(1);

    if (existing.length > 0 && formData.get('confirmOverwrite') !== '1') {
      throw new ValidationError(
        'Ya hay un registro de ese día. Confirma para sobrescribirlo.',
        'confirm_overwrite',
      );
    }

    await db
      .insert(dailyMetrics)
      .values(values)
      .onConflictDoUpdate({ target: dailyMetrics.date, set: values });

    revalidatePath('/', 'layout');
  });
}

export async function deleteMetrics(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    await db.delete(dailyMetrics).where(eq(dailyMetrics.id, requiredId(formData)));
    revalidatePath('/', 'layout');
  });
}
