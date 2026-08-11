'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { WORKOUT_TYPES, workouts } from '@/db/schema';
import { violatesExtractionQuiet } from '@/lib/plan';
import { getSettings } from '@/lib/settings';
import {
  optionalNumber,
  optionalText,
  oneOf,
  requiredDate,
  requiredId,
  requiredNumber,
  run,
  ValidationError,
  type ActionState,
} from '@/lib/validation';

function refresh() {
  revalidatePath('/', 'layout');
}

export async function saveWorkout(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    const values = {
      date: requiredDate(formData),
      type: oneOf(formData, 'type', 'El tipo de entreno', WORKOUT_TYPES),
      durationMin: requiredNumber(formData, 'durationMin', 'La duración', {
        integer: true,
        min: 1,
        max: 600,
      }),
      rpe: optionalNumber(formData, 'rpe', 'El RPE', { integer: true, min: 1, max: 10 }),
      rounds: optionalNumber(formData, 'rounds', 'Las rondas', { integer: true, min: 0, max: 100 }),
      avgHr: optionalNumber(formData, 'avgHr', 'La FC media', { integer: true, min: 30, max: 230 }),
      maxHr: optionalNumber(formData, 'maxHr', 'La FC máxima', { integer: true, min: 30, max: 230 }),
      notes: optionalText(formData, 'notes'),
    };

    if (values.avgHr !== null && values.maxHr !== null && values.maxHr < values.avgHr) {
      throw new ValidationError('La FC máxima no puede ser menor que la media.');
    }

    // El plan exige 48h+ sin nada intenso antes de la toma de sangre, para no
    // ensuciar creatinina y CK. Se puede saltar, pero a propósito.
    const settings = await getSettings();
    if (
      violatesExtractionQuiet(values.date, values.type, settings.dateExtraction) &&
      formData.get('confirmExtractionWindow') !== '1'
    ) {
      throw new ValidationError(
        `El plan pide 48h sin nada intenso antes de la extracción del ${settings.dateExtraction}. ` +
          'Un entreno intenso aquí ensucia creatinina y CK.',
        'confirm_extraction_window',
      );
    }

    const id = formData.get('id');
    if (id) {
      await db.update(workouts).set(values).where(eq(workouts.id, requiredId(formData)));
    } else {
      await db.insert(workouts).values(values);
    }
    refresh();
  });
}

export async function deleteWorkout(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    await db.delete(workouts).where(eq(workouts.id, requiredId(formData)));
    refresh();
  });
}
