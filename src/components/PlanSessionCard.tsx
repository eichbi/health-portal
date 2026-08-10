import type { PlanSession } from '@/lib/plan';
import { Card } from './ui';

/** Detalle completo de una sesión del plan: sustituye abrir el PDF. */
export function PlanSessionCard({
  session,
  defaultOpen = false,
}: {
  session: PlanSession;
  defaultOpen?: boolean;
}) {
  return (
    <Card className="p-0">
      <details open={defaultOpen} className="group">
        <summary className="tap flex cursor-pointer list-none items-center gap-3 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-bold text-brand">
            {session.type}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold leading-tight">{session.title}</span>
            <span className="block text-[13px] text-ink-soft">
              {session.durationMin} min · RPE {session.rpeTarget}
            </span>
          </span>
          <span
            aria-hidden
            className="shrink-0 text-ink-faint transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>

        <div className="border-t border-line p-4 pt-3">
          <p className="text-[15px] text-ink-soft">{session.benefit}</p>

          <p className="mt-3 rounded-md bg-idle-bg px-3 py-2 text-[14px]">{session.format}</p>

          {session.exercises && (
            <div className="-mx-4 mt-3 overflow-x-auto px-4">
              <table className="w-full min-w-max border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-line text-left text-ink-soft">
                    <th className="py-2 pr-3 font-semibold">Ejercicio</th>
                    <th className="px-3 py-2 font-semibold">Reps</th>
                    <th className="px-3 py-2 font-semibold">Carga</th>
                    <th className="py-2 pl-3 font-semibold">Nota técnica</th>
                  </tr>
                </thead>
                <tbody>
                  {session.exercises.map((exercise) => (
                    <tr key={exercise.name} className="border-b border-line last:border-b-0">
                      <th scope="row" className="py-2 pr-3 text-left font-medium">
                        {exercise.name}
                      </th>
                      <td className="px-3 py-2 whitespace-nowrap tabular-nums">{exercise.reps}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{exercise.load}</td>
                      <td className="py-2 pl-3 text-ink-soft">{exercise.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {session.blocks && (
            <ul className="mt-3 flex flex-col gap-2">
              {session.blocks.map((block) => (
                <li key={block.label} className="rounded-md border border-line px-3 py-2">
                  <p className="text-[13px] font-semibold text-ink-soft">{block.label}</p>
                  <p className="text-[15px]">{block.detail}</p>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-[14px] text-ink-soft">
            <strong className="font-semibold text-ink">Día siguiente:</strong> {session.nextDay}
          </p>
        </div>
      </details>
    </Card>
  );
}
