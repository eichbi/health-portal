'use client';

import { useActionState, useEffect } from 'react';
import { saveSeca } from '@/actions/seca';
import { Field, FormError, SubmitButton, TextArea, TextInput } from '@/components/form';
import type { ActionState } from '@/lib/validation';
import { SECA_FIELDS } from '@/lib/seca';
import type { SecaMeasurement } from '@/db/schema';

export function SecaForm({
  date,
  measurement,
  onDone,
}: {
  date: string;
  measurement?: SecaMeasurement;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveSeca, {});

  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {measurement && <input type="hidden" name="id" value={measurement.id} />}

      <Field label="Fecha de la medición">
        <TextInput type="date" name="date" defaultValue={measurement?.date ?? date} required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        {SECA_FIELDS.map((field) => (
          <Field key={field.name} label={`${field.label} (${field.unit})`}>
            <TextInput
              type="number"
              name={field.name}
              inputMode="decimal"
              step={field.step}
              defaultValue={measurement?.[field.name] ?? ''}
            />
          </Field>
        ))}
      </div>

      <Field label="Notas" hint="Opcional">
        <TextArea name="notes" rows={2} defaultValue={measurement?.notes ?? ''} />
      </Field>

      <FormError message={state.error} />
      <SubmitButton>{measurement ? 'Guardar cambios' : 'Guardar medición'}</SubmitButton>
    </form>
  );
}
