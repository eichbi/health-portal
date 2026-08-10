'use client';

import { useActionState, useEffect, useState } from 'react';
import { deleteLabPanel } from '@/actions/labs';
import { deleteSeca } from '@/actions/seca';
import { FormError, SubmitButton } from '@/components/form';
import { Sheet } from '@/components/Sheet';
import { formatLong } from '@/lib/date';
import type { PanelWithResults } from '@/lib/queries/labs';
import type { ActionState } from '@/lib/validation';
import type { SecaMeasurement } from '@/db/schema';
import { LabPanelForm } from './LabPanelForm';
import { SECA_FIELDS } from '@/lib/seca';
import { SecaForm } from './SecaForm';

export function LabPanelsManager({
  today,
  panels,
}: {
  today: string;
  panels: PanelWithResults[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PanelWithResults | null>(null);
  const [deleting, setDeleting] = useState<PanelWithResults | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="tap w-full rounded-md border border-dashed border-line bg-field py-3 font-semibold text-brand"
      >
        + Capturar panel de laboratorio
      </button>

      {panels.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {panels.map((panel) => (
            <li
              key={panel.id}
              className="flex items-center gap-3 rounded-md border border-line bg-field px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{formatLong(panel.date)}</p>
                <p className="text-[13px] text-ink-soft">
                  {panel.results.length} marcadores
                  {panel.notes ? ` · ${panel.notes}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(panel)}
                className="tap rounded-lg px-2 py-1 text-[14px] font-semibold text-brand"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setDeleting(panel)}
                className="tap rounded-lg px-2 py-1 text-[14px] font-semibold text-bad"
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={creating} title="Nuevo panel" onClose={() => setCreating(false)}>
        <LabPanelForm date={today} onDone={() => setCreating(false)} />
      </Sheet>

      <Sheet open={editing !== null} title="Editar panel" onClose={() => setEditing(null)}>
        {editing && (
          <LabPanelForm date={today} panel={editing} onDone={() => setEditing(null)} />
        )}
      </Sheet>

      <Sheet open={deleting !== null} title="Borrar panel" onClose={() => setDeleting(null)}>
        {deleting && (
          <DeleteForm
            id={deleting.id}
            action={deleteLabPanel}
            description={`Se borrará el panel del ${formatLong(deleting.date)} y sus ${deleting.results.length} resultados.`}
            onDone={() => setDeleting(null)}
          />
        )}
      </Sheet>
    </>
  );
}

export function SecaManager({
  today,
  measurements,
}: {
  today: string;
  measurements: SecaMeasurement[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SecaMeasurement | null>(null);
  const [deleting, setDeleting] = useState<SecaMeasurement | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="tap w-full rounded-md border border-dashed border-line bg-field py-3 font-semibold text-brand"
      >
        + Capturar medición SECA
      </button>

      {measurements.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {measurements.map((measurement) => (
            <li
              key={measurement.id}
              className="flex items-center gap-3 rounded-md border border-line bg-field px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{formatLong(measurement.date)}</p>
                <p className="truncate text-[13px] text-ink-soft">
                  {SECA_FIELDS.filter((field) => measurement[field.name] != null)
                    .map((field) => `${field.label} ${measurement[field.name]}${field.unit}`)
                    .join(' · ') || 'Sin datos'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(measurement)}
                className="tap rounded-lg px-2 py-1 text-[14px] font-semibold text-brand"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setDeleting(measurement)}
                className="tap rounded-lg px-2 py-1 text-[14px] font-semibold text-bad"
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={creating} title="Nueva medición SECA" onClose={() => setCreating(false)}>
        <SecaForm date={today} onDone={() => setCreating(false)} />
      </Sheet>

      <Sheet open={editing !== null} title="Editar medición" onClose={() => setEditing(null)}>
        {editing && (
          <SecaForm date={today} measurement={editing} onDone={() => setEditing(null)} />
        )}
      </Sheet>

      <Sheet open={deleting !== null} title="Borrar medición" onClose={() => setDeleting(null)}>
        {deleting && (
          <DeleteForm
            id={deleting.id}
            action={deleteSeca}
            description={`Se borrará la medición del ${formatLong(deleting.date)}.`}
            onDone={() => setDeleting(null)}
          />
        )}
      </Sheet>
    </>
  );
}

function DeleteForm({
  id,
  action,
  description,
  onDone,
}: {
  id: number;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  description: string;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      <p className="text-[15px] text-ink-soft">{description} No se puede deshacer.</p>
      <FormError message={state.error} />
      <SubmitButton variant="danger" pendingLabel="Borrando…">
        Borrar
      </SubmitButton>
    </form>
  );
}
