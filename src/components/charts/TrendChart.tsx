'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type TrendPoint = { label: string; value: number | null };

const AXIS = { fontSize: 11, fill: '#5f7185', fontFamily: 'ui-monospace, monospace' };
const GRID = '#1e2936';
const GOAL = '#f0b429';

export function TrendChart({
  data,
  color = '#4fc3f7',
  unit = '',
  goal,
  decimals = 0,
}: {
  data: TrendPoint[];
  color?: string;
  unit?: string;
  goal?: number;
  decimals?: number;
}) {
  const hasData = data.some((point) => point.value !== null);
  if (!hasData) {
    return (
      <p className="grid h-40 place-items-center text-[15px] text-ink-faint">
        Aún no hay datos suficientes.
      </p>
    );
  }

  const format = (value: number) => `${value.toFixed(decimals)}${unit ? ` ${unit}` : ''}`;

  // El dominio se calcula a mano para que la línea de meta siempre quede dentro
  // del encuadre; con 'auto' Recharts ignora las ReferenceLine.
  const values = data.map((point) => point.value).filter((value): value is number => value !== null);
  const candidates = goal === undefined ? values : [...values, goal];
  const low = Math.min(...candidates);
  const high = Math.max(...candidates);
  const pad = (high - low || Math.max(1, Math.abs(high) * 0.05)) * 0.15;
  // Ninguna de estas métricas puede ser negativa: el eje no debe insinuarlo.
  const floor = Math.max(0, low - pad);

  const tickLabel = (value: number) =>
    Math.abs(value) >= 10000
      ? `${Math.round(value / 100) / 10}k`
      : value.toFixed(decimals);

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={46}
            allowDecimals={decimals > 0}
            domain={[floor, high + pad]}
            tickFormatter={tickLabel}
          />
          {goal !== undefined && (
            <ReferenceLine y={goal} stroke={GOAL} strokeDasharray="3 3" />
          )}
          <Tooltip
            formatter={(value) => [format(Number(value)), '']}
            labelStyle={{ color: '#8fa3b8', fontSize: 12 }}
            contentStyle={{
              borderRadius: 6,
              border: '1px solid #1e2936',
              background: '#10161f',
              color: '#d5e0ec',
              fontSize: 13,
            }}
            separator=""
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: color }}
            activeDot={{ r: 5 }}
            /* Sin dato = hueco en la línea, nunca un cero inventado. */
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
