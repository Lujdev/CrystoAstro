import { useState, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatBs } from '../../lib/format';
import type { RateHistory } from '../../types/rates';

interface RecentHistoryProps {
  bcvUsdData: RateHistory[];
  bcvEurData: RateHistory[];
  binanceData: RateHistory[];
  limit?: number;
  loading?: boolean;
}

export function RecentHistory({ bcvUsdData, bcvEurData, binanceData, limit = 18, loading }: RecentHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Helper to deduplicate and sort by date (keep latest record per day)
  const getLatestByDate = (data: RateHistory[]) => {
    const uniqueMap = data.reduce((acc, item) => {
      const dateKey = new Date(item.recorded_at).toDateString();
      if (!acc[dateKey] || new Date(item.recorded_at) > new Date(acc[dateKey].recorded_at)) {
        acc[dateKey] = item;
      }
      return acc;
    }, {} as Record<string, RateHistory>);
    
    return Object.values(uniqueMap).sort((a, b) => 
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );
  };

  const cleanBcvUsd = getLatestByDate(bcvUsdData);
  const cleanBcvEur = getLatestByDate(bcvEurData);
  const cleanBinance = getLatestByDate(binanceData);

  // Merge data by date using clean sources
  const realMergedData = cleanBcvUsd.slice(0, limit).map((bcvUsdItem) => {
    const date = new Date(bcvUsdItem.recorded_at).toDateString();
    
    const bcvEurItem = cleanBcvEur.find(
      (b) => new Date(b.recorded_at).toDateString() === date
    );
    const binanceItem = cleanBinance.find(
      (b) => new Date(b.recorded_at).toDateString() === date
    );
    
    const bcvUsdPrice = bcvUsdItem.buy_price;
    const bcvEurPrice = bcvEurItem?.buy_price || 0;
    const binancePrice = binanceItem?.buy_price || 0;
    
    // Gap between Binance P2P and BCV USD
    const gap = binancePrice && bcvUsdPrice 
      ? ((binancePrice - bcvUsdPrice) / bcvUsdPrice * 100)
      : 0;

    return {
      date: new Date(bcvUsdItem.recorded_at),
      bcvUsd: bcvUsdPrice,
      bcvEur: bcvEurPrice,
      binance: binancePrice,
      gap: gap,
      isSkeleton: false,
    };
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  // If loading and we need more rows to match the limit, fill with skeletons
  // This prevents the "shifting down" jump when data finally arrives
  const mergedData = useMemo(() => {
    if (loading && realMergedData.length < limit) {
      const skeletons = Array.from({ length: limit - realMergedData.length }).map((_, i) => ({
        date: new Date(),
        bcvUsd: 0,
        bcvEur: 0,
        binance: 0,
        gap: 0,
        isSkeleton: true,
      }));
      return [...realMergedData, ...skeletons];
    }
    return realMergedData;
  }, [realMergedData, loading, limit]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollTo = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-black/5">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-500">
            <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-[0.1em]">
            Historial de Cotizaciones
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {mergedData.length} registros
          </span>
        </div>
      </div>

      {/* Scroll hint for mobile */}
      <div className="sm:hidden text-center py-1.5 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center gap-1">
        <ChevronLeft className="w-3 h-3" />
        Desliza para ver más
        <ChevronRight className="w-3 h-3" />
      </div>

      {/* Table with horizontal scroll */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className={`overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent transition-opacity duration-300 ${loading ? 'opacity-40 animate-pulse pointer-events-none' : 'opacity-100'}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/50 dark:border-slate-700">
              <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] sticky left-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 border-r border-slate-200/50 dark:border-slate-800/50">
                FECHA
              </th>
              <th className="px-3 sm:px-4 py-3 text-right text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                BCV USD
              </th>
              <th className="px-3 sm:px-4 py-3 text-right text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                BCV EUR
              </th>
              <th className="px-3 sm:px-4 py-3 text-right text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                BINANCE USDT
              </th>
              <th className="px-3 sm:px-4 py-3 text-right text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                BRECHA
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {mergedData.map((item: any, index: number) => (
              <tr 
                key={index} 
                className={`transition-colors ${item.isSkeleton ? 'pointer-events-none' : 'hover:bg-blue-50/50 dark:hover:bg-slate-800/50'}`}
              >
                <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap sticky left-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 border-r border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {!item.isSkeleton && format(item.date, 'd MMM. yyyy', { locale: es })}
                      {item.isSkeleton && '...'}
                    </span>
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                    {!item.isSkeleton ? `${formatBs(item.bcvUsd)} Bs` : '...'}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400">
                    {item.isSkeleton ? '...' : (item.bcvEur ? `${formatBs(item.bcvEur)} Bs` : '-')}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400">
                    {!item.isSkeleton ? `${formatBs(item.binance)} Bs` : '...'}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap">
                  <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full ${
                    item.isSkeleton ? 'bg-slate-100 dark:bg-slate-800' :
                    item.gap >= 0 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {!item.isSkeleton ? `${item.gap.toFixed(2)}%` : '...'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mergedData.length === 0 && (
        <div className="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400 text-sm">
          No hay datos disponibles
        </div>
      )}
    </div>
  );
}
