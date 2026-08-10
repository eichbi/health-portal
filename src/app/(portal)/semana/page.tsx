import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, Empty, Row } from '@/components/ui';
import { WorkoutList } from '@/components/WorkoutList';
import {
  WEEKDAY_LABELS,
  addDays,
  formatDuration,
  formatShort,
  isISODate,
  startOfWeek,
  todayISO,
} from '@/lib/date';
import { getWeek } from '@/lib/queries/week';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function WeekPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const { semana } = await searchParams;
  if (semana !== undefined && !isISODate(semana)) notFound();

  const today = todayISO();
  const monday = startOfWeek(semana ?? today);
  const [settings, week] = await Promise.all([getSettings(), getWeek(monday)]);
  const goal = settings.goalWorkoutsPerWeek;

  const allWorkouts = week.days.flatMap((day) => day.workouts);
  const violations = week.days.filter((day) => day.violation);

  return (
    <main className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <NavLink href={`/semana?semana=${addDays(monday, -7)}`} label="‹" title="Semana anterior" />
        <div className="text-center">
          <h1 className="text-lg font-bold leading-tight">
            {formatShort(monday)} – {formatShort(week.sunday)}
          </h1>
          <p className="text-[13px] text-ink-soft">
            {week.workoutDays}/{goal} entrenos
          </p>
        </div>
        <NavLink href={`/semana?semana=${addDays(monday, 7)}`} label="›" title="Semana siguiente" />
      </header>

      <Card>
        <ul className="grid grid-cols-7 gap-1">
          {week.days.map((day, index) => {
            const isToday = day.date === today;
            const types = day.workouts.map((w) => (w.type === 'OTHER' ? '·' : w.type));
            return (
              <li key={day.date} className="text-center">
                <p className="text-[12px] font-medium text-ink-faint">{WEEKDAY_LABELS[index]}</p>
                <div
                  className={`mt-1 rounded-xl border p-1 ${
                    isToday ? 'border-brand' : 'border-transparent'
                  }`}
                >
                  <div
                    className={`grid h-11 place-items-center rounded-lg text-[15px] font-bold leading-none ${
                      types.length > 0
                        ? day.violation
                          ? 'bg-warn-bg text-warn'
                          : 'bg-brand-soft text-brand'
                        : 'bg-idle-bg text-ink-faint'
                    }`}
                  >
                    {types.length > 0 ? (
                      <span className="flex flex-col items-center leading-tight">
                        {types.map((type, index) => (
                          <span key={index}>{type}</span>
                        ))}
                      </span>
                    ) : (
                      '–'
                    )}
                  </div>
                  <p className="mt-1 text-[11px] tabular-nums text-ink-faint">
                    {Number(day.date.slice(8))}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        {violations.length > 0 && (
          <div className="mt-3 rounded-xl bg-warn-bg p-3 text-[14px] text-warn">
            <p className="font-semibold">Regla de secuencia rota</p>
            <ul className="mt-1 list-disc pl-4">
              {violations.map((day) => (
                <li key={day.date}>
                  {day.violation!.pair[0]} y {day.violation!.pair[1]} en días consecutivos (
                  {formatShort(day.violation!.previousDate)} → {formatShort(day.date)}).
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card title="Promedios de la semana">
        <Row
          label="Sueño entre semana (L-V)"
          value={week.weekdaySleepAvgMin === null ? '—' : formatDuration(week.weekdaySleepAvgMin)}
        />
        <Row
          label="Pasos"
          value={week.stepsAvg === null ? '—' : Math.round(week.stepsAvg).toLocaleString('es-MX')}
        />
        <Row label="Peso" value={week.weightAvg === null ? '—' : `${week.weightAvg.toFixed(1)} kg`} />
        <Row
          label="Proteína"
          value={week.proteinAvg === null ? '—' : `${Math.round(week.proteinAvg)} g`}
        />
      </Card>

      <Card title="Entrenos de la semana">
        {allWorkouts.length === 0 ? (
          <Empty>Nada registrado en esta semana.</Empty>
        ) : (
          <WorkoutList workouts={allWorkouts} labels={settings.workoutLabels} showDate />
        )}
      </Card>
    </main>
  );
}

function NavLink({ href, label, title }: { href: string; label: string; title: string }) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      className="tap grid size-11 shrink-0 place-items-center rounded-full border border-line bg-white text-xl font-bold text-ink-soft"
    >
      {label}
    </Link>
  );
}
