'use client';

import { useActionState } from 'react';
import { saveSettings } from '@/actions/settings';
import { Field, FormError, SubmitButton, TextInput } from '@/components/form';
import { WORKOUT_TYPES } from '@/db/schema';
import type { AppSettings } from '@/lib/settings';
import type { ActionState } from '@/lib/validation';

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveSettings, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-semibold">Metas diarias</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pasos">
            <TextInput
              type="number"
              name="goalSteps"
              inputMode="numeric"
              defaultValue={settings.goalSteps}
              required
            />
          </Field>
          <Field label="Proteína (g)">
            <TextInput
              type="number"
              name="goalProteinG"
              inputMode="numeric"
              defaultValue={settings.goalProteinG}
              required
            />
          </Field>
          <Field label="Sueño (horas)">
            <TextInput
              type="number"
              name="sleepHours"
              inputMode="numeric"
              min={0}
              max={14}
              defaultValue={Math.floor(settings.goalSleepMin / 60)}
              required
            />
          </Field>
          <Field label="Sueño (minutos)">
            <TextInput
              type="number"
              name="sleepMinutes"
              inputMode="numeric"
              min={0}
              max={59}
              defaultValue={settings.goalSleepMin % 60}
              required
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-semibold">Rangos de kcal</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Entreno · mín">
            <TextInput
              type="number"
              name="kcalWorkoutMin"
              inputMode="numeric"
              defaultValue={settings.kcalWorkoutMin}
              required
            />
          </Field>
          <Field label="Entreno · máx">
            <TextInput
              type="number"
              name="kcalWorkoutMax"
              inputMode="numeric"
              defaultValue={settings.kcalWorkoutMax}
              required
            />
          </Field>
          <Field label="Descanso · mín">
            <TextInput
              type="number"
              name="kcalRestMin"
              inputMode="numeric"
              defaultValue={settings.kcalRestMin}
              required
            />
          </Field>
          <Field label="Descanso · máx">
            <TextInput
              type="number"
              name="kcalRestMax"
              inputMode="numeric"
              defaultValue={settings.kcalRestMax}
              required
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-semibold">Plan y fechas clave</legend>
        <Field label="Entrenos por semana">
          <TextInput
            type="number"
            name="goalWorkoutsPerWeek"
            inputMode="numeric"
            min={0}
            max={14}
            defaultValue={settings.goalWorkoutsPerWeek}
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Inicio del plan">
            <TextInput type="date" name="planStart" defaultValue={settings.planStart} required />
          </Field>
          <Field label="Extracción">
            <TextInput
              type="date"
              name="dateExtraction"
              defaultValue={settings.dateExtraction}
              required
            />
          </Field>
          <Field label="Cita SCyF">
            <TextInput
              type="date"
              name="dateAppointment"
              defaultValue={settings.dateAppointment}
              required
            />
          </Field>
          <Field label="Fin del reto">
            <TextInput
              type="date"
              name="dateChallengeEnd"
              defaultValue={settings.dateChallengeEnd}
              required
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-semibold">Nombres de los tipos de entreno</legend>
        {WORKOUT_TYPES.map((type) => (
          <Field key={type} label={type === 'OTHER' ? 'Otro' : `Tipo ${type}`}>
            <TextInput
              name={`label_${type}`}
              defaultValue={settings.workoutLabels[type]}
              maxLength={60}
            />
          </Field>
        ))}
      </fieldset>

      <FormError message={state.error} />
      {state.ok && (
        <p className="rounded-xl bg-ok-bg px-3 py-2 text-[15px] font-medium text-ok">
          Configuración guardada.
        </p>
      )}
      <SubmitButton>Guardar configuración</SubmitButton>
    </form>
  );
}
