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
  '7D': 7,
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
  const [chartPeriod, setChartPeriod] = useState<'7D' | '30D' | '3M' | '1Y'>('30D');
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Calculator Modal */}
      <CalculatorModal 
        isOpen={calculatorOpen} 
        onClose={closeCalculator}
        bcvRate={bcvUsdRate?.buy_price || 0}
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2.5 rounded-xl">
                <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Dólar BCV</span>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatBs(bcvUsdRate.buy_price)} <span className="text-lg font-medium text-slate-500">Bs.</span>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                bcvUsdRate.variation_24h >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className={`w-3.5 h-3.5 ${bcvUsdRate.variation_24h < 0 ? 'rotate-180' : ''}`} />
                {bcvUsdRate.variation_24h >= 0 ? '+' : ''}{bcvUsdRate.variation_24h.toFixed(2)}% 
                <span className="text-slate-400 dark:text-slate-500 font-normal">vs. cierre anterior</span>
              </div>
            </div>
          </div>
        )}

        {/* Binance P2P Rate Card */}
        {binanceRate && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/50 p-2.5 rounded-xl">
                <Bitcoin className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Binance P2P</span>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatBs(binanceRate.buy_price)} <span className="text-lg font-medium text-slate-500">Bs.</span>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                binanceRate.variation_24h >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className={`w-3.5 h-3.5 ${binanceRate.variation_24h < 0 ? 'rotate-180' : ''}`} />
                {binanceRate.variation_24h >= 0 ? '+' : ''}{binanceRate.variation_24h.toFixed(2)}% 
                <span className="text-slate-400 dark:text-slate-500 font-normal">vs. cierre anterior</span>
              </div>
            </div>
          </div>
        )}

        {/* Gap Card - Brecha Cambiaria */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-yellow-200/30 dark:from-orange-500/10 dark:to-yellow-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Brecha Cambiaria</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">OFICIAL VS BINANCE</span>
            </div>
            <div className="text-center py-2">
              <div className="text-4xl sm:text-5xl font-bold text-orange-600 dark:text-orange-400">
                {gap.toFixed(2)}%
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Dif: {formatBs(gapDifference)} Bs
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                La brecha indica la distancia porcentual entre el dólar oficial y el paralelo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Average Value Card - Valor Promedio */}
      {bcvUsdRate && binanceRate && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                VALOR PROMEDIO
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Promedio ponderado de compra USD/USDT
              </p>
            </div>
            <button 
              onClick={openCalculator}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Abrir calculadora"
            >
              <Calculator className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
                Bs {formatBs(averageRate)}
              </span>
              <div className={`mt-2 inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${
                avgVariation >= 0 
                  ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30' 
                  : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30'
              }`}>
                <TrendingUp className={`w-4 h-4 ${avgVariation < 0 ? 'rotate-180' : ''}`} />
                {avgVariation >= 0 ? '+' : ''}{avgVariation.toFixed(2)}% hoy
              </div>
            </div>
            <div className="flex gap-4">
              {/* Mini BCV card */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
                  <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">BCV</div>
                  <div className="font-bold text-slate-900 dark:text-white">{formatBs(bcvUsdRate.buy_price)}</div>
                </div>
              </div>
              {/* Mini Binance card */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl">
                <div className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-lg">
                  <Bitcoin className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Binance</div>
                  <div className="font-bold text-slate-900 dark:text-white">{formatBs(binanceRate.buy_price)}</div>
                </div>
              </div>
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
      />
    </div>
  );
}
