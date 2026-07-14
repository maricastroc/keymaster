'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import type { TrendPoint } from '@/utils/aggregateStats';

/** WPM (and accuracy) plotted across a user's rounds over time. */
export function WpmTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">WPM over time</h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="index" stroke="var(--neutral-500)" axisLine={false} tickLine={false} fontSize={11} />
          <YAxis stroke="var(--neutral-500)" axisLine={false} tickLine={false} fontSize={11} />
          <Tooltip
            contentStyle={{
              background: 'var(--neutral-900)',
              border: '1px solid var(--neutral-700)',
              borderRadius: 12,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--neutral-500)' }}
            labelFormatter={(v) => `Round ${v}`}
          />
          <Line type="monotone" dataKey="wpm" stroke="var(--yellow-500)" strokeWidth={2} dot={false} name="WPM" />
          <Line type="monotone" dataKey="accuracy" stroke="var(--blue-400)" strokeWidth={2} dot={false} name="Accuracy" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
