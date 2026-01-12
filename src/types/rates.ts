export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface Rate {
  id: number;
  exchange_code: string; // 'BCV', 'BINANCE_P2P', 'ITALCAMBIOS'
  currency_pair: string; // 'USD/VES', 'USDT/VES', 'EUR/VES'
  buy_price: number;
  sell_price?: number;
  spread?: number;
  variation_24h: number;
  volume_24h?: number;
  source: string;
  last_updated: Date;
}

export interface RateHistory {
  id: number;
  exchange_code: string;
  currency_pair: string;
  buy_price: number;
  sell_price?: number;
  source: string;
  recorded_at: Date;
}

export interface HistoryStats {
  min: number;
  max: number;
  avg: number;
  change: number;
  changePercent: number;
  records: number;
}

export type ExchangeCategory = 'BCV' | 'Crypto' | 'Otras';

export const EXCHANGE_CATEGORIES: Record<ExchangeCategory, string[]> = {
  BCV: ['BCV'],
  Crypto: ['BINANCE_P2P'],
  Otras: ['ITALCAMBIOS'],
};
