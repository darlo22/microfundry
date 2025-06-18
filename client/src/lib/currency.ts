// Currency conversion utilities
export interface ExchangeRate {
  usdToNgn: number;
  source: string;
  lastUpdated: Date;
}

// Cache for exchange rate to avoid too many API calls
let exchangeRateCache: ExchangeRate | null = null;
let cacheExpiry: number = 0;

// Cache duration: 30 minutes
const CACHE_DURATION = 30 * 60 * 1000;

/**
 * Fetches USD to NGN exchange rate from multiple sources
 * Falls back to a reasonable default if APIs fail
 */
export async function getUsdToNgnRate(): Promise<ExchangeRate> {
  const now = Date.now();
  
  // Return cached rate if still valid
  if (exchangeRateCache && now < cacheExpiry) {
    return exchangeRateCache;
  }

  try {
    // Try to fetch from a reliable exchange rate API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (response.ok) {
      const data = await response.json();
      const rate = data.rates?.NGN;
      
      if (rate && typeof rate === 'number') {
        const exchangeRate: ExchangeRate = {
          usdToNgn: rate,
          source: 'ExchangeRate-API',
          lastUpdated: new Date()
        };
        
        // Cache the result
        exchangeRateCache = exchangeRate;
        cacheExpiry = now + CACHE_DURATION;
        
        return exchangeRate;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch exchange rate from primary source:', error);
  }

  try {
    // Fallback: Try another API
    const response = await fetch('https://api.fixer.io/latest?base=USD&symbols=NGN');
    
    if (response.ok) {
      const data = await response.json();
      const rate = data.rates?.NGN;
      
      if (rate && typeof rate === 'number') {
        const exchangeRate: ExchangeRate = {
          usdToNgn: rate,
          source: 'Fixer.io',
          lastUpdated: new Date()
        };
        
        exchangeRateCache = exchangeRate;
        cacheExpiry = now + CACHE_DURATION;
        
        return exchangeRate;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch exchange rate from fallback source:', error);
  }

  // Try to get Budpay-compatible rate from our backend
  try {
    const budpayRateResponse = await fetch('/api/budpay-exchange-rate');
    if (budpayRateResponse.ok) {
      const budpayData = await budpayRateResponse.json();
      if (budpayData.success && budpayData.rate) {
        const budpayRate: ExchangeRate = {
          usdToNgn: budpayData.rate,
          source: budpayData.source,
          lastUpdated: new Date(budpayData.lastUpdated)
        };
        
        exchangeRateCache = budpayRate;
        cacheExpiry = now + CACHE_DURATION;
        
        return budpayRate;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch Budpay exchange rate:', error);
  }

  // Final fallback: Use Budpay-compatible rate
  const fallbackRate: ExchangeRate = {
    usdToNgn: 1560, // Current Budpay-compatible rate
    source: 'Budpay Fallback Rate',
    lastUpdated: new Date()
  };
  
  exchangeRateCache = fallbackRate;
  cacheExpiry = now + CACHE_DURATION;
  
  return fallbackRate;
}

/**
 * Converts USD amount to NGN using current exchange rate
 */
export async function convertUsdToNgn(usdAmount: number): Promise<{
  ngn: number;
  rate: ExchangeRate;
}> {
  const rate = await getUsdToNgnRate();
  // Round to 2 decimal places for consistency
  const ngn = Math.round((usdAmount * rate.usdToNgn) * 100) / 100;
  
  return { ngn, rate };
}

/**
 * Formats currency amount with proper locale formatting
 */
export function formatCurrency(amount: number, currency: 'USD' | 'NGN'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

/**
 * Formats both USD and NGN amounts for display
 */
export async function formatDualCurrency(usdAmount: number): Promise<string> {
  const { ngn } = await convertUsdToNgn(usdAmount);
  const usdFormatted = formatCurrency(usdAmount, 'USD');
  const ngnFormatted = formatCurrency(ngn, 'NGN');
  
  return `${usdFormatted} (₦${ngn.toLocaleString('en-NG')})`;
}