'use client';

import { useActionState, useEffect } from 'react';
import { saveVitals } from '@/actions/vitals';
import { Field, FormError, SubmitButton, TextArea, TextInput } from '@/components/form';
import type { ActionState } from '@/lib/validation';
import type { Vitals } from '@/db/schema';

export function VitalsForm({
  date,
  vitals,
  onDone,
}: {
  date: string;
  vitals?: Vitals | null;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveVitals, {});

  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Fecha">
        <TextInput type="date" name="date" defaultValue={vitals?.date ?? date} required />
      </Field>
      <p className="-mt-2 text-[13px] text-ink-faint">
        El plan la pide semanal: mismo día, misma hora, en ayunas.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Sistólica">
          <TextInput
            type="number"
            name="systolic"
            inputMode="numeric"
            min={60}
            max={260}
            defaultValue={vitals?.systolic ?? ''}
            autoFocus
          />
        </Field>
        <Field label="Diastólica">
          <TextInput
            type="number"
            name="diastolic"
            inputMode="numeric"
            min={30}
            max={180}
            defaultValue={vitals?.diastolic ?? ''}
          />
        </Field>
      </div>

      <Field label="FC en reposo (bpm)">
        <TextInput
          type="number"
          name="restingHr"
          inputMode="numeric"
          min={25}
          max={200}
          defaultValue={vitals?.restingHr ?? ''}
        />
      </Field>

      <Field label="Notas" hint="Opcional">
        <TextArea name="notes" rows={2} defaultValue={vitals?.notes ?? ''} />
      </Field>

      <FormError message={state.error} />
      <SubmitButton>Guardar toma</SubmitButton>
    </form>
  );
}
