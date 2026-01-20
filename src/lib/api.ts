import type { ApiResponse, HistoryStats, Rate, RateHistory } from '../types/rates';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchRates(): Promise<Rate[]> {
  const res = await fetch(`${API_BASE}/api/v1/rates`);
  if (!res.ok) throw new Error('Failed to fetch rates');
  const data = await res.json();
  return data;
}

export async function fetchRatesByExchange(exchange: string): Promise<Rate[]> {
  const res = await fetch(`${API_BASE}/api/v1/rates/${exchange.toLowerCase()}`);
  if (!res.ok) throw new Error('Failed to fetch rates by exchange');
  const data = await res.json();
  return data;
}

export async function fetchHistory(
  exchangeCode: string,
  days: number = 30,
  currencyPair?: string,
): Promise<RateHistory[]> {
  let url = `${API_BASE}/api/v1/rates/history/${exchangeCode}?days=${days}`;
  if (currencyPair) {
    url += `&pair=${currencyPair.replace('/', '-')}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch history');
  const data = await res.json();
  return data;
}

export async function fetchHistoryStats(
  exchangeCode: string,
  currencyPair: string,
  days: number = 30,
): Promise<HistoryStats> {
  const pair = currencyPair.replace('/', '-');
  const res = await fetch(
    `${API_BASE}/api/v1/rates/history/${exchangeCode}/${pair}/stats?days=${days}`,
  );
  if (!res.ok) throw new Error('Failed to fetch stats');
  const data = await res.json();
  return data;
}
