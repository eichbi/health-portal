import { formatShort } from '@/lib/date';
import { markerTrend, movementGlyph, type Trend } from '@/lib/labs';
import type { MarkerMatrix } from '@/lib/queries/labs';
import { Empty } from '../ui';

const TREND_CLASS: Record<Trend, string> = {
  better: 'text-ok',
  worse: 'text-bad',
  flat: 'text-ink-faint',
  none: 'text-ink-faint',
};

function fmt(value: number | undefined): string {
  if (value == null) return '–';
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
}

export function MarkerTable({ matrix }: { matrix: MarkerMatrix }) {
  if (matrix.markers.length === 0) {
    return <Empty>Sin paneles capturados todavía.</Empty>;
  }

  const [latest, previous] = matrix.panels;

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <table className="w-full min-w-max border-collapse text-[15px]">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="sticky left-0 bg-surface py-2 pr-3 font-semibold">Marcador</th>
            {matrix.panels.map((panel) => (
              <th key={panel.id} className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                {formatShort(panel.date)}
              </th>
            ))}
            <th className="py-2 pl-3 text-right font-semibold">vs.</th>
          </tr>
        </thead>
        <tbody>
          {matrix.markers.map((marker) => {
            const row = matrix.values[marker] ?? {};
            const latestValue = latest ? row[latest.id] : undefined;
            const previousValue = previous ? row[previous.id] : undefined;
            const trend = markerTrend(marker, latestValue, previousValue);
            const glyph = movementGlyph(latestValue, previousValue);

            return (
              <tr key={marker} className="border-b border-line last:border-b-0">
                <th scope="row" className="sticky left-0 bg-surface py-2 pr-3 text-left font-medium">
                  {marker}
                  {matrix.unitByMarker[marker] && (
                    <span className="ml-1 text-[12px] text-ink-faint">
                      {matrix.unitByMarker[marker]}
                    </span>
                  )}
                </th>
                {matrix.panels.map((panel) => (
                  <td key={panel.id} className="px-3 py-2 text-right tabular-nums">
                    {fmt(row[panel.id])}
                  </td>
                ))}
                <td className={`py-2 pl-3 text-right text-lg font-bold ${TREND_CLASS[trend]}`}>
                  {glyph}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
