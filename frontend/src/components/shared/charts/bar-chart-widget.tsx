'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type BarProps,
} from 'recharts';

interface BarChartWidgetProps {
  data: Record<string, unknown>[];
  xKey: string;
  bars: Array<{
    key: string;
    color: string;
    name?: string;
  }>;
  height?: number;
  stacked?: boolean;
}

export function BarChartWidget({
  data,
  xKey,
  bars,
  height = 300,
  stacked = false,
}: BarChartWidgetProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 13,
            borderRadius: '8px',
            border: '1px solid hsl(var(--border))',
          }}
        />
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name ?? bar.key}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
