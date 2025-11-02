import axios from 'axios';
import qs from 'querystring';
import crypto from 'crypto';
import { createHmacSignature, roundToStepFloor, ensureMinNotional, qtyFromNotional, extractFilters, sleep } from './utils.js';
import { precisionManager } from './precision-manager.js';

/**
 * AsterDEX API Client for Futures Trading
 */
export class AsterdexClient {
  constructor(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('AsterdexClient: config object is required');
    }
    
    if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.trim().length === 0) {
      throw new Error('AsterdexClient: apiKey is required and must be a non-empty string');
    }
    
    if (!config.apiSecret || typeof config.apiSecret !== 'string' || config.apiSecret.trim().length === 0) {
      throw new Error('AsterdexClient: apiSecret is required and must be a non-empty string');
    }
    
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseURL = config.baseURL || 'https://fapi.asterdex.com';
    this.recvWindow = config.recvWindow || 5000;
    this.timeout = config.timeout || 20000;
  }

  /**
   * Make a public request (no authentication required)
   * @param {string} method - HTTP method
   * @param {string} path - API endpoint path
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response
   */
  async publicRequest(method, path, params = {}) {
    const url = `${this.baseURL}${path}${Object.keys(params).length ? `?${qs.stringify(params)}` : ''}`;
    const response = await axios({ method, url, timeout: this.timeout });
    return response.data;
  }

  /**
   * Make a signed request (authentication required)
   * @param {string} method - HTTP method
   * @param {string} path - API endpoint path
   * @param {Object} queryParams - Query parameters
   * @param {Object} body - Request body
   * @returns {Promise<Object>} - API response
   */
  async signedRequest(method, path, queryParams = {}, body = {}) {
    const timestamp = Date.now();
    const recvWindow = this.recvWindow;

    if (method.toUpperCase() === 'GET') {
      const query = { ...queryParams, timestamp, recvWindow };
      const queryStr = qs.stringify(query);
      const signature = createHmacSignature(this.apiSecret, queryStr);
      const url = `${this.baseURL}${path}?${queryStr}&signature=${signature}`;
      const headers = { 
        'X-MBX-APIKEY': this.apiKey, 
        'Accept': 'application/json' 
      };
      const response = await axios.get(url, { headers, timeout: this.timeout });
      return response.data;
    } else {
      const form = { ...body, timestamp, recvWindow };
      const formStr = qs.stringify(form);
      const signature = createHmacSignature(this.apiSecret, formStr);
      const url = `${this.baseURL}${path}${Object.keys(queryParams).length ? `?${qs.stringify(queryParams)}` : ''}`;
      const headers = {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      };
      const data = `${formStr}&signature=${signature}`;
      const response = await axios({ method, url, headers, data, timeout: this.timeout });
      return response.data;
    }
  }

  // ===== Market Data Methods =====

  /**
   * Get exchange information including symbol filters
   * @returns {Promise<Object>} - Exchange information
   */
  async getExchangeInfo() {
    return this.publicRequest('GET', '/fapi/v1/exchangeInfo');
  }

  /**
   * Get last price for a symbol
   * @param {string} symbol - Trading symbol (e.g., 'BTCUSDT')
   * @returns {Promise<number>} - Last price
   */
  async getLastPrice(symbol) {
    const response = await this.publicRequest('GET', '/fapi/v1/ticker/price', { symbol });
    return parseFloat(response.price);
  }

  /**
   * Get 24hr ticker price change statistics
   * @param {string} symbol - Trading symbol
   * @returns {Promise<Object>} - 24hr ticker data
   */
  async get24hrTicker(symbol) {
    return this.publicRequest('GET', '/fapi/v1/ticker/24hr', { symbol });
  }

  /**
   * Get kline/candlestick data for a symbol
   * @param {string} symbol - Trading symbol
   * @param {string} interval - Kline interval (1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M)
   * @param {Object} options - Optional parameters
   * @param {number} options.startTime - Start time in milliseconds
   * @param {number} options.endTime - End time in milliseconds
   * @param {number} options.limit - Number of klines to retrieve (default: 500, max: 1500)
   * @returns {Promise<Array>} - Array of kline data
   */
  async getKlines(symbol, interval, options = {}) {
    const params = {
      symbol,
      interval,
      ...options
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    return await this.publicRequest('GET', '/fapi/v1/klines', params);
  }

  /**
   * Get order book for a symbol
   * @param {string} symbol - Trading symbol
   * @param {number} limit - Number of orders to return (default: 100)
   * @returns {Promise<Object>} - Order book data
   */
  async getOrderBook(symbol, limit = 100) {
    return this.publicRequest('GET', '/fapi/v1/depth', { symbol, limit });
  }

  // ===== Account Methods =====

  /**
   * Get account balance
   * @returns {Promise<Array>} - Array of balance objects
   */
  async getBalance() {
    return this.signedRequest('GET', '/fapi/v2/balance');
  }

  /**
   * Get USDT available balance
   * @returns {Promise<number>} - Available USDT balance
   */
  async getUsdtBalance() {
    const balances = await this.getBalance();
    const usdt = balances.find(x => x.asset === 'USDT');
    return parseFloat(usdt?.availableBalance || '0');
  }

  /**
   * Get available balance for a specific asset on futures
   * @param {string} asset - Asset symbol (e.g., 'USDT', 'BTC')
   * @returns {Promise<number>} - Available balance for the asset
   */
  async getAvailableBalance(asset = 'USDT') {
    const balances = await this.getBalance();
    const assetBalance = balances.find(x => x.asset === asset);
    return parseFloat(assetBalance?.availableBalance || '0');
  }

  /**
   * Get total wallet balance for a specific asset
   * @param {string} asset - Asset symbol (e.g., 'USDT', 'BTC')
   * @returns {Promise<number>} - Total wallet balance for the asset
   */
  async getTotalBalance(asset = 'USDT') {
    const balances = await this.getBalance();
    const assetBalance = balances.find(x => x.asset === asset);
    return parseFloat(assetBalance?.balance || '0');
  }

  /**
   * Get cross wallet balance for a specific asset
   * @param {string} asset - Asset symbol (e.g., 'USDT', 'BTC')
   * @returns {Promise<number>} - Cross wallet balance for the asset
   */
  async getCrossWalletBalance(asset = 'USDT') {
    const balances = await this.getBalance();
    const assetBalance = balances.find(x => x.asset === asset);
    return parseFloat(assetBalance?.crossWalletBalance || '0');
  }

  /**
   * Get account information
   * @returns {Promise<Object>} - Account information
   */
  async getAccountInfo() {
    return this.signedRequest('GET', '/fapi/v2/account');
  }

  /**
   * Get positions for all symbols or specific symbol
   * @param {string} symbol - Optional symbol to filter positions
   * @returns {Promise<Array>} - Array of position objects
   */
  async getPositions(symbol = null) {
    const params = symbol ? { symbol } : {};
    return this.signedRequest('GET', '/fapi/v2/positionRisk', params);
  }

  // ===== Position Methods =====

  /**
   * Get current position amount for a symbol
   * @param {string} symbol - Trading symbol
   * @returns {Promise<number>} - Position amount (>0 long, <0 short, 0 none)
   */
  async getPositionAmount(symbol) {
    const positions = await this.getPositions(symbol);
    const position = positions.find(p => p.symbol === symbol);
    if (!position) return 0;
    return parseFloat(position.positionAmt || '0');
  }

  /**
   * Check trade details for a specific symbol
   * Returns position information including size, entry price, mark price, margin, and liquidation price
   * @param {string} symbol - Trading symbol
   * @returns {Promise<Object>} - Trade details object
   */
  async checkTrade(symbol) {
    try {
      const [positions, accountInfo] = await Promise.all([
        this.getPositions(symbol),
        this.getAccountInfo()
      ]);

      const position = positions.find(p => p.symbol === symbol);
      
      if (!position || parseFloat(position.positionAmt || position.pa || '0') === 0) {
        return {
          symbol: symbol,
          size: '0',
          entryPrice: '0',
          markPrice: '0',
          margin: '0',
          liquidationPrice: '0',
          side: 'NONE',
          leverage: '0',
          hasPosition: false
        };
      }

      const positionAmt = parseFloat(position.positionAmt || position.pa || '0');
      const isLong = positionAmt > 0;
      const side = isLong ? 'BUY' : 'SELL';
      const size = Math.abs(positionAmt);
      
      // Get current mark price
      const markPrice = await this.getLastPrice(symbol);
      
      // Calculate margin used (this is an approximation)
      const notionalValue = size * markPrice;
      const leverage = parseFloat(position.leverage || '1');
      const marginUsed = notionalValue / leverage;
      
      // Get liquidation price from position data
      const liquidationPrice = parseFloat(position.liquidationPrice || '0');
      
      return {
        symbol: symbol,
        size: `${size.toFixed(2)} ${symbol.replace('USDT', '')}`,
        entryPrice: parseFloat(position.entryPrice || '0').toFixed(5),
        markPrice: markPrice.toFixed(5),
        margin: `${marginUsed.toFixed(2)} USDT (Cross)`,
        liquidationPrice: liquidationPrice > 0 ? liquidationPrice.toFixed(5) : '0',
        side: side,
        leverage: `${leverage}x`,
        hasPosition: true,
        positionAmt: positionAmt,
        notionalValue: notionalValue,
        unrealizedPnl: parseFloat(position.unRealizedProfit || position.unrealizedPnl || '0') || 0
      };
      
    } catch (error) {
      console.error('Error checking trade:', error.message);
      return {
        symbol: symbol,
        size: '0',
        entryPrice: '0',
        markPrice: '0',
        margin: '0',
        liquidationPrice: '0',
        side: 'NONE',
        leverage: '0',
        hasPosition: false,
        error: error.message
      };
    }
  }

  // ===== Trading Methods =====

  /**
   * Set leverage for a symbol
   * @param {string} symbol - Trading symbol
   * @param {number} leverage - Leverage value (1-125)
   * @returns {Promise<Object>} - API response
   */
  async setLeverage(symbol, leverage) {
    return this.signedRequest('POST', '/fapi/v1/leverage', {}, { symbol, leverage });
  }

  /**
   * Place a market order
   * @param {string} symbol - Trading symbol
   * @param {string} side - 'BUY' or 'SELL'
   * @param {number} quantity - Order quantity
   * @param {boolean} reduceOnly - Whether this is a reduce-only order
   * @returns {Promise<Object>} - Order response with filledQty
   */
  async placeMarketOrder(symbol, side, quantity, reduceOnly = false) {
    const body = {
      symbol,
      side,
      type: 'MARKET',
      positionSide: 'BOTH',
      quantity: quantity.toString(),
      reduceOnly: reduceOnly ? 'true' : 'false',
      newOrderRespType: 'RESULT',
    };
    
    const response = await this.signedRequest('POST', '/fapi/v1/order', {}, body);
    
    // Extract filled quantity
    const filledQty = parseFloat(
      (response && (response.executedQty ?? response.cumQty ?? response.origQty)) ?? quantity
    );

    return { ...response, filledQty };
  }

  /**
   * Place a market order with smart precision handling
   * @param {string} symbol - Trading symbol
   * @param {string} side - 'BUY' or 'SELL'
   * @param {number} quantity - Order quantity
   * @param {boolean} reduceOnly - Whether this is a reduce-only order
   * @returns {Promise<Object>} - Order response with filledQty
   */
  async placeMarketOrderSmart(symbol, side, quantity, reduceOnly = false) {
    try {
      // First try with smart precision
      const smartQuantity = precisionManager.getSmartQuantity(symbol, quantity);
      console.log(`🎯 Using smart precision for ${symbol}: ${smartQuantity}`);
      return await this.placeMarketOrder(symbol, side, smartQuantity, reduceOnly);
    } catch (error) {
      // If precision error, handle it automatically
      if (error.response && error.response.data && 
          error.response.data.code === -1111 && 
          error.response.data.msg.includes('Precision is over the maximum')) {
        
        console.log(`🔧 Precision error detected for ${symbol}, trying different precisions...`);
        
        // Try to auto-detect precision from exchange info first
        try {
          const exchangeInfo = await this.getExchangeInfo();
          const detectedPrecision = precisionManager.detectPrecisionFromExchangeInfo(exchangeInfo, symbol);
          console.log(`🔍 Auto-detected precision for ${symbol}: ${detectedPrecision} decimal places`);
          precisionManager.setPrecision(symbol, detectedPrecision);
          
          // Try with detected precision
          const detectedQuantity = precisionManager.getSmartQuantity(symbol, quantity);
          console.log(`🎯 Trying with detected precision: ${detectedQuantity}`);
          return await this.placeMarketOrder(symbol, side, detectedQuantity, reduceOnly);
        } catch (detectionError) {
          console.log(`⚠️  Auto-detection failed, falling back to precision trial...`);
        }
        
        return await precisionManager.handlePrecisionError(symbol, quantity, async (roundedQuantity) => {
          return await this.placeMarketOrder(symbol, side, roundedQuantity, reduceOnly);
        });
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Place a limit order
   * @param {string} symbol - Trading symbol
   * @param {string} side - 'BUY' or 'SELL'
   * @param {number} quantity - Order quantity
   * @param {number} price - Order price
   * @param {string} timeInForce - 'GTC', 'IOC', or 'FOK'
   * @param {boolean} reduceOnly - Whether this is a reduce-only order
   * @returns {Promise<Object>} - Order response
   */
  async placeLimitOrder(symbol, side, quantity, price, timeInForce = 'GTC', reduceOnly = false) {
    const body = {
      symbol,
      side,
      type: 'LIMIT',
      positionSide: 'BOTH',
      quantity: quantity.toString(),
      price: price.toString(),
      timeInForce,
      reduceOnly: reduceOnly ? 'true' : 'false',
      newOrderRespType: 'RESULT',
    };
    
    return this.signedRequest('POST', '/fapi/v1/order', {}, body);
  }

  /**
   * Close a position using market order
   * @param {string} symbol - Trading symbol
   * @param {number} quantity - Quantity to close (optional, will use current position if not provided)
   * @param {string} side - 'BUY' or 'SELL' (optional, will auto-detect if not provided)
   * @returns {Promise<Object>} - Order response
   */
  async closePosition(symbol, quantity = null, side = null) {
    let closeQuantity = quantity;
    let closeSide = side;

    if (!closeQuantity || !closeSide) {
      const positionAmount = await this.getPositionAmount(symbol);
      if (positionAmount === 0) {
        throw new Error('No position to close');
      }
      
      if (!closeQuantity) {
        closeQuantity = Math.abs(positionAmount);
      }
      
      if (!closeSide) {
        closeSide = positionAmount > 0 ? 'SELL' : 'BUY';
      }
    }

    return this.placeMarketOrder(symbol, closeSide, closeQuantity, true);
  }

  /**
   * Close position with exact quantity (prevents dust)
   * @param {string} symbol - Trading symbol
   * @param {number} exactQuantity - Exact quantity to close
   * @param {string} side - 'BUY' or 'SELL'
   * @returns {Promise<Object>} - Order response
   */
  async closePositionExact(symbol, exactQuantity, side) {
    return this.placeMarketOrder(symbol, side, exactQuantity, true);
  }

  /**
   * Cancel an order
   * @param {string} symbol - Trading symbol
   * @param {number} orderId - Order ID to cancel
   * @returns {Promise<Object>} - API response
   */
  async cancelOrder(symbol, orderId) {
    return this.signedRequest('DELETE', '/fapi/v1/order', {}, { symbol, orderId });
  }

  /**
   * Cancel all open orders for a symbol
   * @param {string} symbol - Trading symbol
   * @returns {Promise<Object>} - API response
   */
  async cancelAllOrders(symbol) {
    return this.signedRequest('DELETE', '/fapi/v1/allOpenOrders', {}, { symbol });
  }

  /**
   * Get open orders
   * @param {string} symbol - Trading symbol (optional)
   * @returns {Promise<Array>} - Array of open orders
   */
  async getOpenOrders(symbol = null) {
    const params = symbol ? { symbol } : {};
    return this.signedRequest('GET', '/fapi/v1/openOrders', params);
  }

  /**
   * Get order by ID
   * @param {string} symbol - Trading symbol
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} - Order information
   */
  async getOrder(symbol, orderId) {
    return this.signedRequest('GET', '/fapi/v1/order', { symbol, orderId });
  }

  // ===== Utility Methods =====

  /**
   * Calculate maximum position size using USDT available balance
   * @param {string} symbol - Trading symbol
   * @param {number} leverage - Leverage to use
   * @param {number} safetyBuffer - Safety buffer (0-1, default 0.98)
   * @returns {Promise<Object>} - Calculated position info
   */
  async calculateMaxPosition(symbol, leverage, safetyBuffer = 0.98) {
    const [exchangeInfo, balance, price] = await Promise.all([
      this.getExchangeInfo(),
      this.getAvailableBalance('USDT'), // Always use USDT available for trading
      this.getLastPrice(symbol)
    ]);

    const symbolInfo = exchangeInfo.symbols.find(s => s.symbol === symbol);
    if (!symbolInfo) {
      throw new Error(`Symbol not found: ${symbol}`);
    }

    const { stepSize, minNotional } = extractFilters(symbolInfo);
    const targetNotional = balance * leverage * safetyBuffer;
    const quantity = qtyFromNotional(targetNotional, price, stepSize, minNotional);
    const effectiveNotional = quantity * price;

    return {
      balance,
      price,
      leverage,
      targetNotional,
      quantity,
      effectiveNotional,
      stepSize,
      minNotional
    };
  }

  /**
   * Execute a full balance trade (open and close after delay)
   * @param {string} symbol - Trading symbol
   * @param {string} side - 'BUY' or 'SELL'
   * @param {number} leverage - Leverage to use
   * @param {number} holdMs - Time to hold position in milliseconds
   * @param {number} safetyBuffer - Safety buffer (0-1)
   * @returns {Promise<Object>} - Trade results
   */
  async executeFullBalanceTrade(symbol, side, leverage, holdMs, safetyBuffer = 0.98) {
    // Set leverage first
    await this.setLeverage(symbol, leverage);

    // Calculate position size
    const positionInfo = await this.calculateMaxPosition(symbol, leverage, safetyBuffer);
    
    if (positionInfo.quantity <= 0) {
      throw new Error('Calculated quantity is <= 0');
    }
    
    if (positionInfo.effectiveNotional < parseFloat(positionInfo.minNotional || '0')) {
      throw new Error(`Effective notional (${positionInfo.effectiveNotional.toFixed(4)}) is below minNotional (${positionInfo.minNotional})`);
    }

    // Open position
    const openResult = await this.placeMarketOrder(symbol, side, positionInfo.quantity, false);
    
    // Wait
    console.log(`Holding position for ${holdMs / 1000} seconds...`);
    await sleep(holdMs);

    // Close position with exact quantity
    const closeSide = side === 'BUY' ? 'SELL' : 'BUY';
    const closeResult = await this.closePositionExact(symbol, openResult.filledQty, closeSide);

    // Check remaining position
    const remainingPosition = await this.getPositionAmount(symbol);

    return {
      open: openResult,
      close: closeResult,
      remainingPosition,
      positionInfo
    };
  }
}
