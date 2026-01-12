import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatBs } from '../../lib/format';
import type { RateHistory } from '../../types/rates';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface HistoryChartProps {
  data: RateHistory[];
  title?: string;
}

export function HistoryChart({ data, title = 'Histórico de Precio' }: HistoryChartProps) {
  const chartData = data
    .map((item) => ({
      date: new Date(item.recorded_at),
      price: item.buy_price,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(date, 'd MMM', { locale: es })}
              minTickGap={30}
              className="text-xs"
            />
            <YAxis
              domain={['auto', 'auto']}
              className="text-xs"
              tickFormatter={(val) => `Bs ${val}`}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
              labelFormatter={(date) => format(date, 'd MMM yyyy HH:mm', { locale: es })}
              formatter={(value: any) => [`Bs ${formatBs(Number(value))}`, 'Precio']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
