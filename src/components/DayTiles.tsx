import { STATUS_STYLES, type Status } from './ui';
import type { Tile } from '@/lib/status';

export function DayTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <ul className="grid grid-cols-3 gap-2">
      {tiles.map((tile) => (
        <li key={tile.key}>
          <TileCard tile={tile} />
        </li>
      ))}
    </ul>
  );
}

function TileCard({ tile }: { tile: Tile }) {
  const styles = STATUS_STYLES[tile.status];
  return (
    <div className={`h-full rounded-xl border border-line p-2.5 ${styles.bg}`}>
      <div className="flex items-center gap-1.5">
        <span aria-hidden className={`size-2 shrink-0 rounded-full ${styles.dot}`} />
        <span className="truncate text-[13px] font-medium text-ink-soft">{tile.label}</span>
      </div>
      <p className={`mt-1 truncate text-[17px] font-bold leading-tight ${styles.text}`}>
        {tile.value}
      </p>
      {/* La meta puede envolver: en 3 columnas de 390 px un rango de kcal no
          cabe en una línea y truncarlo la vuelve inútil. */}
      <p className="text-[12px] leading-tight text-ink-faint">meta {tile.target}</p>
      <span className="sr-only">{statusText(tile.status)}</span>
    </div>
  );
}

function statusText(status: Status): string {
  return {
    ok: 'En meta',
    warn: 'Cerca de la meta',
    bad: 'Fuera de meta',
    idle: 'Sin dato',
  }[status];
}
