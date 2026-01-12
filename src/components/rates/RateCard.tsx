import { formatBs, formatTimeAgo } from '../../lib/format';
import type { Rate } from '../../types/rates';
import { Clock } from 'lucide-react';
import { CurrencyConverter } from '../calculator/CurrencyConverter';

interface RateCardProps {
  rate: Rate;
}

export function RateCard({ rate }: RateCardProps) {
  const variationColor = rate.variation_24h >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-card dark:bg-card border border-border dark:border-border-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className={`w-2 h-6 rounded-full ${
                rate.exchange_code === 'BCV' ? 'bg-blue-500' : 
                rate.exchange_code === 'BINANCE_P2P' ? 'bg-yellow-500' : 'bg-purple-500'
            }`}></span>
            {rate.currency_pair}
            <CurrencyConverter rate={rate.buy_price} />
          </h3>
        </div>
        <span className={`font-medium text-sm px-2 py-1 rounded-md ${
            rate.variation_24h >= 0 
            ? 'text-emerald-500 bg-emerald-500/10' 
            : 'text-red-500 bg-red-500/10'
        }`}>
            {rate.variation_24h >= 0 ? '+' : ''}{rate.variation_24h.toFixed(2)}%
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Compra</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bs {formatBs(rate.buy_price)}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Venta</p>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            Bs {formatBs(rate.sell_price || rate.buy_price)}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
        <span>Fuente: {rate.exchange_code}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTimeAgo(rate.last_updated)}
        </span>
      </div>
    </div>
  );
}
