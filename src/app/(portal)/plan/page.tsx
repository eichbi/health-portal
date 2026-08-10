import Link from 'next/link';
import { PlanSessionCard } from '@/components/PlanSessionCard';
import { Card, Row, ScreenHeader } from '@/components/ui';
import { WEEKDAY_LABELS, daysBetween, formatShort, todayISO, weekdayIndex } from '@/lib/date';
import { REST } from '@/lib/defaults';
import {
  EXTRACTION_WEEK,
  NUTRITION,
  PLAN_META,
  PLAN_PHASES,
  PLAN_SESSIONS,
  SUPPLEMENT_PLAN,
  TRACKING_NOTES,
  phaseFor,
  plannedFor,
} from '@/lib/plan';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const TYPES = ['A', 'B', 'C', 'D', 'E'] as const;

export default async function PlanPage() {
  const today = todayISO();
  const settings = await getSettings();
  const phase = phaseFor(today);
  const dayNumber = daysBetween(settings.planStart, today) + 1;

  return (
    <main className="flex flex-col gap-4">
      <ScreenHeader
        path="plan"
        meta={
          <>
            {dayNumber >= 1 ? `día ${dayNumber}/38` : `arranca el ${formatShort(settings.planStart)}`}
            {phase && ` · ${phase.name}`}
          </>
        }
      />

      <Card title="Semana tipo">
        <ul className="grid grid-cols-7 gap-1">
          {settings.weeklyTemplate.map((planned, index) => {
            const isToday = index === weekdayIndex(today);
            return (
              <li key={index} className="text-center">
                <p className="text-[12px] font-medium text-ink-faint">{WEEKDAY_LABELS[index]}</p>
                <div
                  className={`mt-1 grid h-11 place-items-center rounded-lg text-[15px] font-bold ${
                    planned === REST ? 'bg-idle-bg text-ink-faint' : 'bg-brand-soft text-brand'
                  } ${isToday ? 'ring-2 ring-brand' : ''}`}
                >
                  {planned === REST ? '·' : planned}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[14px] text-ink-soft">{PLAN_META.suggestedSequence}</p>
        <ul className="mt-2 flex flex-col gap-1">
          {PLAN_META.hardRules.map((rule) => (
            <li key={rule} className="text-[14px] text-ink-soft">
              · {rule}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-ink-faint">
          Puedes cambiar qué toca cada día en{' '}
          <Link href="/config" className="font-semibold text-brand">
            Config
          </Link>
          .
        </p>
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-base font-semibold">Las cinco sesiones</h2>
        {TYPES.map((type) => (
          <div key={type} id={`tipo-${type}`} className="scroll-mt-4">
            <PlanSessionCard
              session={PLAN_SESSIONS[type]}
              defaultOpen={plannedFor(today, settings.weeklyTemplate) === type}
            />
          </div>
        ))}
      </section>

      <Card title="Cómo se progresa">
        <p className="text-[15px] text-ink-soft">{PLAN_META.progression}</p>
        <p className="mt-3 rounded-md bg-warn-bg px-3 py-2 text-[14px] text-warn">
          <strong className="font-semibold">Límite de carga:</strong> {PLAN_META.loadLimit}
        </p>
      </Card>

      <Card title="Horario y sueño">
        <Row label="Ventana de entrenamiento" value={PLAN_META.trainingWindow} />
        <p className="mt-2 text-[14px] text-ink-soft">{PLAN_META.windowRationale}</p>
        <p className="mt-3 text-[14px] text-ink-soft">
          <strong className="font-semibold text-ink">Sueño:</strong> {PLAN_META.sleepTarget}
        </p>
      </Card>

      <Card title="Días de descanso">
        <p className="text-[15px] text-ink-soft">{PLAN_META.restDays}</p>
      </Card>

      <Card title="Fases">
        <ul className="flex flex-col gap-2">
          {PLAN_PHASES.map((item) => {
            const active = today >= item.from && today <= item.to;
            return (
              <li
                key={item.name}
                className={`rounded-md border px-3 py-2 ${
                  active ? 'border-brand bg-brand-soft' : 'border-line'
                }`}
              >
                <p className="font-semibold leading-tight">{item.name}</p>
                <p className="text-[13px] text-ink-soft">
                  {formatShort(item.from)} – {formatShort(item.to)} · {item.detail}
                </p>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="Semana de la extracción">
        <ul className="flex flex-col gap-2">
          {EXTRACTION_WEEK.map((item) => (
            <li key={item.date} className="border-b border-line pb-2 last:border-b-0 last:pb-0">
              <p className="font-semibold leading-tight">{item.label}</p>
              <p className="text-[14px] text-ink-soft">{item.action}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Comida y calorías">
        <p className="text-[14px] text-ink-soft">{NUTRITION.pre}</p>
        <p className="mt-2 text-[14px] text-ink-soft">{NUTRITION.post}</p>
        <div className="mt-3">
          {NUTRITION.rows.map((row) => (
            <Row key={row.concept} label={row.concept} value={row.value} />
          ))}
        </div>
        <p className="mt-3 rounded-md bg-warn-bg px-3 py-2 text-[14px] text-warn">
          {NUTRITION.caveat}
        </p>
      </Card>

      <Card title="Suplementos por impacto">
        <ol className="flex flex-col gap-2">
          {SUPPLEMENT_PLAN.map((item, index) => (
            <li key={item.name} className="flex gap-3 border-b border-line pb-2 last:border-b-0 last:pb-0">
              <span className="text-[15px] font-bold text-ink-faint tabular-nums">{index + 1}</span>
              <div className="min-w-0">
                <p className="font-semibold leading-tight">{item.name}</p>
                <p className="text-[13px] text-ink-soft">
                  {item.timing} · {item.purpose}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Tracking en el camino">
        <ul className="flex flex-col gap-1">
          {TRACKING_NOTES.map((note) => (
            <li key={note} className="text-[14px] text-ink-soft">
              · {note}
            </li>
          ))}
        </ul>
      </Card>

      <p className="px-1 text-[13px] text-ink-faint">
        Todo lo anterior sale del Plan Metabólico. El PDF original está en{' '}
        <Link href="/documentos" className="font-semibold text-brand">
          Documentos
        </Link>
        .
      </p>
    </main>
  );
}
