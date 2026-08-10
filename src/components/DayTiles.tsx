import { STATUS_STYLES, type Status } from './ui';
import type { Tile } from '@/lib/status';

/** Glifo de estado, al estilo de la salida de un test runner. */
const STATUS_GLYPH: Record<Status, string> = {
  ok: '✓',
  warn: '!',
  bad: '✗',
  idle: '·',
};

const STATUS_TEXT: Record<Status, string> = {
  ok: 'En meta',
  warn: 'Cerca de la meta',
  bad: 'Fuera de meta',
  idle: 'Sin dato',
};

export function DayTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <ul className="grid grid-cols-3 gap-1.5">
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
    <div className={`h-full rounded-md border border-line p-2.5 ${styles.bg}`}>
      <div className="flex items-baseline gap-1.5">
        <span aria-hidden className={`text-[13px] font-bold ${styles.text}`}>
          {STATUS_GLYPH[tile.status]}
        </span>
        <span className="truncate text-[12px] lowercase text-ink-soft">{tile.label}</span>
      </div>
      <p className={`mt-1 truncate text-[17px] font-bold leading-tight tabular-nums ${styles.text}`}>
        {tile.value}
      </p>
      <p className="text-[11px] leading-tight text-ink-faint">→ {tile.target}</p>
      <span className="sr-only">{STATUS_TEXT[tile.status]}</span>
    </div>
  );
}
