'use client';

import { useActionState, useEffect } from 'react';
import { createNote } from '@/actions/notes';
import { Field, FormError, SubmitButton, TextArea } from '@/components/form';
import type { ActionState } from '@/lib/validation';

export function NoteForm({ onDone }: { onDone?: () => void }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createNote, {});

  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Idea" hint="Se guarda con la fecha y hora de ahora mismo">
        <TextArea
          name="body"
          rows={4}
          maxLength={500}
          placeholder="¿Qué se te ocurrió?"
          autoFocus
          required
        />
      </Field>
      <FormError message={state.error} />
      <SubmitButton>Guardar nota</SubmitButton>
    </form>
  );
}
