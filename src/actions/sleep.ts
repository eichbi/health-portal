'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { sleepLogs } from '@/db/schema';
import { sleepDurationMin } from '@/lib/date';
import {
  optionalHHMM,
  optionalNumber,
  requiredDate,
  requiredId,
  run,
  ValidationError,
  type ActionState,
} from '@/lib/validation';

const MAX_SLEEP_MIN = 20 * 60;

export async function saveSleep(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    const date = requiredDate(formData);
    const bedTime = optionalHHMM(formData, 'bedTime', 'La hora de acostarte');
    const wakeTime = optionalHHMM(formData, 'wakeTime', 'La hora de despertar');

    // R2: horas de acostarse/despertar (cruzando medianoche) o duración directa.
    let durationMin: number | null = null;
    if (bedTime && wakeTime) {
      durationMin = sleepDurationMin(bedTime, wakeTime);
      if (durationMin === null) {
        throw new ValidationError('Las horas de acostarte y despertar no pueden ser iguales.');
      }
    } else {
      const hours = optionalNumber(formData, 'hours', 'Las horas', { integer: true, min: 0, max: 20 });
      const minutes = optionalNumber(formData, 'minutes', 'Los minutos', {
        integer: true,
        min: 0,
        max: 59,
      });
      if (hours === null && minutes === null) {
        throw new ValidationError('Captura las horas de acostarte y despertar, o la duración.');
      }
      durationMin = (hours ?? 0) * 60 + (minutes ?? 0);
    }

    if (durationMin <= 0 || durationMin > MAX_SLEEP_MIN) {
      throw new ValidationError('La duración de sueño no es realista.');
    }

    const values = {
      date,
      bedTime,
      wakeTime,
      durationMin,
      quality: optionalNumber(formData, 'quality', 'La calidad', { integer: true, min: 1, max: 5 }),
    };

    // Un registro por día: capturar dos veces corrige, no duplica.
    await db
      .insert(sleepLogs)
      .values(values)
      .onConflictDoUpdate({ target: sleepLogs.date, set: values });

    revalidatePath('/', 'layout');
  });
}

export async function deleteSleep(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    await db.delete(sleepLogs).where(eq(sleepLogs.id, requiredId(formData)));
    revalidatePath('/', 'layout');
  });
}
