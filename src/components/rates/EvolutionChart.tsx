import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, TrendingUp } from 'lucide-react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  ComposedChart,
} from 'recharts';
import { formatBs } from '../../lib/format';
import type { RateHistory } from '../../types/rates';

interface EvolutionChartProps {
  bcvUsdData: RateHistory[];
  bcvEurData: RateHistory[];
  binanceData: RateHistory[];
  period: '7D' | '30D' | '3M' | '1Y';
  onPeriodChange: (period: '7D' | '30D' | '3M' | '1Y') => void;
  loading?: boolean;
}

const PERIODS: Array<'7D' | '30D' | '3M' | '1Y'> = ['7D', '30D', '3M', '1Y'];

export function EvolutionChart({ bcvUsdData, bcvEurData, binanceData, period, onPeriodChange, loading }: EvolutionChartProps) {
  // Memoize merged data to avoid recalculating on every render
  const mergedData = useMemo(() => {
    return bcvUsdData.map((bcvUsdItem) => {
      const date = new Date(bcvUsdItem.recorded_at).toDateString();
      const bcvEurItem = bcvEurData.find(
        (b) => new Date(b.recorded_at).toDateString() === date
      );
      const binanceItem = binanceData.find(
        (b) => new Date(b.recorded_at).toDateString() === date
      );
      return {
        date: new Date(bcvUsdItem.recorded_at),
        bcvUsd: bcvUsdItem.buy_price,
        bcvEur: bcvEurItem?.buy_price || null,
        binance: binanceItem?.buy_price || null,
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [bcvUsdData, bcvEurData, binanceData]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Evolución de Tasas
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === p
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span className="text-sm text-slate-600 dark:text-slate-400">BCV USD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
          <span className="text-sm text-slate-600 dark:text-slate-400">BCV EUR</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="text-sm text-slate-600 dark:text-slate-400">Binance P2P</span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 h-[350px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mergedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBcvUsd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBcvEur" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBinance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-700" 
              />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(date, 'd MMM', { locale: es })}
                minTickGap={50}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-slate-500 dark:text-slate-400"
                axisLine={{ stroke: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-slate-500 dark:text-slate-400"
                tickFormatter={(val) => val.toFixed(0)}
                axisLine={{ stroke: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
                width={50}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'white',
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelFormatter={(date) => format(date, 'd MMM yyyy', { locale: es })}
                formatter={(value: any, name: string) => [
                  `Bs ${formatBs(Number(value))}`,
                  name
                ]}
              />
              <Area
                type="monotone"
                dataKey="bcvUsd"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#colorBcvUsd)"
                dot={false}
                activeDot={{ r: 6, fill: '#3b82f6' }}
                name="BCV USD"
              />
              <Area
                type="monotone"
                dataKey="bcvEur"
                stroke="#a855f7"
                strokeWidth={3}
                fill="url(#colorBcvEur)"
                dot={false}
                activeDot={{ r: 6, fill: '#a855f7' }}
                name="BCV EUR"
              />
              <Area
                type="monotone"
                dataKey="binance"
                stroke="#f97316"
                strokeWidth={3}
                fill="url(#colorBinance)"
                dot={false}
                activeDot={{ r: 6, fill: '#f97316' }}
                name="Binance P2P"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
