import { Countdowns } from '@/components/Countdowns';
import { DayTiles } from '@/components/DayTiles';
import { PlannedToday } from '@/components/PlannedToday';
import { QuickAdd } from '@/components/QuickAdd';
import { SupplementChecklist } from '@/components/SupplementChecklist';
import { WorkoutList } from '@/components/WorkoutList';
import { BlockMeter, Card, ScreenHeader } from '@/components/ui';
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
      <ScreenHeader
        path="hoy"
        meta={formatFull(today)}
        right={<span className="shrink-0 text-[12px] text-ink-faint">fittrack</span>}
      />

      <PlannedToday
        date={today}
        planned={planned}
        labels={settings.workoutLabels}
        done={plannedDone}
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
