'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { vitals } from '@/db/schema';
import {
  optionalNumber,
  optionalText,
  requiredDate,
  requiredId,
  run,
  ValidationError,
  type ActionState,
} from '@/lib/validation';

export async function saveVitals(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    const values = {
      date: requiredDate(formData),
      systolic: optionalNumber(formData, 'systolic', 'La sistólica', {
        integer: true,
        min: 60,
        max: 260,
      }),
      diastolic: optionalNumber(formData, 'diastolic', 'La diastólica', {
        integer: true,
        min: 30,
        max: 180,
      }),
      restingHr: optionalNumber(formData, 'restingHr', 'La FC en reposo', {
        integer: true,
        min: 25,
        max: 200,
      }),
      notes: optionalText(formData, 'notes'),
    };

    if (values.systolic === null && values.diastolic === null && values.restingHr === null) {
      throw new ValidationError('Captura al menos un valor.');
    }
    if (
      values.systolic !== null &&
      values.diastolic !== null &&
      values.diastolic >= values.systolic
    ) {
      throw new ValidationError('La diastólica no puede ser mayor o igual que la sistólica.');
    }

    // Una toma por día, como el resto de las capturas del portal.
    await db.insert(vitals).values(values).onConflictDoUpdate({ target: vitals.date, set: values });

    revalidatePath('/', 'layout');
  });
}

export async function deleteVitals(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    await db.delete(vitals).where(eq(vitals.id, requiredId(formData)));
    revalidatePath('/', 'layout');
  });
}
