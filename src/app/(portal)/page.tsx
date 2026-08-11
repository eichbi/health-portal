import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Countdowns } from '@/components/Countdowns';
import { DayTiles } from '@/components/DayTiles';
import { PlannedToday } from '@/components/PlannedToday';
import { QuickAdd } from '@/components/QuickAdd';
import { StreakBadge } from '@/components/StreakBadge';
import { SupplementChecklist } from '@/components/SupplementChecklist';
import { VitalsCard } from '@/components/VitalsCard';
import { WorkoutList } from '@/components/WorkoutList';
import { BlockMeter, Card, ScreenHeader } from '@/components/ui';
import {
  addDays,
  endOfWeek,
  formatFull,
  formatShort,
  isISODate,
  startOfWeek,
  todayISO,
} from '@/lib/date';
import { countWorkoutDays, getDay } from '@/lib/queries/day';
import { getStreak } from '@/lib/queries/streak';
import { getLatestVitals, getVitalsForDate } from '@/lib/queries/vitals';
import { plannedFor } from '@/lib/plan';
import { getSettings } from '@/lib/settings';
import { buildDayTiles } from '@/lib/status';

export const dynamic = 'force-dynamic';

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>;
}) {
  const { dia } = await searchParams;
  if (dia !== undefined && !isISODate(dia)) notFound();

  const today = todayISO();
  if (dia !== undefined && dia > today) redirect('/');
  const viewDate = dia ?? today;
  const isToday = viewDate === today;

  const settings = await getSettings();
  const [day, vitals, latestVitals, streak] = await Promise.all([
    getDay(viewDate),
    getVitalsForDate(viewDate),
    getLatestVitals(),
    getStreak(today, settings),
  ]);
  const weekFrom = startOfWeek(viewDate);
  const trainedThisWeek = await countWorkoutDays(weekFrom, endOfWeek(viewDate));

  const tiles = buildDayTiles(day, settings);
  const goal = settings.goalWorkoutsPerWeek;
  const planned = plannedFor(viewDate, settings.weeklyTemplate);
  const plannedDone = day.workouts.some((workout) => workout.type === planned);
  const pct = goal > 0 ? Math.min(100, Math.round((trainedThisWeek / goal) * 100)) : 0;

  return (
    <main className="flex flex-col gap-4">
      <ScreenHeader
        path="hoy"
        meta={formatFull(viewDate)}
        right={<StreakBadge days={streak} />}
      />

      <div className="flex items-center gap-2">
        <NavLink href={`/?dia=${addDays(viewDate, -1)}`} label="‹" title="Día anterior" />
        {!isToday && (
          <>
            <Link
              href="/"
              className="tap flex-1 rounded-md border border-line bg-field px-3 py-2.5 text-center text-[13px] font-semibold text-ink-soft"
            >
              Volver a hoy
            </Link>
            <NavLink href={`/?dia=${addDays(viewDate, 1)}`} label="›" title="Día siguiente" />
          </>
        )}
      </div>

      <PlannedToday
        date={viewDate}
        planned={planned}
        labels={settings.workoutLabels}
        done={plannedDone}
        extractionDate={settings.dateExtraction}
        isToday={isToday}
      />

      <DayTiles tiles={tiles} />

      <div className="card px-4 py-3">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[13px] lowercase text-ink-soft">entrenos de la semana</span>
          <span className="font-bold tabular-nums">
            {trainedThisWeek}/{goal}{' '}
            <span className="text-[12px] font-normal text-ink-faint">({pct}%)</span>
          </span>
        </div>
        <BlockMeter
          value={trainedThisWeek}
          max={goal}
          slots={16}
          tone={trainedThisWeek >= goal ? 'ok' : 'brand'}
        />
      </div>

      <Countdowns
        today={today}
        items={[
          { label: 'Extracción', date: settings.dateExtraction },
          { label: 'Cita SCyF', date: settings.dateAppointment },
          { label: 'Fin de reto', date: settings.dateChallengeEnd },
        ]}
      />

      <Card title="Suplementos">
        <SupplementChecklist date={viewDate} supplements={day.supplements} />
      </Card>

      <Card title="Omron">
        <VitalsCard today={today} latest={latestVitals} />
      </Card>

      <Card title={isToday ? 'Entrenos de hoy' : `Entrenos del ${formatShort(viewDate)}`}>
        <WorkoutList
          workouts={day.workouts}
          labels={settings.workoutLabels}
          extractionDate={settings.dateExtraction}
        />
      </Card>

      <QuickAdd
        date={viewDate}
        labels={settings.workoutLabels}
        sleep={day.sleep}
        metrics={day.metrics}
        vitals={vitals}
        extractionDate={settings.dateExtraction}
      />
    </main>
  );
}

function NavLink({ href, label, title }: { href: string; label: string; title: string }) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      className="tap grid size-11 shrink-0 place-items-center rounded-full border border-line bg-field text-xl font-bold text-ink-soft"
    >
      {label}
    </Link>
  );
}
