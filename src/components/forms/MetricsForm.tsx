'use client';

import { useActionState, useEffect } from 'react';
import { saveMetrics } from '@/actions/metrics';
import { Field, FormError, SubmitButton, TextInput } from '@/components/form';
import type { ActionState } from '@/lib/validation';
import type { DailyMetric } from '@/db/schema';

export function MetricsForm({
  date,
  metrics,
  onDone,
}: {
  date: string;
  metrics?: DailyMetric | null;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveMetrics, {});
  const needsConfirm = state.code === 'confirm_overwrite';

  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Fecha">
        <TextInput type="date" name="date" defaultValue={metrics?.date ?? date} required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Peso (kg)">
          <TextInput
            type="number"
            name="weightKg"
            inputMode="decimal"
            step="0.1"
            min={20}
            max={400}
            defaultValue={metrics?.weightKg ?? ''}
            autoFocus
          />
        </Field>
        <Field label="Pasos">
          <TextInput
            type="number"
            name="steps"
            inputMode="numeric"
            min={0}
            defaultValue={metrics?.steps ?? ''}
          />
        </Field>
        <Field label="Kcal">
          <TextInput
            type="number"
            name="kcal"
            inputMode="numeric"
            min={0}
            defaultValue={metrics?.kcal ?? ''}
          />
        </Field>
        <Field label="Proteína (g)">
          <TextInput
            type="number"
            name="proteinG"
            inputMode="numeric"
            min={0}
            defaultValue={metrics?.proteinG ?? ''}
          />
        </Field>
      </div>

      <Field label="Cintura (cm)" hint="Opcional">
        <TextInput
          type="number"
          name="waistCm"
          inputMode="decimal"
          step="0.1"
          defaultValue={metrics?.waistCm ?? ''}
        />
      </Field>

      <FormError message={state.error} />

      {needsConfirm && (
        <label className="flex items-start gap-3 rounded-md border border-warn/40 bg-warn-bg p-3 text-[15px]">
          <input
            type="checkbox"
            name="confirmOverwrite"
            value="1"
            required
            className="mt-1 size-5 accent-brand"
          />
          <span>Sí, sobrescribir el registro existente de ese día.</span>
        </label>
      )}

      <SubmitButton>{needsConfirm ? 'Sobrescribir' : 'Guardar'}</SubmitButton>
    </form>
  );
}
