import { Countdowns } from '@/components/Countdowns';
import { DayTiles } from '@/components/DayTiles';
import { PlannedToday } from '@/components/PlannedToday';
import { QuickAdd } from '@/components/QuickAdd';
import { SupplementChecklist } from '@/components/SupplementChecklist';
import { WorkoutList } from '@/components/WorkoutList';
import { Card } from '@/components/ui';
import { endOfWeek, formatFull, startOfWeek, todayISO } from '@/lib/date';
import { countWorkoutDays, getDay } from '@/lib/queries/day';
import { plannedFor } from '@/lib/plan';
import { getSettings } from '@/lib/settings';
import { buildDayTiles } from '@/lib/status';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const today = todayISO();
  const [settings, day] = await Promise.all([getSettings(), getDay(today)]);
  const weekFrom = startOfWeek(today);
  const trainedThisWeek = await countWorkoutDays(weekFrom, endOfWeek(today));

  const tiles = buildDayTiles(day, settings);
  const goal = settings.goalWorkoutsPerWeek;
  const planned = plannedFor(today, settings.weeklyTemplate);
  const plannedDone = day.workouts.some((workout) => workout.type === planned);
  const pct = goal > 0 ? Math.min(100, Math.round((trainedThisWeek / goal) * 100)) : 0;

  return (
    <main className="flex flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight">Hoy</h1>
          <p className="text-[15px] text-ink-soft">{formatFull(today)}</p>
        </div>
        <span className="text-[13px] font-semibold text-ink-faint">FitTrack</span>
      </header>

      <PlannedToday
        date={today}
        planned={planned}
        labels={settings.workoutLabels}
        done={plannedDone}
      />

      <DayTiles tiles={tiles} />

      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[15px] font-medium text-ink-soft">Entrenos de la semana</span>
          <span className="font-bold tabular-nums">
            {trainedThisWeek}/{goal}
          </span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-idle-bg"
          role="progressbar"
          aria-valuenow={trainedThisWeek}
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-label="Entrenos completados esta semana"
        >
          <div
            className={`h-full rounded-full ${trainedThisWeek >= goal ? 'bg-ok' : 'bg-brand'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
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
        <SupplementChecklist date={today} supplements={day.supplements} />
      </Card>

      <Card title="Entrenos de hoy">
        <WorkoutList workouts={day.workouts} labels={settings.workoutLabels} />
      </Card>

      <QuickAdd
        date={today}
        labels={settings.workoutLabels}
        sleep={day.sleep}
        metrics={day.metrics}
      />
    </main>
  );
}
