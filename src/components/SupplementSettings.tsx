'use client';

import { useActionState, useEffect, useState } from 'react';
import { deleteSupplementDef, saveSupplementDef } from '@/actions/supplements';
import { Field, FormError, SubmitButton, TextInput } from '@/components/form';
import { Sheet } from '@/components/Sheet';
import type { SupplementDef } from '@/db/schema';
import type { ActionState } from '@/lib/validation';

export function SupplementSettings({ supplements }: { supplements: SupplementDef[] }) {
  const [editing, setEditing] = useState<SupplementDef | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <ul className="mb-3 flex flex-col gap-2">
        {supplements.map((supplement) => (
          <li
            key={supplement.id}
            className="flex items-center gap-3 rounded-md border border-line bg-field px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">
                {supplement.name}
                {!supplement.active && (
                  <span className="ml-2 text-[13px] font-normal text-ink-faint">(inactivo)</span>
                )}
              </p>
              {supplement.timingLabel && (
                <p className="truncate text-[13px] text-ink-soft">{supplement.timingLabel}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditing(supplement)}
              className="tap rounded-lg px-2 py-1 text-[14px] font-semibold text-brand"
            >
              Editar
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setCreating(true)}
        className="tap w-full rounded-md border border-dashed border-line bg-field py-3 font-semibold text-brand"
      >
        + Agregar suplemento
      </button>

      <Sheet open={creating} title="Nuevo suplemento" onClose={() => setCreating(false)}>
        <SupplementForm onDone={() => setCreating(false)} />
      </Sheet>

      <Sheet open={editing !== null} title="Editar suplemento" onClose={() => setEditing(null)}>
        {editing && <SupplementForm supplement={editing} onDone={() => setEditing(null)} />}
      </Sheet>
    </>
  );
}

function SupplementForm({
  supplement,
  onDone,
}: {
  supplement?: SupplementDef;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveSupplementDef, {});
  const [deleteState, deleteAction] = useActionState<ActionState, FormData>(
    deleteSupplementDef,
    {},
  );

  useEffect(() => {
    if (state.ok || deleteState.ok) onDone();
  }, [state, deleteState, onDone]);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        {supplement && <input type="hidden" name="id" value={supplement.id} />}
        <Field label="Nombre">
          <TextInput name="name" defaultValue={supplement?.name ?? ''} required autoFocus />
        </Field>
        <Field label="Momento del día" hint="Ej. antes de dormir, con comida grasa">
          <TextInput name="timingLabel" defaultValue={supplement?.timingLabel ?? ''} />
        </Field>
        <label className="flex items-center gap-3 text-[15px]">
          {/* El hidden garantiza que "desmarcado" también llegue al servidor. */}
          <input type="hidden" name="active" value="0" />
          <input
            type="checkbox"
            name="active"
            value="1"
            defaultChecked={supplement?.active ?? true}
            className="size-5 accent-brand"
          />
          Aparece en el checklist diario
        </label>
        <FormError message={state.error} />
        <SubmitButton>{supplement ? 'Guardar cambios' : 'Agregar'}</SubmitButton>
      </form>

      {supplement && (
        <form action={deleteAction}>
          <input type="hidden" name="id" value={supplement.id} />
          <FormError message={deleteState.error} />
          <SubmitButton variant="danger" pendingLabel="Borrando…">
            Borrar suplemento y su historial
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
