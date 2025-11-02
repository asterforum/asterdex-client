/**
 * TypeScript definitions for AsterDEX API Client
 */

export interface AsterdexConfig {
  apiKey: string;
  apiSecret: string;
  baseURL?: string;
  recvWindow?: number;
  timeout?: number;
}

export interface SymbolFilters {
  stepSize: string;
  minNotional: string;
  tickSize: string;
}

export interface OrderResponse {
  orderId: number;
  symbol: string;
  status: string;
  clientOrderId: string;
  price: string;
  avgPrice: string;
  origQty: string;
  executedQty: string;
  cumQty: string;
  cumQuote: string;
  timeInForce: string;
  type: string;
  reduceOnly: boolean;
  closePosition: boolean;
  side: string;
  positionSide: string;
  stopPrice: string;
  workingType: string;
  priceProtect: boolean;
  origType: string;
  time: number;
  updateTime: number;
  filledQty?: number;
}

export interface Balance {
  accountId: string;
  asset: string;
  balance: string;
  crossWalletBalance: string;
  crossUnPnl: string;
  availableBalance: string;
  maxWithdrawAmount: string;
  marginAvailable: boolean;
  updateTime: number;
}

export interface AccountInfo {
  feeTier: number;
  canTrade: boolean;
  canDeposit: boolean;
  canWithdraw: boolean;
  updateTime: number;
  totalInitialMargin: string;
  totalMaintMargin: string;
  totalWalletBalance: string;
  totalUnrealizedProfit: string;
  totalMarginBalance: string;
  totalPositionInitialMargin: string;
  totalOpenOrderInitialMargin: string;
  totalCrossWalletBalance: string;
  totalCrossUnPnl: string;
  availableBalance: string;
  maxWithdrawAmount: string;
  assets: AssetInfo[];
  positions: PositionInfo[];
}

export interface AssetInfo {
  asset: string;
  walletBalance: string;
  unrealizedProfit: string;
  marginBalance: string;
  maintMargin: string;
  initialMargin: string;
  positionInitialMargin: string;
  openOrderInitialMargin: string;
  crossWalletBalance: string;
  crossUnPnl: string;
  availableBalance: string;
  maxWithdrawAmount: string;
  marginAvailable: boolean;
  updateTime: number;
}

export interface PositionInfo {
  symbol: string;
  initialMargin: string;
  maintMargin: string;
  unrealizedProfit: string;
  positionInitialMargin: string;
  openOrderInitialMargin: string;
  leverage: string;
  isolated: boolean;
  entryPrice: string;
  maxNotional: string;
  positionSide: string;
  positionAmt: string;
  updateTime: number;
}

export interface Position {
  symbol: string;
  initialMargin: string;
  maintMargin: string;
  unrealizedPnl: string;
  positionInitialMargin: string;
  openOrderInitialMargin: string;
  leverage: string;
  isolated: boolean;
  entryPrice: string;
  maxNotional: string;
  bidNotional: string;
  askNotional: string;
  positionSide: string;
  positionAmt: string;
  updateTime: number;
}

export interface PositionInfo {
  balance: number;
  price: number;
  leverage: number;
  targetNotional: number;
  quantity: number;
  effectiveNotional: number;
  stepSize: string;
  minNotional: string;
}

export interface TradeResult {
  open: OrderResponse;
  close: OrderResponse;
  remainingPosition: number;
  positionInfo: PositionInfo;
}

export declare class AsterdexClient {
  constructor(config: AsterdexConfig);

  // Market Data Methods
  getExchangeInfo(): Promise<any>;
  getLastPrice(symbol: string): Promise<number>;
  get24hrTicker(symbol: string): Promise<any>;
  getKlines(symbol: string, interval: string, options?: {
    startTime?: number;
    endTime?: number;
    limit?: number;
  }): Promise<Array<Array<number | string>>>;
  getOrderBook(symbol: string, limit?: number): Promise<any>;

  // Account Methods
  getBalance(): Promise<Balance[]>;
  getUsdtBalance(): Promise<number>;
  getAvailableBalance(asset?: string): Promise<number>;
  getTotalBalance(asset?: string): Promise<number>;
  getCrossWalletBalance(asset?: string): Promise<number>;
  getAccountInfo(): Promise<AccountInfo>;

  // Position Methods
  getPositions(symbol?: string): Promise<Position[]>;
  getPositionAmount(symbol: string): Promise<number>;
  checkTrade(symbol: string): Promise<{
    symbol: string;
    size: string;
    entryPrice: string;
    markPrice: string;
    margin: string;
    liquidationPrice: string;
    side: string;
    leverage: string;
    hasPosition: boolean;
    positionAmt?: number;
    notionalValue?: number;
    unrealizedPnl?: number;
    error?: string;
  }>;

  // Trading Methods
  setLeverage(symbol: string, leverage: number): Promise<any>;
  placeMarketOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, reduceOnly?: boolean): Promise<OrderResponse>;
  placeLimitOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, price: number, timeInForce?: string, reduceOnly?: boolean): Promise<OrderResponse>;
  closePosition(symbol: string, quantity?: number, side?: 'BUY' | 'SELL'): Promise<OrderResponse>;
  closePositionExact(symbol: string, exactQuantity: number, side: 'BUY' | 'SELL'): Promise<OrderResponse>;
  cancelOrder(symbol: string, orderId: number): Promise<any>;
  cancelAllOrders(symbol: string): Promise<any>;
  getOpenOrders(symbol?: string): Promise<OrderResponse[]>;
  getOrder(symbol: string, orderId: number): Promise<OrderResponse>;

  // Utility Methods
  calculateMaxPosition(symbol: string, leverage: number, safetyBuffer?: number): Promise<PositionInfo>;
  executeFullBalanceTrade(symbol: string, side: 'BUY' | 'SELL', leverage: number, holdMs: number, safetyBuffer?: number): Promise<TradeResult>;
}

// Utility functions
export declare function createHmacSignature(secret: string, payload: string): string;
export declare function roundToStepFloor(qty: number, stepSize: string): number;
export declare function ensureMinNotional(qty: number, price: number, minNotional: string, stepSize: string): number;
export declare function qtyFromNotional(notionalUsd: number, price: number, stepSize: string, minNotional: string): number;
export declare function extractFilters(symbolInfo: any): SymbolFilters;
export declare function sleep(ms: number): Promise<void>;
