'use client';

import { useActionState, useEffect, useState } from 'react';
import { saveWorkout } from '@/actions/workouts';
import { Field, FormError, SubmitButton, TextArea, TextInput } from '@/components/form';
import { ROUNDS_RELEVANT_TYPES } from '@/lib/defaults';
import { heartRateVerdict, sessionFor, violatesExtractionQuiet } from '@/lib/plan';
import type { ActionState } from '@/lib/validation';
import type { Workout, WorkoutType } from '@/db/schema';

const TYPES: WorkoutType[] = ['A', 'B', 'C', 'D', 'E', 'OTHER'];

const HR_FEEDBACK: Record<string, { text: string; className: string }> = {
  'en-zona': { text: '✓ En zona', className: 'text-ok' },
  baja: { text: '· Por debajo de la zona', className: 'text-ink-soft' },
  alta: { text: '! Por encima de la zona', className: 'text-warn' },
  'sobre-techo': { text: '✗ Pasaste el techo', className: 'text-bad' },
};

export function WorkoutForm({
  date,
  labels,
  workout,
  initialType,
  extractionDate,
  onDone,
}: {
  date: string;
  labels: Record<WorkoutType, string>;
  workout?: Workout;
  /** Tipo que toca hoy según el plan, para abrir el formulario ya resuelto. */
  initialType?: WorkoutType;
  /** Para avisar antes de guardar algo intenso cerca de la toma de sangre. */
  extractionDate?: string;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveWorkout, {});
  const [type, setType] = useState<WorkoutType>(workout?.type ?? initialType ?? 'A');
  const [rpe, setRpe] = useState<number>(workout?.rpe ?? 7);
  const [when, setWhen] = useState<string>(workout?.date ?? date);
  const [avgHr, setAvgHr] = useState<string>(workout?.avgHr?.toString() ?? '');
  const [maxHr, setMaxHr] = useState<string>(workout?.maxHr?.toString() ?? '');

  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state, onDone]);

  const session = sessionFor(type);
  const hrTarget = session?.hrTarget;
  const verdict = heartRateVerdict(
    hrTarget,
    avgHr ? Number(avgHr) : null,
    maxHr ? Number(maxHr) : null,
  );
  const feedback = HR_FEEDBACK[verdict];

  const nearExtraction =
    extractionDate !== undefined && violatesExtractionQuiet(when, type, extractionDate);
  const needsExtractionConfirm = state.code === 'confirm_extraction_window';

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {workout && <input type="hidden" name="id" value={workout.id} />}
      <input type="hidden" name="type" value={type} />

      <Field label="Fecha">
        <TextInput
          type="date"
          name="date"
          value={when}
          onChange={(event) => setWhen(event.target.value)}
          required
        />
      </Field>

      {nearExtraction && (
        <p className="rounded-md border border-warn/40 bg-warn-bg px-3 py-2 text-[14px] text-warn">
          <strong className="font-semibold">Ventana de extracción.</strong> El plan pide 48h sin
          nada intenso antes de la toma. Un entreno {type} aquí ensucia creatinina y CK.
        </p>
      )}

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
                className={`tap rounded-md border px-2 py-3 text-left ${
                  selected ? 'border-brand bg-brand-soft' : 'border-line bg-field'
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
          /* Todas las sesiones del plan son de 40 min. */
          defaultValue={workout?.durationMin ?? 40}
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
        {session && (
          <p className="mt-1 text-[13px] text-ink-faint">
            El plan pide RPE {session.rpeTarget} en {type}.
          </p>
        )}
      </div>

      <div>
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="text-[14px] font-medium text-ink-soft">
            <span aria-hidden className="text-ink-faint">
              —{' '}
            </span>
            Frecuencia cardiaca
          </span>
          {feedback && (
            <span className={`text-[13px] font-semibold ${feedback.className}`}>
              {feedback.text}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            type="number"
            name="avgHr"
            inputMode="numeric"
            min={30}
            max={230}
            placeholder="media"
            aria-label="FC media"
            value={avgHr}
            onChange={(event) => setAvgHr(event.target.value)}
          />
          <TextInput
            type="number"
            name="maxHr"
            inputMode="numeric"
            min={30}
            max={230}
            placeholder="máxima"
            aria-label="FC máxima"
            value={maxHr}
            onChange={(event) => setMaxHr(event.target.value)}
          />
        </div>
        {hrTarget ? (
          <p className="mt-1 text-[13px] text-ink-faint">
            Zona 2: {hrTarget.min}-{hrTarget.max} bpm. {hrTarget.note}
          </p>
        ) : (
          <p className="mt-1 text-[13px] text-ink-faint">Opcional, del Apple Watch.</p>
        )}
      </div>

      {ROUNDS_RELEVANT_TYPES.includes(type) && (
        <Field
          label="Rondas completadas"
          hint={
            type === 'E'
              ? 'AMRAP de 30 min — es la métrica de progreso semana a semana'
              : 'El plan marca 4 rondas'
          }
        >
          <TextInput
            type="number"
            name="rounds"
            inputMode="numeric"
            min={0}
            max={100}
            placeholder={type === 'E' ? '' : '4'}
            defaultValue={workout?.rounds ?? ''}
          />
        </Field>
      )}

      <Field label="Notas" hint="Opcional">
        <TextArea name="notes" rows={2} defaultValue={workout?.notes ?? ''} />
      </Field>

      <FormError message={state.error} />

      {needsExtractionConfirm && (
        <label className="flex items-start gap-3 rounded-md border border-warn/40 bg-warn-bg p-3 text-[14px]">
          <input
            type="checkbox"
            name="confirmExtractionWindow"
            value="1"
            required
            className="mt-1 size-5 accent-brand"
          />
          <span>Sí, registrarlo de todas formas. Asumo el efecto sobre el panel.</span>
        </label>
      )}

      <SubmitButton>
        {needsExtractionConfirm
          ? 'Registrar de todas formas'
          : workout
            ? 'Guardar cambios'
            : 'Registrar entreno'}
      </SubmitButton>
    </form>
  );
}
