'use client';

import { useOptimistic, useTransition } from 'react';
import { markAllSupplements, toggleSupplement } from '@/actions/supplements';
import type { SupplementRow } from '@/lib/queries/day';

/**
 * R3: un tap marca/desmarca. El estado optimista evita esperar el round-trip,
 * que es justo lo que hace abandonar el checklist.
 */
export function SupplementChecklist({
  date,
  supplements,
}: {
  date: string;
  supplements: SupplementRow[];
}) {
  const [, startTransition] = useTransition();
  const [items, setItems] = useOptimistic(
    supplements,
    (current: SupplementRow[], update: { id: number | 'all'; taken: boolean }) =>
      current.map((item) =>
        update.id === 'all' || item.id === update.id ? { ...item, taken: update.taken } : item,
      ),
  );

  const taken = items.filter((item) => item.taken).length;
  const allTaken = items.length > 0 && taken === items.length;

  const toggle = (item: SupplementRow) => {
    const next = !item.taken;
    startTransition(async () => {
      setItems({ id: item.id, taken: next });
      const formData = new FormData();
      formData.set('date', date);
      formData.set('supplementDefId', String(item.id));
      formData.set('taken', next ? '1' : '0');
      await toggleSupplement(formData);
    });
  };

  const toggleAll = () => {
    const next = !allTaken;
    startTransition(async () => {
      setItems({ id: 'all', taken: next });
      const formData = new FormData();
      formData.set('date', date);
      formData.set('taken', next ? '1' : '0');
      await markAllSupplements(formData);
    });
  };

  if (items.length === 0) {
    return <p className="py-4 text-center text-[15px] text-ink-faint">No hay suplementos activos.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-2xl font-bold tabular-nums">
          {taken}
          <span className="text-base font-medium text-ink-faint">/{items.length}</span>
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="tap rounded-full border border-line px-3 py-1 text-[15px] font-medium text-ink-soft"
        >
          {allTaken ? 'Desmarcar todo' : 'Marcar todo'}
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item)}
              aria-pressed={item.taken}
              className={`tap flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left ${
                item.taken ? 'border-ok/40 bg-ok-bg' : 'border-line bg-field'
              }`}
            >
              <span
                aria-hidden
                className={`grid size-7 shrink-0 place-items-center rounded-full border-2 text-sm font-bold ${
                  item.taken ? 'border-ok bg-ok text-canvas' : 'border-line text-transparent'
                }`}
              >
                ✓
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-tight">{item.name}</span>
                {item.timingLabel && (
                  <span className="block text-[13px] text-ink-soft">{item.timingLabel}</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
