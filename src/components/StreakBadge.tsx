/**
 * Racha de días completos seguidos, en el slot derecho del header de Hoy. En
 * cero no hay nada que presumir todavía, así que se muestra el nombre del
 * portal en su lugar (mismo hueco que ocupaba antes de que existiera la racha).
 */
export function StreakBadge({ days }: { days: number }) {
  if (days <= 0) {
    return <span className="shrink-0 text-[12px] text-ink-faint">fittrack</span>;
  }

  return (
    <span
      title={`Racha de ${days} día${days === 1 ? '' : 's'} completos seguidos`}
      className="shrink-0 text-[13px] font-bold tabular-nums text-brand"
    >
      ▲{days}
    </span>
  );
}
