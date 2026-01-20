import { useState, useEffect } from 'react';
import { Landmark, Bitcoin, ArrowUpDown, X, DollarSign, Banknote } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  bcvRate: number;
  binanceRate: number;
}

// Format number with 2 decimals and Venezuelan format
const formatNumber = (value: number): string => {
  return value.toLocaleString('es-VE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

// Parse input value (accepts both comma and period as decimal separator)
const parseInput = (value: string): number => {
  const normalized = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  return parseFloat(normalized) || 0;
};

export function CalculatorModal({ isOpen, onClose, bcvRate, binanceRate }: CalculatorModalProps) {
  const [usdValue, setUsdValue] = useState<string>('1');
  const [bsValue, setBsValue] = useState<string>('');
  const [activeField, setActiveField] = useState<'USD' | 'BS'>('USD');

  // Calculate conversions when USD value changes
  useEffect(() => {
    if (activeField === 'USD') {
      const usd = parseInput(usdValue);
      const bs = usd * bcvRate;
      setBsValue(bs > 0 ? formatNumber(bs) : '');
    }
  }, [usdValue, bcvRate, activeField]);

  // Calculate conversions when BS value changes
  useEffect(() => {
    if (activeField === 'BS') {
      const bs = parseInput(bsValue);
      const usd = bs / bcvRate;
      setUsdValue(usd > 0 ? formatNumber(usd) : '');
    }
  }, [bsValue, bcvRate, activeField]);

  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveField('USD');
    let value = e.target.value.replace(/,/g, '.');
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    setUsdValue(value);
  };

  const handleBsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveField('BS');
    let value = e.target.value.replace(/,/g, '.');
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    setBsValue(value);
  };

  // Swap values
  const handleSwap = () => {
    const tempUsd = usdValue;
    const tempBs = bsValue;
    setUsdValue(tempBs);
    setBsValue(tempUsd);
    setActiveField(activeField === 'USD' ? 'BS' : 'USD');
  };

  const usdNum = parseInput(usdValue);

  // Calculations
  const bcvBs = usdNum * bcvRate;
  const binanceBs = usdNum * binanceRate;
  const bsDifference = binanceBs - bcvBs;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Compact for mobile */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="text-base font-bold text-white">Calculadora</h2>
            <div className="flex gap-3 text-[10px] text-blue-100">
              <span>BCV: {formatNumber(bcvRate)} Bs</span>
              <span>P2P: {formatNumber(binanceRate)} Bs</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* USD Input - Compact */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
              Dólares (USD)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <input
                type="text"
                value={usdValue}
                onChange={handleUsdChange}
                onFocus={() => setActiveField('USD')}
                placeholder="0.00"
                className="w-full pl-14 pr-14 py-3 text-xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                USD
              </span>
            </div>
          </div>

          {/* Swap Button - Compact */}
          <div className="flex justify-center -my-1">
            <button
              onClick={handleSwap}
              className="p-2 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full transition-all hover:scale-110 active:scale-95"
            >
              <ArrowUpDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
          </div>

          {/* BS Input - Compact */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
              Bolívares (Bs) - Tasa BCV
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <Banknote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <input
                type="text"
                value={bsValue}
                onChange={handleBsChange}
                onFocus={() => setActiveField('BS')}
                placeholder="0.00"
                className="w-full pl-14 pr-14 py-3 text-xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Bs
              </span>
            </div>
          </div>

          {/* Binance comparison - Compact */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-3 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-1.5 mb-1">
              <Bitcoin className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                {formatNumber(usdNum)} USD en Binance P2P
              </span>
            </div>
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {formatNumber(binanceBs)} Bs
            </div>
            {bsDifference > 0 && (
              <div className="text-xs font-medium text-green-600 dark:text-green-400">
                +{formatNumber(bsDifference)} Bs más que BCV
              </div>
            )}
          </div>

          {/* Quick reference - Compact grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Landmark className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">BCV</span>
              </div>
              <div className="text-base font-bold text-blue-700 dark:text-blue-300">
                {formatNumber(bcvRate)} Bs
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2.5 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Bitcoin className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">P2P</span>
              </div>
              <div className="text-base font-bold text-orange-700 dark:text-orange-300">
                {formatNumber(binanceRate)} Bs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
