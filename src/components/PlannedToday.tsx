'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import { WorkoutForm } from './forms/WorkoutForm';
import { REST, type PlannedDay } from '@/lib/defaults';
import { formatElapsed } from '@/lib/date';
import {
  clearLiveSession,
  elapsedMinutes,
  readLiveSession,
  writeLiveSession,
  type LiveWorkoutSession,
} from '@/lib/liveWorkout';
import { PLAN_META, sessionFor } from '@/lib/plan';
import type { WorkoutType } from '@/db/schema';

type Prefill = { durationMin: number; rounds?: number } | null;

/**
 * Responde "¿qué toca hoy?" sin abrir el PDF, y deja registrarlo con el tipo
 * ya resuelto: dos taps en vez de cuatro. También ofrece cronometrar el
 * entreno en vivo — el reloj se mide por diferencia de timestamps, no con un
 * contador en memoria, así que sobrevive a que el teléfono se bloquee.
 */
export function PlannedToday({
  date,
  planned,
  labels,
  done,
  extractionDate,
  isToday = true,
}: {
  date: string;
  planned: PlannedDay;
  labels: Record<WorkoutType, string>;
  done: boolean;
  extractionDate: string;
  /** El cronómetro en vivo sólo tiene sentido para el día de hoy. */
  isToday?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<Prefill>(null);
  const [session, setSession] = useState<LiveWorkoutSession | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const close = useCallback(() => setOpen(false), []);

  // Se lee después de montar: localStorage no existe en el render del server.
  useEffect(() => {
    setSession(readLiveSession());
  }, []);

  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session]);

  const startSession = (type: WorkoutType) => {
    const next: LiveWorkoutSession = { type, startedAt: Date.now(), rounds: 0 };
    writeLiveSession(next);
    setSession(next);
    setNowMs(Date.now());
  };

  const bumpRounds = (delta: number) => {
    if (!session) return;
    const next = { ...session, rounds: Math.max(0, session.rounds + delta) };
    writeLiveSession(next);
    setSession(next);
  };

  const finishSession = () => {
    if (!session) return;
    setPrefill({
      durationMin: elapsedMinutes(session, nowMs),
      rounds: session.type === 'E' ? session.rounds : undefined,
    });
    clearLiveSession();
    setSession(null);
    setOpen(true);
  };

  const cancelSession = () => {
    clearLiveSession();
    setSession(null);
  };

  const openDirect = () => {
    setPrefill(null);
    setOpen(true);
  };

  const showSession = isToday && session !== null;
  const effectiveType = showSession ? session!.type : planned !== REST ? planned : undefined;
  const planSession = planned !== REST ? sessionFor(planned) : null;

  return (
    <>
      {showSession ? (
        <div className="card border-brand bg-brand-soft p-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-ink-soft">
              Entreno en curso · {labels[session.type]}
            </p>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-canvas">
              {session.type === 'OTHER' ? '·' : session.type}
            </span>
          </div>

          <p className="mt-2 text-center text-4xl font-bold tabular-nums text-brand">
            {formatElapsed(Math.floor((nowMs - session.startedAt) / 1000))}
          </p>

          {session.type === 'E' && (
            <div className="mt-3 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => bumpRounds(-1)}
                aria-label="Restar ronda"
                className="tap grid size-11 place-items-center rounded-full border border-line bg-field text-2xl font-bold text-ink-soft"
              >
                −
              </button>
              <div className="w-16 text-center">
                <p className="text-3xl font-bold tabular-nums">{session.rounds}</p>
                <p className="term-label">rondas</p>
              </div>
              <button
                type="button"
                onClick={() => bumpRounds(1)}
                aria-label="Sumar ronda"
                className="tap grid size-11 place-items-center rounded-full bg-brand text-2xl font-bold text-canvas"
              >
                +
              </button>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={finishSession}
              className="tap flex-1 rounded-md bg-brand px-4 py-2.5 text-center font-bold text-canvas"
            >
              Terminar
            </button>
            <button
              type="button"
              onClick={cancelSession}
              className="tap flex-1 rounded-md border border-line bg-field px-4 py-2.5 text-center font-semibold text-ink-soft"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : planned === REST ? (
        <div className="card flex items-center gap-3 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-idle-bg text-xl">
            ✳
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight">
              {isToday ? 'Hoy toca descanso activo' : 'Ese día tocaba descanso activo'}
            </p>
            <p className="text-[13px] text-ink-soft">
              8,000-10,000 pasos. La caminata post-cena cuenta doble.
            </p>
          </div>
        </div>
      ) : (
        <div className={`card p-4 ${done ? 'border-ok/40 bg-ok-bg' : ''}`}>
          <div className="flex items-center gap-3">
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-full text-xl font-bold ${
                done ? 'bg-ok text-canvas' : 'bg-brand-soft text-brand'
              }`}
            >
              {done ? '✓' : planned}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-ink-soft">
                {done ? (isToday ? 'Hecho hoy' : 'Hecho') : isToday ? 'Hoy toca' : 'Tocaba'}
              </p>
              <p className="font-semibold leading-tight">{labels[planned]}</p>
              {planSession && (
                <p className="text-[13px] text-ink-soft">
                  {planSession.durationMin} min · RPE {planSession.rpeTarget} ·{' '}
                  {PLAN_META.trainingWindow}
                </p>
              )}
            </div>
          </div>

          {!done && isToday && (
            <button
              type="button"
              onClick={() => startSession(planned)}
              className="tap mt-3 w-full rounded-md bg-brand px-4 py-2.5 text-center font-bold text-canvas"
            >
              ▶ Iniciar entreno
            </button>
          )}

          <div className="mt-2 flex gap-2">
            {!done && (
              <button
                type="button"
                onClick={openDirect}
                className="tap flex-1 rounded-md border border-line bg-field px-4 py-2.5 text-center font-semibold text-ink"
              >
                Registrar directo
              </button>
            )}
            <Link
              href={`/plan#tipo-${planned}`}
              className="tap flex-1 rounded-md border border-line bg-field px-4 py-2.5 text-center font-semibold text-ink"
            >
              Ver la rutina
            </Link>
          </div>
        </div>
      )}

      {effectiveType && (
        <Sheet open={open} title={`Registrar ${effectiveType}`} onClose={close}>
          <WorkoutForm
            date={date}
            labels={labels}
            initialType={effectiveType}
            extractionDate={extractionDate}
            prefillDurationMin={prefill?.durationMin}
            prefillRounds={prefill?.rounds}
            onDone={close}
          />
        </Sheet>
      )}
    </>
  );
}
