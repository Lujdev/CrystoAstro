import type { ApiResponse, HistoryStats, Rate, RateHistory } from '../types/rates';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

// Cache keys
const CACHE_KEYS = {
  RATES: 'crysto_cache_rates',
  HISTORY: 'crysto_cache_history_',
  STATS: 'crysto_cache_stats_',
};

// Cache expiry time (1 hour)
const CACHE_EXPIRY = 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isStale?: boolean;
}

function getCache<T>(key: string): CacheEntry<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage might be full
  }
}

function isCacheValid(entry: CacheEntry<unknown> | null): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_EXPIRY;
}

// Event to notify components about rate limiting
export const rateLimitEvent = new EventTarget();

export function dispatchRateLimitWarning(isLimited: boolean): void {
  rateLimitEvent.dispatchEvent(
    new CustomEvent('ratelimit', { detail: { isLimited } })
  );
}

export async function fetchRates(): Promise<Rate[]> {
  const cacheKey = CACHE_KEYS.RATES;
  
  try {
    const res = await fetch(`${API_BASE}/api/v1/rates`);
    
    if (res.status === 429) {
      // Rate limited - return cached data
      const cached = getCache<Rate[]>(cacheKey);
      if (cached?.data) {
        dispatchRateLimitWarning(true);
        return cached.data;
      }
      throw new Error('Rate limited and no cache available');
    }
    
    if (!res.ok) throw new Error('Failed to fetch rates');
    
    const data = await res.json();
    setCache(cacheKey, data);
    dispatchRateLimitWarning(false);
    return data;
  } catch (error) {
    // Network error or other issue - try cache
    const cached = getCache<Rate[]>(cacheKey);
    if (cached?.data) {
      dispatchRateLimitWarning(true);
      return cached.data;
    }
    throw error;
  }
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
  const cacheKey = `${CACHE_KEYS.HISTORY}${exchangeCode}_${days}_${currencyPair || 'all'}`;
  
  let url = `${API_BASE}/api/v1/rates/history/${exchangeCode}?days=${days}`;
  if (currencyPair) {
    url += `&pair=${currencyPair.replace('/', '-')}`;
  }
  
  try {
    const res = await fetch(url);
    
    if (res.status === 429) {
      // Rate limited - return cached data
      const cached = getCache<RateHistory[]>(cacheKey);
      if (cached?.data) {
        dispatchRateLimitWarning(true);
        return cached.data;
      }
      throw new Error('Rate limited and no cache available');
    }
    
    if (!res.ok) throw new Error('Failed to fetch history');
    
    let data: RateHistory[] = await res.json();
    
    if (currencyPair) {
      // Client-side filtering as backup if backend ignores the pair param
      data = data.filter(item => item.currency_pair === currencyPair);
    }
    
    setCache(cacheKey, data);
    dispatchRateLimitWarning(false);
    return data;
  } catch (error) {
    // Network error or other issue - try cache
    const cached = getCache<RateHistory[]>(cacheKey);
    if (cached?.data) {
      dispatchRateLimitWarning(true);
      return cached.data;
    }
    throw error;
  }
}

export async function fetchHistoryStats(
  exchangeCode: string,
  currencyPair: string,
  days: number = 30,
): Promise<HistoryStats> {
  const cacheKey = `${CACHE_KEYS.STATS}${exchangeCode}_${currencyPair}_${days}`;
  const pair = currencyPair.replace('/', '-');
  
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/rates/history/${exchangeCode}/${pair}/stats?days=${days}`,
    );
    
    if (res.status === 429) {
      // Rate limited - return cached data
      const cached = getCache<HistoryStats>(cacheKey);
      if (cached?.data) {
        dispatchRateLimitWarning(true);
        return cached.data;
      }
      throw new Error('Rate limited and no cache available');
    }
    
    if (!res.ok) throw new Error('Failed to fetch stats');
    
    const data = await res.json();
    setCache(cacheKey, data);
    dispatchRateLimitWarning(false);
    return data;
  } catch (error) {
    // Network error or other issue - try cache
    const cached = getCache<HistoryStats>(cacheKey);
    if (cached?.data) {
      dispatchRateLimitWarning(true);
      return cached.data;
    }
    throw error;
  }
}
