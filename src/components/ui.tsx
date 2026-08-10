import type { ReactNode } from 'react';

export type Status = 'ok' | 'warn' | 'bad' | 'idle';

export const STATUS_STYLES: Record<Status, { text: string; bg: string; dot: string }> = {
  ok: { text: 'text-ok', bg: 'bg-ok-bg', dot: 'bg-ok' },
  warn: { text: 'text-warn', bg: 'bg-warn-bg', dot: 'bg-warn' },
  bad: { text: 'text-bad', bg: 'bg-bad-bg', dot: 'bg-bad' },
  idle: { text: 'text-idle', bg: 'bg-idle-bg', dot: 'bg-idle' },
};

export function Card({
  title,
  action,
  children,
  className = '',
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card p-4 ${className}`}>
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-3 border-b border-line pb-2">
          {title ? (
            <h2 className="flex min-w-0 items-baseline gap-1.5 text-[15px] font-semibold text-ink">
              <span aria-hidden className="text-brand">
                ▍
              </span>
              <span className="truncate">{title}</span>
            </h2>
          ) : (
            <span />
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Encabezado de pantalla con forma de prompt: `~/hoy ▮`. */
export function ScreenHeader({
  path,
  meta,
  right,
}: {
  path: string;
  meta?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="flex items-center gap-1.5 text-lg font-bold leading-tight">
          <span aria-hidden className="text-ink-faint">
            ~/
          </span>
          <span className="truncate">{path}</span>
          <span aria-hidden className="caret" />
        </h1>
        {meta && <p className="mt-0.5 text-[14px] text-ink-soft">{meta}</p>}
      </div>
      {right}
    </header>
  );
}

/** Barra de progreso en bloques, como las de una terminal. */
export function BlockMeter({
  value,
  max,
  slots = 12,
  tone = 'brand',
}: {
  value: number;
  max: number;
  slots?: number;
  tone?: 'brand' | 'ok';
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const filled = Math.round(ratio * slots);
  const color = tone === 'ok' ? 'text-ok' : 'text-brand';

  return (
    <span
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className="font-mono text-[15px] tracking-[0.08em]"
    >
      <span className="text-ink-faint">[</span>
      <span className={color}>{'█'.repeat(filled)}</span>
      <span className="text-line">{'░'.repeat(slots - filled)}</span>
      <span className="text-ink-faint">]</span>
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-[15px] text-ink-faint">{children}</p>;
}

export function Pill({ status, children }: { status: Status; children: ReactNode }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
      {children}
    </span>
  );
}

/** Fila etiqueta / valor usada en resúmenes y tablas simples. */
export function Row({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-2 last:border-b-0">
      <span className="text-[15px] text-ink-soft">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
