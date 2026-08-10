'use client';

import { useCallback, useState } from 'react';
import { Sheet } from './Sheet';
import { MetricsForm } from './forms/MetricsForm';
import { SleepForm } from './forms/SleepForm';
import { WorkoutForm } from './forms/WorkoutForm';
import type { DailyMetric, SleepLog, WorkoutType } from '@/db/schema';

type Action = 'workout' | 'sleep' | 'metrics';

const TITLES: Record<Action, string> = {
  workout: 'Registrar entreno',
  sleep: 'Registrar sueño de anoche',
  metrics: 'Peso y métricas',
};

export function QuickAdd({
  date,
  labels,
  sleep,
  metrics,
}: {
  date: string;
  labels: Record<WorkoutType, string>;
  sleep: SleepLog | null;
  metrics: DailyMetric | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const close = useCallback(() => setAction(null), []);

  const open = (next: Action) => {
    setMenuOpen(false);
    setAction(next);
  };

  return (
    <>
      <div className="no-print fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-2">
        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Cerrar acciones rápidas"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 -z-10 bg-black/50"
            />
            <div role="menu" aria-label="Registro rápido" className="flex flex-col items-end gap-2">
              {(
                [
                  ['workout', 'Entreno'],
                  ['sleep', 'Sueño'],
                  ['metrics', 'Peso'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="menuitem"
                  onClick={() => open(value)}
                  className="tap rounded-full border border-line bg-surface px-4 py-2 font-semibold shadow-lg"
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-label="Acciones rápidas"
          className="tap grid size-14 place-items-center rounded-full bg-brand text-3xl leading-none text-canvas shadow-lg"
        >
          <span className={menuOpen ? 'rotate-45 transition-transform' : 'transition-transform'}>
            +
          </span>
        </button>
      </div>

      <Sheet open={action !== null} title={action ? TITLES[action] : ''} onClose={close}>
        {action === 'workout' && <WorkoutForm date={date} labels={labels} onDone={close} />}
        {action === 'sleep' && <SleepForm date={date} sleep={sleep} onDone={close} />}
        {action === 'metrics' && <MetricsForm date={date} metrics={metrics} onDone={close} />}
      </Sheet>
    </>
  );
}
