/**
 * AsterDEX API Client for Node.js
 * Official client for AsterDEX Futures Trading API
 * 
 * Features:
 * - Complete futures trading API coverage
 * - Balance checking (available, total, cross wallet)
 * - Position management
 * - Order management
 * - Market data
 * - Risk management utilities
 */

export { AsterdexClient } from './src/client.js';
export * from './src/utils.js';
export { PrecisionManager, precisionManager } from './src/precision-manager.js';
export * from './src/step-size-database.js';

// Re-export commonly used utilities for convenience
export { 
  createHmacSignature,
  roundToStepFloor,
  ensureMinNotional,
  qtyFromNotional,
  extractFilters,
  sleep,
  safeParseFloat,
  safeFormatNumber
} from './src/utils.js';
