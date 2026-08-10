import { daysBetween, formatShort, type ISODate } from '@/lib/date';

export type Countdown = { label: string; date: ISODate };

export function Countdowns({ today, items }: { today: ISODate; items: Countdown[] }) {
  return (
    <ul className="grid grid-cols-3 gap-1.5">
      {items.map((item) => {
        const days = daysBetween(today, item.date);
        const urgent = days >= 0 && days <= 7;
        return (
          <li
            key={item.label}
            className="rounded-md border border-line bg-field p-2.5 text-center"
          >
            <p className="truncate text-[12px] lowercase text-ink-soft">{item.label}</p>
            <p
              className={`text-2xl font-bold leading-tight tabular-nums ${
                urgent ? 'text-warn' : 'text-ink'
              }`}
            >
              {days > 0 ? `T-${days}` : days === 0 ? 'HOY' : '—'}
            </p>
            <p className="text-[11px] text-ink-faint">{formatShort(item.date)}</p>
          </li>
        );
      })}
    </ul>
  );
}
