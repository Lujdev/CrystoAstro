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
  period: '30D' | '3M' | '1Y';
  onPeriodChange: (period: '30D' | '3M' | '1Y') => void;
  loading?: boolean;
}

const PERIODS: Array<'30D' | '3M' | '1Y'> = ['30D', '3M', '1Y'];

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
    <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-blue-500/5">
      {/* Header with gradient effect */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
              Evolución de Tasas
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Histórico de cotizaciones en el tiempo
            </p>
          </div>
        </div>

        {/* Period Selector - Premium slider style */}
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`relative z-10 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                period === p
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {p}
              {period === p && (
                <div className="absolute inset-x-1 inset-y-1 bg-white dark:bg-slate-700/80 rounded-lg shadow-sm -z-10 animate-in fade-in zoom-in-95 duration-300"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/10"></div>
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">BCV USD</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-purple-500/10"></div>
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">BCV EUR</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-500/10"></div>
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Binance USDT</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6 h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 opacity-50" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando datos...</span>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mergedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBcvUsd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBcvEur" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBinance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="4 4" 
                stroke="currentColor" 
                vertical={false}
                className="text-slate-200 dark:text-slate-800" 
              />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(date, 'd MMM', { locale: es })}
                minTickGap={60}
                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                className="text-slate-400 dark:text-slate-500"
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                className="text-slate-400 dark:text-slate-500"
                tickFormatter={(val) => val.toFixed(0)}
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl ring-1 ring-black/5">
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                          {label ? format(new Date(label), 'd MMMM yyyy', { locale: es }) : ''}
                        </p>
                        <div className="space-y-2">
                          {payload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center justify-between gap-8">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{entry.name}</span>
                              </div>
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                {formatBs(entry.value)} Bs.
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="bcvUsd"
                stroke="#3b82f6"
                strokeWidth={4}
                fill="url(#colorBcvUsd)"
                dot={false}
                activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 4, stroke: 'white' }}
                name="BCV USD"
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="bcvEur"
                stroke="#a855f7"
                strokeWidth={4}
                fill="url(#colorBcvEur)"
                dot={false}
                activeDot={{ r: 6, fill: '#a855f7', strokeWidth: 4, stroke: 'white' }}
                name="BCV EUR"
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="binance"
                stroke="#f97316"
                strokeWidth={4}
                fill="url(#colorBinance)"
                dot={false}
                activeDot={{ r: 6, fill: '#f97316', strokeWidth: 4, stroke: 'white' }}
                name="Binance USDT"
                animationDuration={1500}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
