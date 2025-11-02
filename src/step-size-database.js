/**
 * Step Size Database for AsterDEX
 * Comprehensive database of step sizes and precision requirements for all symbols
 * This ensures correct precision handling without needing to query exchange info
 */

export const STEP_SIZE_DATABASE = {
  // Major cryptocurrencies with 3 decimal places (0.001 step size)
  'BTCUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '1000' },
  'ETHUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'LTCUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'BCHUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'ETCUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'TRXUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'LINKUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'UNIUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'ATOMUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'NEARUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'FTMUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'ALGOUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'VETUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'ICPUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'FILUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'APTUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'SUIUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'ARBUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'OPUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'INJUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'SEIUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'TIAUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'WLDUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'PENDLEUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'JUPUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'WUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'BOMEUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'BONKUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'WIFUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'POPCATUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'MYROUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'FLOKIUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'PEPEUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'SHIBUSDT': { stepSize: '0.001', precision: 3, minQty: '0.001', maxQty: '10000' },
  'DOGEUSDT': { stepSize: '1', precision: 0, minQty: '1', maxQty: '10000000' },
  'ADAUSDT': { stepSize: '1', precision: 0, minQty: '1', maxQty: '10000000' },
  'AVAXUSDT': { stepSize: '1', precision: 0, minQty: '1', maxQty: '300000' },
  'DOTUSDT': { stepSize: '1', precision: 0, minQty: '1', maxQty: '1000000' },
  'MATICUSDT': { stepSize: '1', precision: 0, minQty: '1', maxQty: '1000000' },
  'SOLUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'BNBUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '100000' },
  'XRPUSDT': { stepSize: '0.1', precision: 1, minQty: '0.1', maxQty: '1000000' },
  'ASTERUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '2000000' },
  'USDCUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'USDTUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'BUSDUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'TUSDUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'USDDUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'FDUSDUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'TUSDTUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'USDFUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'USDCEUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'USDBCUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'USD1USDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'VUSDTUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'CUSDTUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'LISUSDUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'BONUSUSDUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'CDLUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'TWTUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'FORMUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'LISTAUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'JLPUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'STONEUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'RSETHUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'WBETHUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'ASBNBUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'SLISBNBUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'FBTCUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'SOLVBTCUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'PUMPBTCUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' },
  'CAKEUSDT': { stepSize: '0.01', precision: 2, minQty: '0.01', maxQty: '1000000' }
};

/**
 * Get step size information for a symbol
 * @param {string} symbol - Trading symbol
 * @returns {Object|null} - Step size information or null if not found
 */
export function getStepSizeInfo(symbol) {
  return STEP_SIZE_DATABASE[symbol.toUpperCase()] || null;
}

/**
 * Get precision for a symbol from database
 * @param {string} symbol - Trading symbol
 * @returns {number} - Precision value (0-4)
 */
export function getPrecisionFromDatabase(symbol) {
  const info = getStepSizeInfo(symbol);
  return info ? info.precision : 2; // Default to 2 if not found
}

/**
 * Get step size for a symbol from database
 * @param {string} symbol - Trading symbol
 * @returns {string|null} - Step size string or null if not found
 */
export function getStepSizeFromDatabase(symbol) {
  const info = getStepSizeInfo(symbol);
  return info ? info.stepSize : null;
}

/**
 * Check if symbol exists in database
 * @param {string} symbol - Trading symbol
 * @returns {boolean} - True if symbol exists in database
 */
export function isSymbolInDatabase(symbol) {
  return symbol.toUpperCase() in STEP_SIZE_DATABASE;
}

/**
 * Get all symbols in database
 * @returns {string[]} - Array of all symbols
 */
export function getAllSymbols() {
  return Object.keys(STEP_SIZE_DATABASE);
}

/**
 * Get symbols by precision
 * @param {number} precision - Precision value (0-4)
 * @returns {string[]} - Array of symbols with that precision
 */
export function getSymbolsByPrecision(precision) {
  return Object.entries(STEP_SIZE_DATABASE)
    .filter(([_, info]) => info.precision === precision)
    .map(([symbol, _]) => symbol);
}

/**
 * Get precision statistics
 * @returns {Object} - Statistics about precision distribution
 */
export function getPrecisionStats() {
  const stats = {};
  Object.values(STEP_SIZE_DATABASE).forEach(info => {
    const precision = info.precision;
    stats[precision] = (stats[precision] || 0) + 1;
  });
  return stats;
}



