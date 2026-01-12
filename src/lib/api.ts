import type { ApiResponse, HistoryStats, Rate, RateHistory } from '../types/rates';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchRates(): Promise<Rate[]> {
  const res = await fetch(`${API_BASE}/api/v1/rates`);
  const data: ApiResponse<Rate[]> = await res.json();

  if (data.status === 'success' && data.data) {
    return data.data;
  }
  throw new Error(data.message || 'Error fetching rates');
}

export async function fetchRatesByExchange(exchange: string): Promise<Rate[]> {
  const res = await fetch(`${API_BASE}/api/v1/rates/${exchange.toLowerCase()}`);
  const data: ApiResponse<Rate[]> = await res.json();

  if (data.status === 'success' && data.data) {
    return data.data;
  }
  throw new Error(data.message || 'Error fetching rates');
}

export async function fetchHistory(
  exchangeCode: string,
  days: number = 30,
): Promise<RateHistory[]> {
  const res = await fetch(`${API_BASE}/api/v1/rates/history/${exchangeCode}?days=${days}`);
  const data: ApiResponse<RateHistory[]> = await res.json();

  if (data.status === 'success' && data.data) {
    return data.data;
  }
  throw new Error(data.message || 'Error fetching history');
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
  const data: ApiResponse<HistoryStats> = await res.json();

  if (data.status === 'success' && data.data) {
    return data.data;
  }
  throw new Error(data.message || 'Error fetching stats');
}
