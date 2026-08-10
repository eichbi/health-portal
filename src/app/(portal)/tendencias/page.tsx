import { TrendChart } from '@/components/charts/TrendChart';
import { Card } from '@/components/ui';
import { formatShort, minutesToHours, todayISO } from '@/lib/date';
import { getTrends } from '@/lib/queries/trends';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const WEEKS = 12;

export default async function TrendsPage() {
  const today = todayISO();
  const [settings, trends] = await Promise.all([getSettings(), getTrends(today, WEEKS)]);

  const weight = trends.weight.map((point) => ({
    label: formatShort(point.date),
    value: point.value,
  }));
  const sleep = trends.weekly.map((point) => ({
    label: formatShort(point.week),
    value: point.sleepHours,
  }));
  const steps = trends.weekly.map((point) => ({
    label: formatShort(point.week),
    value: point.steps,
  }));
  const workouts = trends.weekly.map((point) => ({
    label: formatShort(point.week),
    value: point.workouts,
  }));

  return (
    <main className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold leading-tight">Tendencias</h1>
        <p className="text-[15px] text-ink-soft">
          Últimas {WEEKS} semanas · {formatShort(trends.from)} a {formatShort(trends.to)}
        </p>
      </header>

      <Card title="Peso (media 7 días)">
        <TrendChart data={weight} unit="kg" decimals={1} color="#0f766e" />
      </Card>

      <Card title="Sueño promedio entre semana (L-V)">
        <TrendChart
          data={sleep}
          unit="h"
          decimals={1}
          color="#4f46e5"
          goal={minutesToHours(settings.goalSleepMin)}
        />
      </Card>

      <Card title="Pasos promedio por semana">
        <TrendChart data={steps} color="#b45309" goal={settings.goalSteps} />
      </Card>

      <Card title="Entrenos por semana">
        <TrendChart data={workouts} color="#15803d" goal={settings.goalWorkoutsPerWeek} />
      </Card>

      <p className="px-1 text-[13px] text-ink-faint">
        Las líneas se cortan en los periodos sin datos: un hueco es falta de registro, no un cero.
      </p>
    </main>
  );
}
