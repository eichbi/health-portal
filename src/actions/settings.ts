'use server';

import { revalidatePath } from 'next/cache';
import { WORKOUT_TYPES, type WorkoutType } from '@/db/schema';
import { DEFAULT_WEEKLY_TEMPLATE, REST, type PlannedDay } from '@/lib/defaults';
import { DEFAULT_WORKOUT_LABELS } from '@/lib/defaults';
import { writeSettings } from '@/lib/settings';
import {
  requiredDate,
  requiredNumber,
  run,
  ValidationError,
  type ActionState,
} from '@/lib/validation';

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    const sleepHours = requiredNumber(formData, 'sleepHours', 'Las horas de sueño meta', {
      integer: true,
      min: 0,
      max: 14,
    });
    const sleepMinutes = requiredNumber(formData, 'sleepMinutes', 'Los minutos de sueño meta', {
      integer: true,
      min: 0,
      max: 59,
    });

    const kcalWorkoutMin = requiredNumber(formData, 'kcalWorkoutMin', 'Las kcal mínimas de entreno', {
      integer: true,
      min: 500,
      max: 10000,
    });
    const kcalWorkoutMax = requiredNumber(formData, 'kcalWorkoutMax', 'Las kcal máximas de entreno', {
      integer: true,
      min: 500,
      max: 10000,
    });
    const kcalRestMin = requiredNumber(formData, 'kcalRestMin', 'Las kcal mínimas de descanso', {
      integer: true,
      min: 500,
      max: 10000,
    });
    const kcalRestMax = requiredNumber(formData, 'kcalRestMax', 'Las kcal máximas de descanso', {
      integer: true,
      min: 500,
      max: 10000,
    });

    if (kcalWorkoutMin > kcalWorkoutMax || kcalRestMin > kcalRestMax) {
      throw new ValidationError('El mínimo de kcal no puede ser mayor que el máximo.');
    }

    const labels: Record<WorkoutType, string> = { ...DEFAULT_WORKOUT_LABELS };
    for (const type of WORKOUT_TYPES) {
      const value = String(formData.get(`label_${type}`) ?? '').trim();
      if (value) labels[type] = value.slice(0, 60);
    }

    const allowed = new Set<string>([...WORKOUT_TYPES, REST]);
    const template: PlannedDay[] = [];
    for (let index = 0; index < 7; index++) {
      const value = String(formData.get(`template_${index}`) ?? '');
      if (!allowed.has(value)) {
        throw new ValidationError('La plantilla semanal tiene un día no válido.');
      }
      template.push(value as PlannedDay);
    }

    await writeSettings({
      goal_steps: String(
        requiredNumber(formData, 'goalSteps', 'La meta de pasos', {
          integer: true,
          min: 0,
          max: 100000,
        }),
      ),
      goal_sleep_min: String(sleepHours * 60 + sleepMinutes),
      goal_protein_g: String(
        requiredNumber(formData, 'goalProteinG', 'La meta de proteína', {
          integer: true,
          min: 0,
          max: 1000,
        }),
      ),
      goal_workouts_per_week: String(
        requiredNumber(formData, 'goalWorkoutsPerWeek', 'La meta de entrenos', {
          integer: true,
          min: 0,
          max: 14,
        }),
      ),
      kcal_workout_min: String(kcalWorkoutMin),
      kcal_workout_max: String(kcalWorkoutMax),
      kcal_rest_min: String(kcalRestMin),
      kcal_rest_max: String(kcalRestMax),
      date_extraction: requiredDate(formData, 'dateExtraction'),
      date_appointment: requiredDate(formData, 'dateAppointment'),
      date_challenge_end: requiredDate(formData, 'dateChallengeEnd'),
      plan_start: requiredDate(formData, 'planStart'),
      workout_labels: JSON.stringify(labels),
      weekly_template: JSON.stringify(template.length === 7 ? template : DEFAULT_WEEKLY_TEMPLATE),
    });

    revalidatePath('/', 'layout');
  });
}
