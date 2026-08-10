'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { saveLabPanel } from '@/actions/labs';
import { Field, FormError, SubmitButton, TextArea, TextInput } from '@/components/form';
import { SUGGESTED_MARKERS } from '@/lib/defaults';
import { computeHomaIr, GLUCOSE, HOMA_IR, INSULIN } from '@/lib/labs';
import type { ActionState } from '@/lib/validation';
import type { PanelWithResults } from '@/lib/queries/labs';

type Row = { marker: string; unit: string; value: string; custom: boolean };

function initialRows(panel?: PanelWithResults): Row[] {
  const rows: Row[] = SUGGESTED_MARKERS.map((suggested) => ({
    marker: suggested.marker,
    unit: suggested.unit,
    value: '',
    custom: false,
  }));

  for (const result of panel?.results ?? []) {
    const existing = rows.find((row) => row.marker === result.marker);
    if (existing) {
      existing.value = String(result.value);
      if (result.unit) existing.unit = result.unit;
    } else {
      rows.push({
        marker: result.marker,
        unit: result.unit,
        value: String(result.value),
        custom: true,
      });
    }
  }
  return rows;
}

export function LabPanelForm({
  date,
  panel,
  onDone,
}: {
  date: string;
  panel?: PanelWithResults;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveLabPanel, {});
  const [rows, setRows] = useState<Row[]>(() => initialRows(panel));

  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state, onDone]);

  const update = (index: number, patch: Partial<Row>) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const numberOf = (marker: string) => {
    const raw = rows.find((row) => row.marker === marker)?.value.replace(',', '.');
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  // R7: se muestra el HOMA-IR calculado, pero el campo sigue siendo editable.
  const computedHoma = useMemo(
    () => computeHomaIr(numberOf(GLUCOSE), numberOf(INSULIN)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows],
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {panel && <input type="hidden" name="id" value={panel.id} />}

      <Field label="Fecha del panel">
        <TextInput type="date" name="date" defaultValue={panel?.date ?? date} required />
      </Field>

      <div className="flex flex-col gap-2">
        <p className="text-[15px] font-medium text-ink-soft">
          Marcadores <span className="text-ink-faint">(deja vacío lo que no tengas)</span>
        </p>
        {rows.map((row, index) => {
          const isHoma = row.marker === HOMA_IR;
          return (
            <div key={`${row.marker}-${index}`} className="grid grid-cols-[1fr_5.5rem_4.5rem] gap-2">
              {row.custom ? (
                <TextInput
                  name="marker"
                  value={row.marker}
                  placeholder="Marcador"
                  onChange={(event) => update(index, { marker: event.target.value })}
                  className="!px-2 !py-2"
                />
              ) : (
                <>
                  <input type="hidden" name="marker" value={row.marker} />
                  <span className="flex items-center text-[15px] font-medium">{row.marker}</span>
                </>
              )}
              <TextInput
                name="value"
                inputMode="decimal"
                value={row.value}
                placeholder={isHoma && computedHoma !== null ? String(computedHoma) : ''}
                onChange={(event) => update(index, { value: event.target.value })}
                className="!px-2 !py-2 text-right"
                aria-label={`Valor de ${row.marker}`}
              />
              <TextInput
                name="unit"
                value={row.unit}
                onChange={(event) => update(index, { unit: event.target.value })}
                className="!px-2 !py-2"
                aria-label={`Unidad de ${row.marker}`}
              />
            </div>
          );
        })}

        {computedHoma !== null && (
          <p className="text-[13px] text-ink-faint">
            HOMA-IR calculado: <strong>{computedHoma}</strong>. Se guarda solo si dejas el campo
            vacío.
          </p>
        )}

        <button
          type="button"
          onClick={() =>
            setRows((current) => [...current, { marker: '', unit: '', value: '', custom: true }])
          }
          className="tap self-start rounded-full border border-line px-3 py-1.5 text-[15px] font-medium text-brand"
        >
          + Agregar marcador
        </button>
      </div>

      <Field label="Notas" hint="Opcional">
        <TextArea name="notes" rows={2} defaultValue={panel?.notes ?? ''} />
      </Field>

      <FormError message={state.error} />
      <SubmitButton>{panel ? 'Guardar cambios' : 'Guardar panel'}</SubmitButton>
    </form>
  );
}
