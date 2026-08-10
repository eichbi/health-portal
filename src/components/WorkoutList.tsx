'use client';

import { useActionState, useEffect, useState } from 'react';
import { deleteWorkout } from '@/actions/workouts';
import { Sheet } from './Sheet';
import { WorkoutForm } from './forms/WorkoutForm';
import { FormError, SubmitButton } from './form';
import type { ActionState } from '@/lib/validation';
import type { Workout, WorkoutType } from '@/db/schema';
import { formatShort } from '@/lib/date';

export function WorkoutList({
  workouts,
  labels,
  showDate = false,
}: {
  workouts: Workout[];
  labels: Record<WorkoutType, string>;
  showDate?: boolean;
}) {
  const [editing, setEditing] = useState<Workout | null>(null);
  const [deleting, setDeleting] = useState<Workout | null>(null);

  if (workouts.length === 0) {
    return <p className="py-4 text-center text-[15px] text-ink-faint">Sin entrenos registrados.</p>;
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {workouts.map((workout) => (
          <li
            key={workout.id}
            className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-3"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-bold text-brand">
              {workout.type === 'OTHER' ? '·' : workout.type}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">{labels[workout.type]}</p>
              <p className="text-[13px] text-ink-soft">
                {showDate && `${formatShort(workout.date)} · `}
                {workout.durationMin} min
                {workout.rpe != null && ` · RPE ${workout.rpe}`}
                {workout.rounds != null && ` · ${workout.rounds} rondas`}
              </p>
              {workout.notes && (
                <p className="mt-1 text-[13px] text-ink-faint">{workout.notes}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <button
                type="button"
                onClick={() => setEditing(workout)}
                className="tap rounded-lg px-2 py-0.5 text-[14px] font-semibold text-brand"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setDeleting(workout)}
                aria-label={`Borrar entreno ${workout.type}`}
                className="tap rounded-lg px-2 py-0.5 text-[14px] font-semibold text-bad"
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Sheet open={editing !== null} title="Editar entreno" onClose={() => setEditing(null)}>
        {editing && (
          <WorkoutForm
            date={editing.date}
            labels={labels}
            workout={editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Sheet>

      <Sheet open={deleting !== null} title="Borrar entreno" onClose={() => setDeleting(null)}>
        {deleting && <DeleteWorkout workout={deleting} onDone={() => setDeleting(null)} />}
      </Sheet>
    </>
  );
}

function DeleteWorkout({ workout, onDone }: { workout: Workout; onDone: () => void }) {
  const [state, formAction] = useActionState<ActionState, FormData>(deleteWorkout, {});

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={workout.id} />
      <p className="text-[15px] text-ink-soft">
        Se borrará el entreno {workout.type} del {formatShort(workout.date)}. No se puede deshacer.
      </p>
      <FormError message={state.error} />
      <SubmitButton variant="danger" pendingLabel="Borrando…">
        Borrar entreno
      </SubmitButton>
    </form>
  );
}
