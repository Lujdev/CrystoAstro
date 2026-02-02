import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Rate, RateHistory } from '../../types/rates';
import { formatBs } from '../../lib/format';
import { Landmark, Bitcoin, TrendingUp, Calculator, Calendar, RefreshCw } from 'lucide-react';
import { CalculatorModal } from '../calculator/CalculatorModal';
import { EvolutionChart } from './EvolutionChart';
import { RecentHistory } from './RecentHistory';
import { fetchHistory } from '../../lib/api';

interface HomeContainerProps {
  rates: Rate[];
}

const PERIOD_DAYS: Record<string, number> = {
  '30D': 30,
  '3M': 90,
  '1Y': 365
};

export function HomeContainer({ rates }: HomeContainerProps) {
  const [historyData, setHistoryData] = useState<{ bcvUsd: RateHistory[]; bcvEur: RateHistory[]; binance: RateHistory[] }>({ 
    bcvUsd: [], 
    bcvEur: [], 
    binance: [] 
  });
  const [chartPeriod, setChartPeriod] = useState<'30D' | '3M' | '1Y'>('30D');
  const [loading, setLoading] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  // Memoize rate lookups
  const bcvUsdRate = useMemo(() => 
    rates.find((r) => r.exchange_code === 'BCV' && r.currency_pair === 'USD/VES'),
    [rates]
  );
  
  const bcvEurRate = useMemo(() => 
    rates.find((r) => r.exchange_code === 'BCV' && r.currency_pair === 'EUR/VES'),
    [rates]
  );
  
  const binanceRate = useMemo(() => 
    rates.find((r) => r.exchange_code === 'BINANCE_P2P' && r.currency_pair === 'USDT/VES'),
    [rates]
  );

  // Memoize calculations
  const { gap, gapDifference, averageRate, avgVariation } = useMemo(() => {
    const gap = bcvUsdRate && binanceRate 
      ? ((binanceRate.buy_price - bcvUsdRate.buy_price) / bcvUsdRate.buy_price * 100)
      : 0;
    
    const gapDifference = bcvUsdRate && binanceRate 
      ? (binanceRate.buy_price - bcvUsdRate.buy_price)
      : 0;

    const averageRate = bcvUsdRate && binanceRate 
      ? (bcvUsdRate.buy_price + binanceRate.buy_price) / 2 
      : 0;

    const avgVariation = bcvUsdRate && binanceRate
      ? (bcvUsdRate.variation_24h + binanceRate.variation_24h) / 2
      : 0;

    return { gap, gapDifference, averageRate, avgVariation };
  }, [bcvUsdRate, binanceRate]);

  // Memoize date formatting
  const dateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('es-VE', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Use callback for load history
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const days = PERIOD_DAYS[chartPeriod];
      const [bcvUsdHistory, bcvEurHistory, binanceHistory] = await Promise.all([
        fetchHistory('BCV', days, 'USD/VES'),
        fetchHistory('BCV', days, 'EUR/VES'),
        fetchHistory('BINANCE_P2P', days, 'USDT/VES')
      ]);
      
      setHistoryData({ 
        bcvUsd: bcvUsdHistory, 
        bcvEur: bcvEurHistory,
        binance: binanceHistory 
      });
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  }, [chartPeriod]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Callbacks for modal
  const openCalculator = useCallback(() => setCalculatorOpen(true), []);
  const closeCalculator = useCallback(() => setCalculatorOpen(false), []);

  return (
    <div className="relative w-full min-h-screen">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-700">
      {/* Calculator Modal */}
      <CalculatorModal 
        isOpen={calculatorOpen} 
        onClose={closeCalculator}
        bcvRate={bcvUsdRate?.buy_price || 0}
        bcvEurRate={bcvEurRate?.buy_price || 0}
        binanceRate={binanceRate?.buy_price || 0}
      />

      {/* Date and Update Status */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium">
          <Calendar className="w-4 h-4" />
          {dateFormatted}
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizado recientemente
        </span>
      </div>

      {/* Rate Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* BCV USD Rate Card */}
        {bcvUsdRate && (
          <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 border border-white/20 dark:border-slate-800/50 shadow-xl shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-blue-500/10 hover:border-blue-500/30">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <Landmark className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Dólar BCV</span>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatBs(bcvUsdRate.buy_price)} <span className="text-xl font-bold text-slate-400">Bs.</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                bcvUsdRate.variation_24h >= 0 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className={`w-3.5 h-3.5 ${bcvUsdRate.variation_24h < 0 ? 'rotate-180' : ''}`} />
                {bcvUsdRate.variation_24h >= 0 ? '+' : ''}{bcvUsdRate.variation_24h.toFixed(2)}% 
              </div>
            </div>
          </div>
        )}

        {/* Binance P2P Rate Card */}
        {binanceRate && (
          <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 border border-white/20 dark:border-slate-800/50 shadow-xl shadow-yellow-500/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-yellow-500/10 hover:border-yellow-500/30">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <Bitcoin className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Binance USDT</span>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatBs(binanceRate.buy_price)} <span className="text-xl font-bold text-slate-400">Bs.</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                binanceRate.variation_24h >= 0 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className={`w-3.5 h-3.5 ${binanceRate.variation_24h < 0 ? 'rotate-180' : ''}`} />
                {binanceRate.variation_24h >= 0 ? '+' : ''}{binanceRate.variation_24h.toFixed(2)}% 
              </div>
            </div>
          </div>
        )}

        {/* Gap Card - Brecha Cambiaria */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-3xl p-6 border border-slate-700/50 shadow-2xl shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-orange-500/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Brecha Oficial</span>
              <span className="text-[10px] font-black text-orange-400/80 bg-orange-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-orange-400/20">Vs Parallel</span>
            </div>
            <div className="text-center py-2">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-yellow-400 tracking-tight">
                {gap.toFixed(2)}%
              </div>
              <div className="text-sm font-bold text-slate-400 mt-2">
                Dif: {formatBs(gapDifference)} Bs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Average Value Card - Valor Promedio */}
      {bcvUsdRate && binanceRate && (
        <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl p-8 border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-blue-500/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative">
            <div className="text-center lg:text-left space-y-4">
              <div>
                <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] mb-2">
                  VALOR PROMEDIO MERCADO
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm">
                  Cálculo ponderado entre la tasa oficial BCV y la cotización promedio en Binance USDT.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {formatBs(averageRate)} <span className="text-2xl text-slate-400">Bs.</span>
                </div>
                <div className={`inline-flex items-center gap-2 text-sm font-black px-4 py-1.5 rounded-full border ${
                  avgVariation >= 0 
                    ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-red-600 bg-red-500/10 border-red-500/20'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${avgVariation < 0 ? 'rotate-180' : ''}`} />
                  {avgVariation >= 0 ? '+' : ''}{avgVariation.toFixed(2)}% Hoy
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Mini cards grid */}
              <div className="grid grid-cols-2 gap-3 flex-1 lg:w-64">
                <div className="bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Landmark size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BCV</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">{formatBs(bcvUsdRate.buy_price)}</div>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Bitcoin size={14} className="text-yellow-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BINANCE</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">{formatBs(binanceRate.buy_price)}</div>
                </div>
              </div>

              <button 
                onClick={openCalculator}
                className="group/btn relative px-8 py-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                <Calculator className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Calculadora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evolution Chart */}
      <EvolutionChart 
        bcvUsdData={historyData.bcvUsd} 
        bcvEurData={historyData.bcvEur}
        binanceData={historyData.binance}
        period={chartPeriod}
        onPeriodChange={setChartPeriod}
        loading={loading}
      />

      {/* Recent History Table */}
      <RecentHistory 
        bcvUsdData={historyData.bcvUsd} 
        bcvEurData={historyData.bcvEur}
        binanceData={historyData.binance} 
        loading={loading}
        limit={chartPeriod === '30D' ? 31 : 100}
      />
      </div>
    </div>
  );
}
