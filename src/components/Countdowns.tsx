import { daysBetween, formatShort, type ISODate } from '@/lib/date';

export type Countdown = { label: string; date: ISODate };

export function Countdowns({ today, items }: { today: ISODate; items: Countdown[] }) {
  return (
    <ul className="grid grid-cols-3 gap-2">
      {items.map((item) => {
        const days = daysBetween(today, item.date);
        return (
          <li key={item.label} className="rounded-xl border border-line bg-white p-2.5 text-center">
            <p className="truncate text-[13px] font-medium text-ink-soft">{item.label}</p>
            <p className="text-2xl font-bold leading-tight tabular-nums">
              {days > 0 ? days : days === 0 ? '¡Hoy!' : '—'}
            </p>
            <p className="text-[12px] text-ink-faint">
              {days > 0 ? `días · ${formatShort(item.date)}` : formatShort(item.date)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
