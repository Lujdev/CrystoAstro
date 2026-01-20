import { useState, useRef } from 'react';
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
}

export function RecentHistory({ bcvUsdData, bcvEurData, binanceData, limit = 18 }: RecentHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Merge data by date
  const mergedData = bcvUsdData.slice(0, limit).map((bcvUsdItem) => {
    const date = new Date(bcvUsdItem.recorded_at).toDateString();
    
    const bcvEurItem = bcvEurData.find(
      (b) => new Date(b.recorded_at).toDateString() === date
    );
    const binanceItem = binanceData.find(
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
    };
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1.5 sm:p-2 rounded-lg">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            Historial Reciente
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Scroll buttons for mobile */}
          <div className="flex items-center gap-1 sm:hidden">
            <button
              onClick={() => scrollTo('left')}
              disabled={!canScrollLeft}
              className={`p-1.5 rounded-lg transition-colors ${
                canScrollLeft 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTo('right')}
              disabled={!canScrollRight}
              className={`p-1.5 rounded-lg transition-colors ${
                canScrollRight 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-1 rounded-full">
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
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10">
                FECHA
              </th>
              <th className="px-3 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                BCV USD
              </th>
              <th className="px-3 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                BCV EUR
              </th>
              <th className="px-3 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                BINANCE P2P
              </th>
              <th className="px-3 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                BRECHA
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {mergedData.map((item, index) => (
              <tr 
                key={index} 
                className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap sticky left-0 bg-white dark:bg-slate-900 z-10">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {format(item.date, 'd MMM. yyyy', { locale: es })}
                    </span>
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                    {formatBs(item.bcvUsd)} Bs
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400">
                    {item.bcvEur ? `${formatBs(item.bcvEur)} Bs` : '-'}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-bold text-orange-500 dark:text-orange-400">
                    {item.binance ? `${formatBs(item.binance)} Bs` : '-'}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap">
                  <span className={`text-xs sm:text-sm font-bold ${
                    item.gap >= 0 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.gap.toFixed(2)}%
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
