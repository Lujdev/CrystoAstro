import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchHistory, fetchHistoryStats } from '../../lib/api';
import type { HistoryStats as IHistoryStats, RateHistory } from '../../types/rates';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { HistoryChart } from './HistoryChart';
import { HistoryStats } from './HistoryStats';
import { PeriodSelector } from './PeriodSelector';

interface HistoryContainerProps {
  initialExchange?: string;
  initialPair?: string;
}

export function HistoryContainer({
  initialExchange = 'BCV',
  initialPair = 'USD/VES',
}: HistoryContainerProps) {
  const [exchange, setExchange] = useState(initialExchange);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RateHistory[]>([]);
  const [stats, setStats] = useState<IHistoryStats | null>(null);

  useEffect(() => {
    loadData();
  }, [exchange, days]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Determine pair based on exchange (simplified logic)
      const pair = exchange === 'BINANCE_P2P' ? 'USDT/VES' : 'USD/VES';

      const [historyData, statsData] = await Promise.all([
        fetchHistory(exchange, days),
        fetchHistoryStats(exchange, pair, days),
      ]);

      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={exchange} onValueChange={setExchange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Exchange" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BCV">BCV</SelectItem>
              <SelectItem value="BINANCE_P2P">Binance USDT</SelectItem>
              <SelectItem value="ITALCAMBIOS">Italcambios</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PeriodSelector value={days} onChange={setDays} />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {stats && <HistoryStats stats={stats} />}
          <HistoryChart data={history} title={`Histórico ${exchange} (${days} días)`} />
        </>
      )}
    </div>
  );
}
