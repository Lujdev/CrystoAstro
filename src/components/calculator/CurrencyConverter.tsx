
import { useEffect, useState } from 'react';
import { Calculator, X, ArrowUpDown } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { formatBs } from '../../lib/format';

interface CurrencyConverterProps {
  rate: number;
  trigger?: React.ReactNode;
}

export function CurrencyConverter({ rate, trigger }: CurrencyConverterProps) {
  const [amountUSD, setAmountUSD] = useState<string>('1');
  const [amountVES, setAmountVES] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  useEffect(() => {
    // Initialize VES based on rate when modal opens or rate changes
    if (isOpen) {
      setAmountVES(formatValue(1 * rate));
      setAmountUSD('1');
    }
  }, [rate, isOpen]);

  const formatValue = (val: number) => {
    return val.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 4,
      useGrouping: false // Input fields don't handle grouping well usually
    });
  };

  const handleUSDChange = (value: string) => {
    setAmountUSD(value);
    if (!value || isNaN(Number(value))) {
      setAmountVES('');
      return;
    }
    const usd = parseFloat(value);
    setAmountVES(formatValue(usd * rate));
  };

  const handleVESChange = (value: string) => {
    setAmountVES(value);
    if (!value || isNaN(Number(value))) {
      setAmountUSD('');
      return;
    }
    const ves = parseFloat(value);
    setAmountUSD(formatValue(ves / rate));
  };

  const handleSwap = () => {
    setIsReversed(!isReversed);
  };

  // Helper to render USD Input
  const renderUSDInput = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex justify-between">
        <span>Monto en Dólares</span>
        <span className="text-primary text-xs font-semibold bg-primary/10 px-2 py-0.5 rounded">
          1 USD = {formatBs(rate)} Bs
        </span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-500 font-bold">$</span>
        </div>
        <input
          type="number"
          value={amountUSD}
          onChange={(e) => handleUSDChange(e.target.value)}
          className="block w-full pl-8 pr-12 py-3 rounded-lg border-border dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-semibold text-lg shadow-sm outline-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="0.00"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-slate-500 text-sm font-medium">USD</span>
        </div>
      </div>
    </div>
  );

  // Helper to render VES Input
  const renderVESInput = () => (
    <div className="space-y-2">
       <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Monto en Bolívares
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-500 font-bold">Bs</span>
        </div>
        <input
          type="number"
          value={amountVES}
          onChange={(e) => handleVESChange(e.target.value)}
          className="block w-full pl-9 pr-12 py-3 rounded-lg border-border dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-semibold text-lg shadow-sm outline-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="0.00"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-slate-500 text-sm font-medium">VES</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="rounded-full">
            <Calculator className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      {/* [&>button]:hidden removes the default Close button from Shadcn DialogContent */}
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-border dark:border-slate-800 p-0 overflow-hidden [&>button]:hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Conversor Rápido
          </h3>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
               <X className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </div>

        <div className="px-6 py-6 space-y-6">
          {isReversed ? (
            <>
              {renderVESInput()}
              {/* Divider / Swap UI */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border dark:border-slate-800"></div>
                </div>
                <button 
                  onClick={handleSwap}
                  className="relative z-10 p-2 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <ArrowUpDown className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </button>
              </div>
              {renderUSDInput()}
            </>
          ) : (
            <>
              {renderUSDInput()}
              {/* Divider / Swap UI */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border dark:border-slate-800"></div>
                </div>
                <button 
                   onClick={handleSwap}
                   className="relative z-10 p-2 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <ArrowUpDown className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </button>
              </div>
              {renderVESInput()}
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-border dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
           <span>Tasa de conversión actual</span>
           <span className="flex items-center gap-1 font-medium">
             Tu referencia financiera
           </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
