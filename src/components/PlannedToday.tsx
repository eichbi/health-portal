'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Sheet } from './Sheet';
import { WorkoutForm } from './forms/WorkoutForm';
import { REST, type PlannedDay } from '@/lib/defaults';
import { PLAN_META, sessionFor } from '@/lib/plan';
import type { WorkoutType } from '@/db/schema';

/**
 * Responde "¿qué toca hoy?" sin abrir el PDF, y deja registrarlo con el tipo
 * ya resuelto: dos taps en vez de cuatro.
 */
export function PlannedToday({
  date,
  planned,
  labels,
  done,
}: {
  date: string;
  planned: PlannedDay;
  labels: Record<WorkoutType, string>;
  done: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (planned === REST) {
    return (
      <div className="card flex items-center gap-3 p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-idle-bg text-xl">
          ✳
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">Hoy toca descanso activo</p>
          <p className="text-[13px] text-ink-soft">
            8,000-10,000 pasos. La caminata post-cena cuenta doble.
          </p>
        </div>
      </div>
    );
  }

  const session = sessionFor(planned);

  return (
    <>
      <div className={`card p-4 ${done ? 'border-ok/40 bg-ok-bg' : ''}`}>
        <div className="flex items-center gap-3">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-full text-xl font-bold ${
              done ? 'bg-ok text-white' : 'bg-brand-soft text-brand'
            }`}
          >
            {done ? '✓' : planned}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-ink-soft">
              {done ? 'Hecho hoy' : 'Hoy toca'}
            </p>
            <p className="font-semibold leading-tight">{labels[planned]}</p>
            {session && (
              <p className="text-[13px] text-ink-soft">
                {session.durationMin} min · RPE {session.rpeTarget} · {PLAN_META.trainingWindow}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {!done && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="tap flex-1 rounded-xl bg-brand px-4 py-2.5 text-center font-semibold text-white"
            >
              Registrar {planned}
            </button>
          )}
          <Link
            href={`/plan#tipo-${planned}`}
            className="tap flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-center font-semibold text-ink"
          >
            Ver la rutina
          </Link>
        </div>
      </div>

      <Sheet open={open} title={`Registrar ${planned}`} onClose={close}>
        <WorkoutForm date={date} labels={labels} initialType={planned} onDone={close} />
      </Sheet>
    </>
  );
}
