import fs from 'fs';
import path from 'path';
import { getPrecisionFromDatabase, getStepSizeFromDatabase, isSymbolInDatabase } from './step-size-database.js';

/**
 * Precision Manager for AsterDEX API
 * Automatically handles quantity precision errors and saves working values
 */
export class PrecisionManager {
  constructor() {
    this.precisionFile = path.join(process.cwd(), '.precision-cache.json');
    this.precisionCache = this.loadPrecisionCache();
  }

  /**
   * Load precision cache from file
   * @returns {Object} - Precision cache object
   */
  loadPrecisionCache() {
    try {
      if (fs.existsSync(this.precisionFile)) {
        const data = fs.readFileSync(this.precisionFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.log('No precision cache found, starting fresh');
    }
    return {};
  }

  /**
   * Save precision cache to file
   * @param {Object} cache - Precision cache object
   */
  savePrecisionCache(cache) {
    try {
      fs.writeFileSync(this.precisionFile, JSON.stringify(cache, null, 2));
      console.log(`💾 Saved precision cache for future use`);
    } catch (error) {
      console.error('Failed to save precision cache:', error.message);
    }
  }

  /**
   * Get precision for a symbol
   * @param {string} symbol - Trading symbol (e.g., 'BTCUSDT')
   * @returns {number} - Precision value (0-4)
   */
  getPrecision(symbol) {
    // Return cached precision if available
    if (this.precisionCache[symbol]) {
      return this.precisionCache[symbol];
    }
    
    // Try database first
    if (isSymbolInDatabase(symbol)) {
      const dbPrecision = getPrecisionFromDatabase(symbol);
      console.log(`📊 Using database precision for ${symbol}: ${dbPrecision} decimal places`);
      return dbPrecision;
    }
    
    // Fallback to pattern matching for unknown symbols
    const symbolUpper = symbol.toUpperCase();
    if (symbolUpper.includes('BTC') || symbolUpper.includes('ETH')) {
      return 3; // BTC, ETH use 3 decimal places
    } else if (symbolUpper.includes('ASTER') || symbolUpper.includes('SOL') || symbolUpper.includes('BNB')) {
      return 2; // ASTER, SOL, BNB use 2 decimal places
    } else if (symbolUpper.includes('XRP')) {
      return 1; // XRP uses 1 decimal place
    } else if (symbolUpper.includes('ADA') || symbolUpper.includes('DOGE') || symbolUpper.includes('AVAX')) {
      return 0; // ADA, DOGE, AVAX use whole numbers
    }
    
    return 2; // Default to 2 decimal places for unknown symbols
  }

  /**
   * Set precision for a symbol
   * @param {string} symbol - Trading symbol
   * @param {number} precision - Precision value (0-4)
   */
  setPrecision(symbol, precision) {
    this.precisionCache[symbol] = precision;
    this.savePrecisionCache(this.precisionCache);
  }

  /**
   * Round quantity to specified precision
   * @param {number} quantity - Raw quantity
   * @param {number} precision - Number of decimal places
   * @returns {number} - Rounded quantity
   */
  roundQuantity(quantity, precision) {
    const multiplier = Math.pow(10, precision);
    return Math.floor(quantity * multiplier) / multiplier;
  }

  /**
   * Handle precision error by trying different precision values
   * @param {string} symbol - Trading symbol
   * @param {number} quantity - Original quantity
   * @param {Function} tradeFunction - Function to retry the trade
   * @returns {Promise<Object>} - Trade result
   */
  async handlePrecisionError(symbol, quantity, tradeFunction) {
    const startPrecision = this.getPrecision(symbol);
    console.log(`🔧 Handling precision error for ${symbol}, starting with precision ${startPrecision}`);

    // Try precision values from cached value down to 0
    for (let precision = startPrecision; precision >= 0; precision--) {
      try {
        console.log(`🔄 Trying precision ${precision} for ${symbol}...`);
        const roundedQuantity = this.roundQuantity(quantity, precision);
        
        console.log(`  Original: ${quantity.toFixed(8)}`);
        console.log(`  Rounded:  ${roundedQuantity.toFixed(precision)} (precision ${precision})`);
        
        // Try the trade with rounded quantity
        const result = await tradeFunction(roundedQuantity);
        
        // If successful, save this precision for future use
        this.setPrecision(symbol, precision);
        console.log(`✅ Success with precision ${precision} for ${symbol}`);
        return result;
        
      } catch (error) {
        if (error.response && error.response.data && 
            error.response.data.code === -1111 && 
            error.response.data.msg.includes('Precision is over the maximum')) {
          console.log(`❌ Precision ${precision} failed, trying ${precision - 1}...`);
          continue;
        } else {
          // Different error, re-throw
          throw error;
        }
      }
    }
    
    throw new Error(`All precision values (${startPrecision} to 0) failed for ${symbol}`);
  }

  /**
   * Get quantity with smart precision handling
   * @param {string} symbol - Trading symbol
   * @param {number} quantity - Raw quantity
   * @returns {number} - Properly rounded quantity
   */
  getSmartQuantity(symbol, quantity) {
    const precision = this.getPrecision(symbol);
    return this.roundQuantity(quantity, precision);
  }

  /**
   * Calculate precision from step size
   * @param {string} stepSize - Step size string (e.g., "0.001")
   * @returns {number} - Precision value
   */
  calculatePrecisionFromStepSize(stepSize) {
    const stepSizeNum = parseFloat(stepSize);
    if (stepSizeNum <= 0) return 3; // Default to 3 if invalid
    return Math.max(0, Math.round(-Math.log10(stepSizeNum)));
  }

  /**
   * Auto-detect precision for a symbol from exchange info
   * @param {Object} exchangeInfo - Exchange information
   * @param {string} symbol - Trading symbol
   * @returns {number} - Detected precision
   */
  detectPrecisionFromExchangeInfo(exchangeInfo, symbol) {
    const symbolInfo = exchangeInfo.symbols?.find(s => s.symbol === symbol);
    if (!symbolInfo) return 3; // Default to 3 if symbol not found

    // Check MARKET_LOT_SIZE first, then LOT_SIZE
    const marketLotFilter = symbolInfo.filters?.find(f => f.filterType === 'MARKET_LOT_SIZE');
    const lotFilter = symbolInfo.filters?.find(f => f.filterType === 'LOT_SIZE');
    
    const stepSize = marketLotFilter?.stepSize || lotFilter?.stepSize;
    if (!stepSize) return 3; // Default to 3 if no step size found

    return this.calculatePrecisionFromStepSize(stepSize);
  }
}

// Export singleton instance
export const precisionManager = new PrecisionManager();
