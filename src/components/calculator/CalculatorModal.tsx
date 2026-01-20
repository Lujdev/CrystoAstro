import { useState, useEffect } from 'react';
import { Landmark, Bitcoin, ArrowUpDown, X, DollarSign, Banknote, Euro } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  bcvRate: number;
  bcvEurRate: number;
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
  // If value contains a comma, assume it's using es-VE format (dots for thousands, comma for decimal)
  if (value.includes(',')) {
    const normalized = value.replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(normalized) || 0;
  }
  // Otherwise assume standard format or US format
  const normalized = value.replace(/[^0-9.]/g, '');
  return parseFloat(normalized) || 0;
};

export function CalculatorModal({ isOpen, onClose, bcvRate, bcvEurRate, binanceRate }: CalculatorModalProps) {
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [foreignValue, setForeignValue] = useState<string>('1');
  const [bsValue, setBsValue] = useState<string>('');
  const [activeField, setActiveField] = useState<'FOREIGN' | 'BS'>('FOREIGN');
  const [isInverted, setIsInverted] = useState(false); // USD/EUR arriba = false, Bs arriba = true

  // Determine active rate based on selected currency
  const activeRate = currency === 'USD' ? bcvRate : bcvEurRate;
  const CurrencyIcon = currency === 'USD' ? DollarSign : Euro;
  const currencyLabel = currency;
  const currencyColorClass = currency === 'USD' ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400';
  const currencyBgClass = currency === 'USD' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-purple-100 dark:bg-purple-900/50';

  // Calculate conversions when Foreign Currency value changes
  useEffect(() => {
    if (activeField === 'FOREIGN') {
      const val = parseInput(foreignValue);
      const bs = val * activeRate;
      setBsValue(bs > 0 ? formatNumber(bs) : '');
    }
  }, [foreignValue, activeRate, activeField, currency]);

  // Calculate conversions when BS value changes
  useEffect(() => {
    if (activeField === 'BS') {
      const bs = parseInput(bsValue);
      const val = bs / activeRate;
      setForeignValue(val > 0 ? formatNumber(val) : '');
    }
  }, [bsValue, activeRate, activeField, currency]);

  // Reset values when currency flips to keep it clean (or we could convert)
  // Let's keep the numeric value but recalculate bs
  useEffect(() => {
    if (activeField === 'FOREIGN') {
       const val = parseInput(foreignValue);
       const bs = val * activeRate;
       setBsValue(bs > 0 ? formatNumber(bs) : '');
    } else {
       // If Bs was active and we switch currency, keep Bs constant and update foreign
       const bs = parseInput(bsValue);
       const val = bs / activeRate;
       setForeignValue(val > 0 ? formatNumber(val) : '');
    }
  }, [currency]);


  const handleForeignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveField('FOREIGN');
    let value = e.target.value.replace(/,/g, '.');
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    setForeignValue(value);
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

  // Swap position (invert display order)
  const handleSwap = () => {
    setIsInverted(!isInverted);
  };

  const valNum = parseInput(foreignValue);

  // Calculations
  const bcvBs = valNum * activeRate;
  
  // Binance calculation logic:
  // If USD: valNum * binanceRate
  // If EUR: for now, using USDT rate as reference (paridad) or just hiding? 
  // User asked "10,00 € en Binance USDT es tanto". Assuming 1:1 for simplicity or direct USDT conversion.
  // Generally people convert EUR -> USDT -> BS or EUR -> USD -> BS.
  // Using direct binanceRate (USDT) for both as a close proxy for "crypto dollar" value.
  const binanceBs = valNum * binanceRate; 
  
  const bsDifference = binanceBs - bcvBs;

  if (!isOpen) return null;

  // Foreign Input Component
  const ForeignInput = (
    <div>
      <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
        {currency === 'USD' ? 'Dólares (USD)' : 'Euros (EUR)'}
      </label>
      <div className="relative">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center ${currencyBgClass}`}>
          <CurrencyIcon className={`w-4 h-4 ${currencyColorClass}`} />
        </div>
        <input
          type="text"
          value={foreignValue}
          onChange={handleForeignChange}
          onFocus={() => setActiveField('FOREIGN')}
          placeholder="0.00"
          className="w-full pl-14 pr-14 py-3 text-xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
          {currency}
        </span>
      </div>
    </div>
  );

  // BS Input Component
  const BsInput = (
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
  );

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
              <span>BCV: {formatNumber(activeRate)} Bs</span>
              {currency === 'USD' && <span>P2P: {formatNumber(binanceRate)} Bs</span>}
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
          {/* Currency Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-2">
            <button
              onClick={() => setCurrency('USD')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                currency === 'USD' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              USD
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                currency === 'EUR' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Euro className="w-4 h-4" />
              EUR
            </button>
          </div>

          {/* First Input - depends on isInverted */}
          {isInverted ? BsInput : ForeignInput}

          {/* Swap Button - Compact */}
          <div className="flex justify-center -my-1">
            <button
              onClick={handleSwap}
              className={`p-2 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full transition-all hover:scale-110 active:scale-95 ${isInverted ? 'rotate-180' : ''}`}
            >
              <ArrowUpDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
          </div>

          {/* Second Input - depends on isInverted */}
          {isInverted ? ForeignInput : BsInput}

          {/* Binance comparison - Compact */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-3 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-1.5 mb-1">
              <Bitcoin className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                {formatNumber(valNum)} $ en Binance USDT
              </span>
            </div>
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {formatNumber(binanceBs)} Bs
            </div>
            {bsDifference > 0 && (
              <div className="text-xs font-medium text-green-600 dark:text-green-400">
                +{formatNumber(bsDifference)} Bs (+{formatNumber(bsDifference / activeRate)} $)
              </div>
            )}
            {bsDifference < 0 && (
              <div className="text-xs font-medium text-red-600 dark:text-red-400">
                {formatNumber(bsDifference)} Bs ({formatNumber(bsDifference / activeRate)} $)
              </div>
            )}
          </div>

          {/* Quick reference - Compact grid - Updates based on currency */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Landmark className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">BCV {currency}</span>
              </div>
              <div className="text-base font-bold text-blue-700 dark:text-blue-300">
                {formatNumber(activeRate)} Bs
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2.5 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Bitcoin className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">BINANCE USDT</span>
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
