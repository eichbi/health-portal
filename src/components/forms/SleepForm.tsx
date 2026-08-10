'use client';

import { useActionState, useEffect, useState } from 'react';
import { saveSleep } from '@/actions/sleep';
import { Field, FormError, SubmitButton, TextInput } from '@/components/form';
import { formatDuration, sleepDurationMin } from '@/lib/date';
import type { ActionState } from '@/lib/validation';
import type { SleepLog } from '@/db/schema';

type Mode = 'times' | 'duration';

export function SleepForm({
  date,
  sleep,
  onDone,
}: {
  date: string;
  sleep?: SleepLog | null;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveSleep, {});
  const [mode, setMode] = useState<Mode>(sleep && !sleep.bedTime ? 'duration' : 'times');
  const [bedTime, setBedTime] = useState(sleep?.bedTime ?? '23:00');
  const [wakeTime, setWakeTime] = useState(sleep?.wakeTime ?? '06:00');
  const [quality, setQuality] = useState<number>(sleep?.quality ?? 0);

  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state, onDone]);

  const preview = sleepDurationMin(bedTime, wakeTime);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Fecha">
        <TextInput type="date" name="date" defaultValue={sleep?.date ?? date} required />
      </Field>
      <p className="-mt-2 text-[13px] text-ink-faint">
        Es el sueño de anoche: la fecha es el día en que despertaste.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ['times', 'Horas de dormir'],
            ['duration', 'Duración directa'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={mode === value}
            className={`tap rounded-md border px-3 py-2 text-[15px] font-medium ${
              mode === value ? 'border-brand bg-brand-soft' : 'border-line bg-field'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'times' ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Me acosté">
              <TextInput
                type="time"
                name="bedTime"
                value={bedTime}
                onChange={(event) => setBedTime(event.target.value)}
                required
              />
            </Field>
            <Field label="Desperté">
              <TextInput
                type="time"
                name="wakeTime"
                value={wakeTime}
                onChange={(event) => setWakeTime(event.target.value)}
                required
              />
            </Field>
          </div>
          <p className="text-center text-[15px] text-ink-soft">
            Duración:{' '}
            <strong className="text-lg text-ink tabular-nums">
              {preview === null ? '—' : formatDuration(preview)}
            </strong>
          </p>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Horas">
            <TextInput
              type="number"
              name="hours"
              inputMode="numeric"
              min={0}
              max={20}
              defaultValue={sleep ? Math.floor(sleep.durationMin / 60) : 6}
            />
          </Field>
          <Field label="Minutos">
            <TextInput
              type="number"
              name="minutes"
              inputMode="numeric"
              min={0}
              max={59}
              defaultValue={sleep ? sleep.durationMin % 60 : 15}
            />
          </Field>
        </div>
      )}

      <div>
        <p className="mb-1 text-[15px] font-medium text-ink-soft">Calidad (opcional)</p>
        <input type="hidden" name="quality" value={quality || ''} />
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setQuality(quality === value ? 0 : value)}
              aria-pressed={quality === value}
              className={`tap rounded-md border py-3 text-lg font-bold ${
                quality === value ? 'border-brand bg-brand-soft' : 'border-line bg-field'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <FormError message={state.error} />
      <SubmitButton>Guardar sueño</SubmitButton>
    </form>
  );
}
