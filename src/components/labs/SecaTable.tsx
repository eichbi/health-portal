import { formatShort } from '@/lib/date';
import type { SecaMeasurement } from '@/db/schema';
import { Empty } from '../ui';
import { SECA_FIELDS } from '@/lib/seca';

/** Misma lectura que la tabla de labs: una fila por métrica, una columna por fecha. */
export function SecaTable({ measurements }: { measurements: SecaMeasurement[] }) {
  if (measurements.length === 0) return <Empty>Sin mediciones SECA todavía.</Empty>;

  const columns = measurements.slice(0, 6);

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <table className="w-full min-w-max border-collapse text-[15px]">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="sticky left-0 bg-surface py-2 pr-3 font-semibold">Medición</th>
            {columns.map((measurement) => (
              <th
                key={measurement.id}
                className="px-3 py-2 text-right font-semibold whitespace-nowrap"
              >
                {formatShort(measurement.date)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SECA_FIELDS.map((field) => (
            <tr key={field.name} className="border-b border-line last:border-b-0">
              <th scope="row" className="sticky left-0 bg-surface py-2 pr-3 text-left font-medium">
                {field.label}
                <span className="ml-1 text-[12px] text-ink-faint">{field.unit}</span>
              </th>
              {columns.map((measurement) => (
                <td key={measurement.id} className="px-3 py-2 text-right tabular-nums">
                  {measurement[field.name] ?? '–'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
