'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { WORKOUT_TYPES, workouts } from '@/db/schema';
import {
  optionalNumber,
  optionalText,
  oneOf,
  requiredDate,
  requiredId,
  requiredNumber,
  run,
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
      notes: optionalText(formData, 'notes'),
    };

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
