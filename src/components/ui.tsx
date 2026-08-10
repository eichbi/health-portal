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
        <header className="mb-3 flex items-center justify-between gap-3">
          {title ? <h2 className="text-base font-semibold text-ink">{title}</h2> : <span />}
          {action}
        </header>
      )}
      {children}
    </section>
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
