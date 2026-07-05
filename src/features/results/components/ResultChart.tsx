import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Scatter,
  Legend,
} from 'recharts';
import { useMemo } from 'react';
import { CustomTooltip } from './CustomTooltip';
import { smoothData } from '@/utils/smoothData';

type ChartPoint = {
  second: number;
  wpm: number;
  raw: number;
  burst: number;
  errors: number | null;
  errorCount: number;
};

export const ResultChart = ({ data }: { data: ChartPoint[] }) => {
  const smoothed = useMemo(() => smoothData(data, 4), [data]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={smoothed}>
        <CartesianGrid stroke="var(--chart-grid)" vertical={false} />

        <XAxis
          dataKey="second"
          stroke="var(--neutral-500)"
          axisLine={false}
          tickLine={false}
          label={{
            value: 'Seconds',
            offset: -5,
            position: 'insideBottom',
            style: { fill: 'var(--neutral-400)', fontSize: 11 },
          }}
        />

        <YAxis
          stroke="var(--neutral-500)"
          axisLine={false}
          tickLine={false}
          label={{
            value: 'Words per minute',
            angle: -90,
            position: 'insideLeft',
            style: { fill: 'var(--neutral-400)', fontSize: 11 },
          }}
        />

        <Tooltip content={<CustomTooltip />} />

        <Legend
          verticalAlign="top"
          height={28}
          iconType="plainline"
          wrapperStyle={{ fontSize: 11, color: 'var(--neutral-400)' }}
        />

        <Line
          type="monotone"
          dataKey="raw"
          stroke="var(--green-500)"
          strokeWidth={2}
          dot={false}
          name="Raw"
        />

        <Line
          type="monotone"
          dataKey="wpm"
          stroke="var(--blue-400)"
          strokeWidth={2}
          dot={false}
          name="WPM"
        />

        <Line
          type="monotone"
          dataKey="burst"
          stroke="var(--neutral-400)"
          strokeDasharray="4 4"
          strokeWidth={2}
          dot={false}
          name="Burst"
        />

        <Scatter dataKey="errors" fill="var(--red-500)" name="Errors" />
      </LineChart>
    </ResponsiveContainer>
  );
};
