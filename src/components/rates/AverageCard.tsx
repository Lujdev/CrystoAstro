
import { TrendingUp, Landmark, Bitcoin, Calculator } from 'lucide-react';
import type { Rate } from '../../types/rates';
import { formatBs, getVariationColor } from '../../lib/format';
import { CurrencyConverter } from '../calculator/CurrencyConverter';
import { cn } from '../../lib/utils';

interface AverageCardProps {
  bcvRate: Rate;
  binanceRate: Rate;
}

export function AverageCard({ bcvRate, binanceRate }: AverageCardProps) {
  const average = (bcvRate.buy_price + binanceRate.buy_price) / 2;
  const avgVariation = (bcvRate.variation_24h + binanceRate.variation_24h) / 2;

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="bg-white dark:bg-card rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 dark:border-slate-800 relative">
        {/* Calculator Button (Top Right) */}
        <div className="absolute top-6 right-6 z-20">
          <CurrencyConverter rate={average} 
            trigger={
              <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <Calculator className="w-5 h-5" />
              </button>
            }
          />
        </div>

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              VALOR PROMEDIO
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Promedio ponderado de compra USD/USDT
            </p>
          </div>

          <div className="flex flex-col items-center pt-2 pb-4">
            <span className="text-4xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Bs {formatBs(average)}
            </span>
            <div className={cn(
              "mt-3 flex items-center space-x-1 text-sm font-bold px-3 py-1.5 rounded-full",
              avgVariation >= 0 ? "text-emerald-600 bg-emerald-100/50 dark:bg-emerald-500/10" : "text-red-500 bg-red-100/50 dark:bg-red-500/10"
            )}>
              <TrendingUp className={cn("w-4 h-4", avgVariation < 0 && "rotate-180")} />
              <span>{avgVariation >= 0 ? '+' : ''}{avgVariation.toFixed(2)}% hoy</span>
            </div>
          </div>

          <div className="w-full pt-8 border-t border-slate-100 dark:border-slate-800 px-4">
            <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-2xl mx-auto">
              
              {/* BCV Card */}
              <div className="flex items-center justify-between w-full p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl">
                    <Landmark className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">BCV</div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg">Bs {formatBs(bcvRate.buy_price)}</div>
                  </div>
                </div>
                <CurrencyConverter rate={bcvRate.buy_price} 
                   trigger={
                    <button className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <Calculator className="w-5 h-5" />
                    </button>
                   }
                />
              </div>

               {/* Binance Card */}
               <div className="flex items-center justify-between w-full p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2.5 rounded-xl">
                    <Bitcoin className="text-yellow-600 dark:text-yellow-400 w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Binance</div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg">Bs {formatBs(binanceRate.buy_price)}</div>
                  </div>
                </div>
                <CurrencyConverter rate={binanceRate.buy_price}
                  trigger={
                    <button className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <Calculator className="w-5 h-5" />
                    </button>
                   }
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
