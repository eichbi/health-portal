import { TrendChart } from '@/components/charts/TrendChart';
import { Card, Empty, ScreenHeader } from '@/components/ui';
import { formatShort, minutesToHours, todayISO } from '@/lib/date';
import { ROUNDS_RELEVANT_TYPES } from '@/lib/defaults';
import { getTrends } from '@/lib/queries/trends';
import { getRoundsSeries, getVitalsBetween } from '@/lib/queries/vitals';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const WEEKS = 12;

const ROUNDS_COLORS: Record<string, string> = {
  A: '#4fc3f7',
  C: '#3ddc84',
  E: '#f0b429',
};

export default async function TrendsPage() {
  const today = todayISO();
  const [settings, trends] = await Promise.all([getSettings(), getTrends(today, WEEKS)]);
  const [vitals, rounds] = await Promise.all([
    getVitalsBetween(trends.from, trends.to),
    getRoundsSeries(trends.from, trends.to),
  ]);

  const systolic = vitals.map((row) => ({
    label: formatShort(row.date),
    value: row.systolic,
  }));
  const diastolic = vitals.map((row) => ({
    label: formatShort(row.date),
    value: row.diastolic,
  }));
  const restingHr = vitals.map((row) => ({
    label: formatShort(row.date),
    value: row.restingHr,
  }));

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
      <ScreenHeader
        path="tendencias"
        meta={`últimas ${WEEKS} semanas · ${formatShort(trends.from)} → ${formatShort(trends.to)}`}
      />

      <Card title="Peso (media 7 días)">
        <TrendChart data={weight} unit="kg" decimals={1} color="#4fc3f7" />
      </Card>

      <Card title="Sueño promedio entre semana (L-V)">
        <TrendChart
          data={sleep}
          unit="h"
          decimals={1}
          color="#a78bfa"
          goal={minutesToHours(settings.goalSleepMin)}
        />
      </Card>

      <Card title="Pasos promedio por semana">
        <TrendChart data={steps} color="#f0b429" goal={settings.goalSteps} />
      </Card>

      <Card title="Entrenos por semana">
        <TrendChart data={workouts} color="#3ddc84" goal={settings.goalWorkoutsPerWeek} />
      </Card>

      <Card title="Rondas por sesión">
        <p className="mb-2 text-[13px] text-ink-soft">
          El plan progresa agregando 1 ronda, no más peso. Una serie por tipo de circuito.
        </p>
        {ROUNDS_RELEVANT_TYPES.filter((type) => type !== 'OTHER').map((type) => {
          const points = rounds
            .filter((point) => point.type === type)
            .map((point) => ({ label: formatShort(point.date), value: point.rounds }));
          if (points.length === 0) return null;
          return (
            <div key={type} className="mt-3">
              <p className="term-label mb-1">
                {type} · {settings.workoutLabels[type]}
              </p>
              <TrendChart data={points} color={ROUNDS_COLORS[type] ?? '#4fc3f7'} />
            </div>
          );
        })}
        {rounds.length === 0 && <Empty>Aún no hay sesiones con rondas registradas.</Empty>}
      </Card>

      <Card title="Omron · presión arterial">
        {vitals.length === 0 ? (
          <Empty>Sin tomas registradas. El plan la pide semanal, en ayunas.</Empty>
        ) : (
          <>
            <p className="term-label mb-1">Sistólica</p>
            <TrendChart data={systolic} unit="mmHg" color="#ff5f56" />
            <p className="term-label mb-1 mt-3">Diastólica</p>
            <TrendChart data={diastolic} unit="mmHg" color="#f0b429" />
          </>
        )}
      </Card>

      <Card title="FC en reposo">
        {vitals.length === 0 ? (
          <Empty>Sin tomas registradas.</Empty>
        ) : (
          <TrendChart data={restingHr} unit="bpm" color="#a78bfa" />
        )}
      </Card>

      <p className="px-1 text-[13px] text-ink-faint">
        Las líneas se cortan en los periodos sin datos: un hueco es falta de registro, no un cero.
      </p>
    </main>
  );
}
