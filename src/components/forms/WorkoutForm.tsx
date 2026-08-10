'use client';

import { useActionState, useEffect, useState } from 'react';
import { saveWorkout } from '@/actions/workouts';
import { Field, FormError, SubmitButton, TextArea, TextInput } from '@/components/form';
import { ROUNDS_RELEVANT_TYPES } from '@/lib/defaults';
import type { ActionState } from '@/lib/validation';
import type { Workout, WorkoutType } from '@/db/schema';

const TYPES: WorkoutType[] = ['A', 'B', 'C', 'D', 'E', 'OTHER'];

export function WorkoutForm({
  date,
  labels,
  workout,
  onDone,
}: {
  date: string;
  labels: Record<WorkoutType, string>;
  workout?: Workout;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveWorkout, {});
  const [type, setType] = useState<WorkoutType>(workout?.type ?? 'A');
  const [rpe, setRpe] = useState<number>(workout?.rpe ?? 7);

  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {workout && <input type="hidden" name="id" value={workout.id} />}
      <input type="hidden" name="type" value={type} />

      <Field label="Fecha">
        <TextInput type="date" name="date" defaultValue={workout?.date ?? date} required />
      </Field>

      <div>
        <p className="mb-1 text-[15px] font-medium text-ink-soft">Tipo</p>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((option) => {
            const selected = option === type;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                aria-pressed={selected}
                className={`tap rounded-xl border px-2 py-3 text-left ${
                  selected ? 'border-brand bg-brand-soft' : 'border-line bg-white'
                }`}
              >
                <span className="block text-lg font-bold leading-none">
                  {option === 'OTHER' ? '·' : option}
                </span>
                <span className="mt-1 block text-[12px] leading-tight text-ink-soft">
                  {labels[option]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Duración (min)">
        <TextInput
          type="number"
          name="durationMin"
          inputMode="numeric"
          min={1}
          max={600}
          defaultValue={workout?.durationMin ?? 45}
          required
        />
      </Field>

      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[15px] font-medium text-ink-soft">RPE</span>
          <span className="text-lg font-bold tabular-nums">{rpe}</span>
        </div>
        <input
          type="range"
          name="rpe"
          min={1}
          max={10}
          step={1}
          value={rpe}
          onChange={(event) => setRpe(Number(event.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-[12px] text-ink-faint">
          <span>1 · suave</span>
          <span>10 · al límite</span>
        </div>
      </div>

      {ROUNDS_RELEVANT_TYPES.includes(type) && (
        <Field label="Rondas completadas" hint="Opcional">
          <TextInput
            type="number"
            name="rounds"
            inputMode="numeric"
            min={0}
            max={100}
            defaultValue={workout?.rounds ?? ''}
          />
        </Field>
      )}

      <Field label="Notas" hint="Opcional">
        <TextArea name="notes" rows={2} defaultValue={workout?.notes ?? ''} />
      </Field>

      <FormError message={state.error} />
      <SubmitButton>{workout ? 'Guardar cambios' : 'Registrar entreno'}</SubmitButton>
    </form>
  );
}
