import crypto from 'crypto';
import qs from 'querystring';

/**
 * Create HMAC SHA256 signature for signed endpoints
 * @param {string} secret - API secret
 * @param {string} payload - String to sign
 * @returns {string} - Hex signature
 */
export function createHmacSignature(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Floors a quantity to the nearest allowed step
 * @param {number} qty - Quantity to round
 * @param {string} stepSize - Step size from exchange filters
 * @returns {number} - Rounded quantity
 */
export function roundToStepFloor(qty, stepSize) {
  const s = parseFloat(stepSize);
  if (!s || s <= 0) return qty;
  const precision = Math.max(0, Math.round(-Math.log10(s)));
  const stepped = Math.floor(qty / s) * s;
  return parseFloat(stepped.toFixed(precision));
}

/**
 * Ensures quantity meets minimum notional value
 * @param {number} qty - Quantity
 * @param {number} price - Current price
 * @param {string} minNotional - Minimum notional value
 * @param {string} stepSize - Step size for rounding
 * @returns {number} - Adjusted quantity
 */
export function ensureMinNotional(qty, price, minNotional, stepSize) {
  const mn = parseFloat(minNotional || '0');
  if (!mn || mn <= 0) return qty;
  const notional = qty * price;
  if (notional >= mn) return qty;
  const need = mn / price;
  return roundToStepFloor(need, stepSize);
}

/**
 * Converts target notional (USD) to a valid quantity
 * @param {number} notionalUsd - Target notional value in USD
 * @param {number} price - Current price
 * @param {string} stepSize - Step size from filters
 * @param {string} minNotional - Minimum notional value
 * @returns {number} - Valid quantity
 */
export function qtyFromNotional(notionalUsd, price, stepSize, minNotional) {
  if (!price || price <= 0) return 0;
  let q = notionalUsd / price;
  q = ensureMinNotional(q, price, minNotional, stepSize);
  return Math.max(0.00000001, roundToStepFloor(q, stepSize));
}

/**
 * Extracts key filters for quantity/price validation
 * @param {Object} symbolInfo - Symbol information from exchange
 * @returns {Object} - Filter values
 */
export function extractFilters(symbolInfo) {
  const filters = symbolInfo?.filters || [];
  const lot = filters.find(f => f.filterType === 'LOT_SIZE') || {};
  const mlot = filters.find(f => f.filterType === 'MARKET_LOT_SIZE') || {};
  const minNotional = filters.find(f => f.filterType === 'MIN_NOTIONAL') || {};
  const priceFilter = filters.find(f => f.filterType === 'PRICE_FILTER') || {};
  
  return {
    stepSize: (mlot.stepSize || lot.stepSize || '0.00000001'),
    minNotional: (minNotional.notional || minNotional.minNotional || '0'),
    tickSize: (priceFilter.tickSize || '0.01'),
  };
}

/**
 * Sleep utility function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safely parse a number with fallback
 * @param {string|number} value - Value to parse
 * @param {number} fallback - Fallback value if parsing fails
 * @returns {number} - Parsed number or fallback
 */
export function safeParseFloat(value, fallback = 0) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Format a number with specified decimal places, handling NaN
 * @param {string|number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @param {string} fallback - Fallback string if value is NaN
 * @returns {string} - Formatted number string
 */
export function safeFormatNumber(value, decimals = 2, fallback = '0.00') {
  const parsed = safeParseFloat(value);
  return isNaN(parsed) ? fallback : parsed.toFixed(decimals);
}
