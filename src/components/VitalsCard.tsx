import { daysBetween, formatShort, type ISODate } from '@/lib/date';
import type { Vitals } from '@/db/schema';
import { Empty } from './ui';

/**
 * El plan pide la toma semanal. Mostrar cuántos días llevas sin ella convierte
 * una captura que se olvida en una que se ve.
 */
export function VitalsCard({ today, latest }: { today: ISODate; latest: Vitals | null }) {
  if (!latest) {
    return <Empty>Sin tomas de Omron. El plan la pide semanal, en ayunas.</Empty>;
  }

  const days = daysBetween(latest.date, today);
  const overdue = days > 7;

  return (
    <div>
      <div className="flex items-baseline gap-4">
        {latest.systolic != null && latest.diastolic != null && (
          <p className="text-2xl font-bold tabular-nums">
            {latest.systolic}
            <span className="text-ink-faint">/</span>
            {latest.diastolic}
            <span className="ml-1 text-[13px] font-normal text-ink-faint">mmHg</span>
          </p>
        )}
        {latest.restingHr != null && (
          <p className="text-2xl font-bold tabular-nums">
            {latest.restingHr}
            <span className="ml-1 text-[13px] font-normal text-ink-faint">bpm</span>
          </p>
        )}
      </div>
      <p className={`mt-1 text-[13px] ${overdue ? 'font-semibold text-warn' : 'text-ink-faint'}`}>
        {days === 0
          ? `Tomada hoy · ${formatShort(latest.date)}`
          : `Hace ${days} ${days === 1 ? 'día' : 'días'} · ${formatShort(latest.date)}`}
        {overdue && ' · toca una nueva'}
      </p>
      {latest.notes && <p className="mt-1 text-[13px] text-ink-soft">{latest.notes}</p>}
    </div>
  );
}
