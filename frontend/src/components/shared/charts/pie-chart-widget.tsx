'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PieChartWidgetProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  innerRadius?: number;
  showLegend?: boolean;
}

const DEFAULT_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function PieChartWidget({
  data,
  height = 250,
  innerRadius = 0,
  showLegend = true,
}: PieChartWidgetProps) {
  const chartData = data.map((d, i) => ({
    ...d,
    color: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            fontSize: 13,
            borderRadius: '8px',
            border: '1px solid hsl(var(--border))',
          }}
        />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-sm text-muted-foreground">{value}</span>
            )}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
