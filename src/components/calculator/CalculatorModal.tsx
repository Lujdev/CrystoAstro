import { useState, useEffect } from 'react';
import { Landmark, Bitcoin, ArrowUpDown, X, DollarSign, Banknote, Euro, Calculator } from 'lucide-react';

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
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'USDT'>('USD');
  const [foreignValue, setForeignValue] = useState<string>('1');
  const [bsValue, setBsValue] = useState<string>('');
  const [activeField, setActiveField] = useState<'FOREIGN' | 'BS'>('FOREIGN');
  const [isInverted, setIsInverted] = useState(false); // USD/EUR arriba = false, Bs arriba = true

  // Determine active rate based on selected currency
  const activeRate = currency === 'USDT' ? binanceRate : (currency === 'USD' ? bcvRate : bcvEurRate);
  const CurrencyIcon = currency === 'USDT' ? Bitcoin : (currency === 'USD' ? DollarSign : Euro);
  const currencyLabel = currency;
  const currencyColorClass = currency === 'USDT' 
    ? 'text-teal-600 dark:text-teal-400' 
    : (currency === 'USD' ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400');
  const currencyBgClass = currency === 'USDT'
    ? 'bg-teal-100 dark:bg-teal-900/50'
    : (currency === 'USD' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-purple-100 dark:bg-purple-900/50');

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
  // User asked "10,00 € en Binance P2P es tanto". Assuming 1:1 for simplicity or direct USDT conversion.
  // Generally people convert EUR -> USDT -> BS or EUR -> USD -> BS.
  // Using direct binanceRate (USDT) for both as a close proxy for "crypto dollar" value.
  const binanceBs = valNum * binanceRate; 
  
  const bsDifference = binanceBs - bcvBs;

  if (!isOpen) return null;

  // Foreign Input Component
  const ForeignInput = (
    <div className="group">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block uppercase tracking-[0.1em]">
        {currency === 'USDT' ? 'USDT (Tether)' : (currency === 'USD' ? 'Dólares (USD)' : 'Euros (EUR)')}
      </label>
      <div className="relative">
        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-focus-within:scale-110 ${currencyBgClass}`}>
          <CurrencyIcon className={`w-5 h-5 ${currencyColorClass}`} />
        </div>
        <input
          type="text"
          value={foreignValue}
          onChange={handleForeignChange}
          onFocus={() => setActiveField('FOREIGN')}
          placeholder="0.00"
          className={`w-full pl-16 pr-14 py-4 text-2xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none transition-all duration-300 ${
            currency === 'USDT' ? 'focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10' : 
            currency === 'USD' ? 'focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10' : 
            'focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10'
          }`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 tracking-tighter">
          {currency}
        </span>
      </div>
    </div>
  );

  // BS Input Component
  const BsInput = (
    <div className="group">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block uppercase tracking-[0.1em]">
        Bolívares (Bs) - {currency === 'USDT' ? 'Tasa P2P' : 'Tasa BCV'}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center transition-all duration-300 group-focus-within:scale-110">
          <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <input
          type="text"
          value={bsValue}
          onChange={handleBsChange}
          onFocus={() => setActiveField('BS')}
          placeholder="0.00"
          className="w-full pl-16 pr-14 py-4 text-2xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 tracking-tighter">
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
      <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border border-white/20 dark:border-slate-700/50 ring-1 ring-black/5 dark:ring-white/5">
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700">
          <div className="relative">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 opacity-90" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-50 to-white/90">Calculadora</span>
            </h2>
            <div className="flex gap-4 mt-1 text-[11px] font-bold text-blue-100/90 uppercase tracking-widest">
              {currency === 'USDT' 
                ? <span className="flex items-center gap-1.5"><Bitcoin className="w-3 h-3" /> P2P: {formatNumber(binanceRate)}</span>
                : <><span className="flex items-center gap-1.5"><Landmark className="w-3 h-3" /> BCV: {formatNumber(activeRate)}</span>{currency === 'USD' && <span className="flex items-center gap-1.5 opacity-80"><Bitcoin className="w-3 h-3" /> P2P: {formatNumber(binanceRate)}</span>}</>}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:rotate-90 active:scale-90"
           >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Currency Tabs - Premium Sliding Indicator */}
          <div className="relative p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center">
            {/* Sliding Background */}
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(33.33%-3px)] bg-white dark:bg-slate-700 rounded-xl shadow-lg shadow-black/5 transition-all duration-500 ease-out-expo ${
                currency === 'USD' ? 'left-1.5' : currency === 'EUR' ? 'left-[33.33%]' : 'left-[66.66%]'
              }`}
            />
            
            <button
              onClick={() => setCurrency('USD')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black tracking-widest uppercase transition-all duration-300 ${
                currency === 'USD' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <DollarSign className={`w-3.5 h-3.5 transition-transform ${currency === 'USD' ? 'scale-110' : ''}`} />
              USD
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black tracking-widest uppercase transition-all duration-300 ${
                currency === 'EUR' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <Euro className={`w-3.5 h-3.5 transition-transform ${currency === 'EUR' ? 'scale-110' : ''}`} />
              EUR
            </button>
            <button
              onClick={() => setCurrency('USDT')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black tracking-widest uppercase transition-all duration-300 ${
                currency === 'USDT' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <Bitcoin className={`w-3.5 h-3.5 transition-transform ${currency === 'USDT' ? 'scale-110' : ''}`} />
              USDT
            </button>
          </div>

          {/* First Input - depends on isInverted */}
          {isInverted ? BsInput : ForeignInput}

          {/* Swap Button - Compact */}
          <div className="flex justify-center -my-2.5 relative z-20">
            <button
              onClick={handleSwap}
              className={`p-3 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-500 hover:scale-110 active:rotate-180 active:scale-95 border-2 border-white dark:border-slate-800 ${isInverted ? 'rotate-180' : ''}`}
            >
              <ArrowUpDown className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Second Input - depends on isInverted */}
          {isInverted ? ForeignInput : BsInput}

          {/* Binance comparison - Only show when NOT in USDT mode */}
          {currency !== 'USDT' && (
            <div className="relative group overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-[1.5rem] p-4 border border-orange-200 dark:border-orange-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-150 duration-700">
                <Bitcoin size={100} />
              </div>
              <div className="flex items-center gap-2 mb-1.5 text-orange-700 dark:text-orange-300">
                <div className="p-1 bg-orange-100 dark:bg-orange-800 rounded-lg">
                  <Bitcoin size={14} className="animate-pulse" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {formatNumber(valNum)} $ en Binance USDT
                </span>
              </div>
              <div className="text-2xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
                {formatNumber(binanceBs)} <span className="text-sm font-bold opacity-70">Bs</span>
              </div>
              {bsDifference !== 0 && (
                <div className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                  bsDifference > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                }`}>
                  {bsDifference > 0 ? '+' : ''}{formatNumber(bsDifference)} Bs 
                  <span className="opacity-60 mx-1">•</span> 
                  {bsDifference > 0 ? '+' : ''}{formatNumber(bsDifference / activeRate)} $
                </div>
              )}
            </div>
          )}

          {/* Quick reference - Compact grid - Updates based on currency */}
          <div className="grid grid-cols-2 gap-3">
            {currency === 'USDT' ? (
              /* USDT mode: Show BCV USD and BCV EUR equivalents */
              <>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-3.5 border border-green-200 dark:border-green-800/50 shadow-sm transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-green-100 dark:bg-green-800 rounded-md">
                      <Landmark className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">BCV $</span>
                  </div>
                  <div className="text-lg font-black text-green-700 dark:text-green-300 tracking-tight">
                    {formatNumber(valNum * bcvRate)} <span className="text-xs font-bold opacity-60">Bs</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/20 rounded-2xl p-3.5 border border-purple-200 dark:border-purple-800/50 shadow-sm transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-purple-100 dark:bg-purple-800 rounded-md">
                      <Landmark className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 text-purple-600">BCV €</span>
                  </div>
                  <div className="text-lg font-black text-purple-700 dark:text-purple-300 tracking-tight">
                    {formatNumber(valNum * bcvEurRate)} <span className="text-xs font-bold opacity-60">Bs</span>
                  </div>
                </div>
              </>
            ) : (
              /* USD/EUR mode: Show BCV rate and P2P USDT rate */
              <>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-3.5 border border-blue-200 dark:border-blue-800/50 shadow-sm transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-1 text-blue-600">
                    <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded-md">
                      <Landmark className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">BCV {currency}</span>
                  </div>
                  <div className="text-lg font-black text-blue-700 dark:text-blue-300 tracking-tight">
                    {formatNumber(activeRate)} <span className="text-xs font-bold opacity-60">Bs</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl p-3.5 border border-orange-200 dark:border-orange-800/50 shadow-sm transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-1 text-orange-600">
                    <div className="p-1 bg-orange-100 dark:bg-orange-800 rounded-md">
                      <Bitcoin className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">P2P USDT</span>
                  </div>
                  <div className="text-lg font-black text-orange-700 dark:text-orange-300 tracking-tight">
                    {formatNumber(binanceRate)} <span className="text-xs font-bold opacity-60">Bs</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
