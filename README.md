# AsterDEX API Client

Official Node.js client for the AsterDEX Futures Trading API. Built with TypeScript support and ES modules.

## Features

- 🚀 **Full API Coverage** - Complete futures trading API implementation
- 📦 **ES Modules** - Modern JavaScript with import/export syntax
- 🔒 **Type Safety** - Full TypeScript definitions included
- ⚡ **High Performance** - Optimized for low latency trading
- 🛡️ **Error Handling** - Comprehensive error handling and validation
- 📊 **Utility Functions** - Built-in helpers for position sizing and risk management
- 💰 **Balance Management** - Always uses USDT available balance for trading calculations
- 🎯 **Smart Precision** - Automatically handles quantity precision errors and learns optimal values
- 📊 **Step Size Database** - Comprehensive database of precision requirements for 72+ symbols

## Installation

```bash
npm install asterdex-client
```

## Quick Start

```javascript
import { AsterdexClient } from 'asterdex-client';

// Initialize client
const client = new AsterdexClient({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret'
});

// Get account balance (always use USDT available for trading)
const usdtAvailable = await client.getAvailableBalance('USDT');
const usdtTotal = await client.getTotalBalance('USDT');
const usdtCross = await client.getCrossWalletBalance('USDT');
console.log(`USDT Available: ${usdtAvailable} (for trading)`);
console.log(`USDT Total: ${usdtTotal}`);
console.log(`USDT Cross Wallet: ${usdtCross}`);

// Set leverage and place a market order with smart precision
await client.setLeverage('BTCUSDT', 10);
const order = await client.placeMarketOrderSmart('BTCUSDT', 'BUY', 0.01);
console.log('Order placed:', order);
```

## Configuration

```javascript
const client = new AsterdexClient({
  apiKey: 'your-api-key',           // Required: Your API key
  apiSecret: 'your-api-secret',     // Required: Your API secret
  baseURL: 'https://fapi.asterdex.com', // Optional: API base URL
  recvWindow: 5000,                 // Optional: Request timeout window
  timeout: 20000                    // Optional: HTTP timeout
});
```

## Core Methods

### Account Management

```javascript
// Get account balance (always use USDT available for trading)
const balances = await client.getBalance();
const usdtAvailable = await client.getAvailableBalance('USDT'); // Use this for trading
const usdtTotal = await client.getTotalBalance('USDT');
const usdtCross = await client.getCrossWalletBalance('USDT');

// Get comprehensive account information
const accountInfo = await client.getAccountInfo();
console.log('Total Balance:', accountInfo.totalWalletBalance);
console.log('Available Balance:', accountInfo.availableBalance);
console.log('Can Trade:', accountInfo.canTrade);
console.log('Fee Tier:', accountInfo.feeTier);

// Get all positions
const positions = await client.getPositions();
const activePositions = positions.filter(pos => parseFloat(pos.positionAmt) !== 0);
console.log('Active positions:', activePositions.length);

// Get positions for specific symbol
const btcPositions = await client.getPositions('BTCUSDT');
console.log('BTC positions:', btcPositions);
```

### Balance Management Best Practices

**Always use USDT available balance for trading calculations:**

```javascript
// ✅ CORRECT - Use available balance for trading
const usdtAvailable = await client.getAvailableBalance('USDT');
const maxPositionSize = usdtAvailable * leverage * safetyBuffer;

// ❌ AVOID - Don't use total balance (includes locked funds)
const usdtTotal = await client.getTotalBalance('USDT');
```

**Why use available balance?**
- Available balance = funds you can actually trade with
- Total balance = includes locked funds from open positions
- Cross wallet balance = shared across all positions in cross-margin mode

### Smart Precision System

The client includes an intelligent precision handling system that automatically manages quantity precision errors:

```javascript
// ✅ RECOMMENDED - Use smart precision for automatic error handling
const order = await client.placeMarketOrderSmart('BTCUSDT', 'BUY', 0.123456789);

// ❌ BASIC - May fail with precision errors
const order = await client.placeMarketOrder('BTCUSDT', 'BUY', 0.123456789);
```

**How it works:**
- Automatically detects precision errors (code -1111)
- Uses comprehensive step size database for 72+ symbols
- Tries different precision values (4, 3, 2, 1, 0 decimal places)
- Saves working precision values for future use
- Caches precision settings in `.precision-cache.json`

### Step Size Database

The client includes a comprehensive database of step sizes and precision requirements:

```javascript
import { getPrecisionFromDatabase, getStepSizeFromDatabase, isSymbolInDatabase } from "asterdex-client";

// Check if symbol is in database
const isKnown = isSymbolInDatabase("BTCUSDT"); // true

// Get precision for any symbol
const precision = getPrecisionFromDatabase("ASTERUSDT"); // 2

// Get step size for any symbol
const stepSize = getStepSizeFromDatabase("ETHUSDT"); // "0.001"

// Get all symbols with 3 decimal places
const btcLike = getSymbolsByPrecision(3); // ["BTCUSDT", "ETHUSDT", ...]
```

**Database Coverage:**
- **72+ symbols** with known precision requirements
- **34% coverage** of exchange symbols
- **Automatic fallback** for unknown symbols
- **Real-time precision detection** from exchange info

### Position Management

```javascript
// Get all positions
const positions = await client.getPositions();

// Get position for specific symbol
const btcPosition = await client.getPositions('BTCUSDT');

// Get current position amount
const positionAmount = await client.getPositionAmount('BTCUSDT');
// Returns: >0 for long, <0 for short, 0 for no position

// Check detailed trade information
const tradeInfo = await client.checkTrade('ASTERUSDT');
console.log('Trade Details:', {
  symbol: tradeInfo.symbol,
  size: tradeInfo.size,           // "1,206.69 ASTER"
  entryPrice: tradeInfo.entryPrice, // "1.12049"
  markPrice: tradeInfo.markPrice,   // "1.12060"
  margin: tradeInfo.margin,         // "270.44 USDT (Cross)"
  liquidationPrice: tradeInfo.liquidationPrice, // "0.38787" or "0" if small
  side: tradeInfo.side,            // "BUY" or "SELL"
  leverage: tradeInfo.leverage,     // "5x"
  hasPosition: tradeInfo.hasPosition // true/false
});
```

### Trading Operations

```javascript
// Set leverage (must be done before placing orders)
await client.setLeverage('BTCUSDT', 10);

// Place market order
const order = await client.placeMarketOrder('BTCUSDT', 'BUY', 0.01);

// Place limit order
const limitOrder = await client.placeLimitOrder(
  'BTCUSDT', 
  'BUY', 
  0.01, 
  50000,  // price
  'GTC'   // time in force
);

// Close position
await client.closePosition('BTCUSDT');

// Close with exact quantity (prevents dust)
await client.closePositionExact('BTCUSDT', 0.01, 'SELL');
```

### Order Management

```javascript
// Get open orders
const openOrders = await client.getOpenOrders();

// Get specific order
const order = await client.getOrder('BTCUSDT', 12345);

// Cancel order
await client.cancelOrder('BTCUSDT', 12345);

// Cancel all orders for symbol
await client.cancelAllOrders('BTCUSDT');
```

### Market Data

```javascript
// Get last price
const price = await client.getLastPrice('BTCUSDT');

// Get 24hr ticker
const ticker = await client.get24hrTicker('BTCUSDT');

// Get candlestick/kline data
const klines = await client.getKlines('ASTERUSDT', '1h', { limit: 24 });
klines.forEach(kline => {
  const [openTime, open, high, low, close, volume] = kline;
  console.log(`Open: $${open} | High: $${high} | Low: $${low} | Close: $${close}`);
});

// Get klines for specific time range
const startTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
const endTime = Date.now();
const historicalKlines = await client.getKlines('BTCUSDT', '4h', {
  startTime,
  endTime,
  limit: 6 // 6 x 4h = 24 hours
});

// Get order book
const orderBook = await client.getOrderBook('BTCUSDT', 100);

// Get exchange info (symbols, filters, etc.)
const exchangeInfo = await client.getExchangeInfo();
```

## Advanced Features

### Full Balance Trading

Execute trades using your full balance with automatic position sizing:

```javascript
// Execute a full balance long trade
const result = await client.executeFullBalanceTrade(
  'BTCUSDT',  // symbol
  'BUY',      // side
  10,         // leverage
  15000,      // hold for 15 seconds
  0.98        // safety buffer
);

console.log('Trade completed:', result);
```

### Position Sizing

Calculate optimal position sizes based on your balance and risk:

```javascript
// Calculate maximum position size
const positionInfo = await client.calculateMaxPosition('BTCUSDT', 10, 0.98);

console.log('Max quantity:', positionInfo.quantity);
console.log('Effective notional:', positionInfo.effectiveNotional);
```

### Utility Functions

```javascript
import { 
  roundToStepFloor, 
  qtyFromNotional, 
  extractFilters 
} from 'asterdex-client';

// Round quantity to valid step size
const validQty = roundToStepFloor(0.123456, '0.001');

// Convert USD notional to quantity
const quantity = qtyFromNotional(1000, 50000, '0.001', '5');

// Extract symbol filters
const filters = extractFilters(symbolInfo);
```

## Complete Examples

### Bitcoin Short with 15x Leverage

```javascript
import { AsterdexClient } from 'asterdex-client';

const client = new AsterdexClient({
  apiKey: process.env.ASTERDEX_API_KEY,
  apiSecret: process.env.ASTERDEX_API_SECRET
});

async function bitcoinShort15x() {
  try {
    // Get available balance
    const usdtAvailable = await client.getAvailableBalance('USDT');
    console.log(`Available Balance: $${usdtAvailable}`);
    
    // Set leverage to 15x
    await client.setLeverage('BTCUSDT', 15);
    console.log('Leverage set to 15x');
    
    // Get current price
    const btcPrice = await client.getLastPrice('BTCUSDT');
    console.log(`BTC Price: $${btcPrice}`);
    
    // Calculate position size (use 10% of balance for safety)
    const riskAmount = usdtAvailable * 0.1;
    const leverage = 15;
    const targetNotional = riskAmount * leverage;
    const btcQuantity = Math.floor((targetNotional / btcPrice) * 1000) / 1000; // Round to 0.001
    
    console.log(`Position Size: ${btcQuantity} BTC`);
    
    // Open SHORT position (SELL to open short)
    const shortOrder = await client.placeMarketOrder('BTCUSDT', 'SELL', btcQuantity);
    console.log('SHORT opened:', shortOrder);
    
    // Wait briefly
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Close SHORT position (BUY to close short)
    await client.closePositionExact('BTCUSDT', shortOrder.filledQty, 'BUY');
    console.log('SHORT closed');
    
  } catch (error) {
    console.error('Trade failed:', error.message);
  }
}

bitcoinShort15x();
```

### More Examples Available

Comprehensive examples are available in the [GitHub repository](https://github.com/asterdex/asterdex-client-js/tree/main/examples):

**Core Examples:**
- **`basic-usage.js`** - Basic API functionality and balance checking
- **`balance-check.js`** - Comprehensive balance analysis
- **`account-info-example.js`** - Detailed account information

**Trading Examples:**
- **`bitcoin-short-safe.js`** - Safe Bitcoin short with 10% risk
- **`bitcoin-short-complete.js`** - Full balance Bitcoin short
- **`bitcoin-short-15x.js`** - Advanced Bitcoin short with monitoring
- **`aster-long-simple.js`** - Basic ASTER long position
- **`aster-long-10x.js`** - ASTER long with 10x leverage
- **`aster-long-custom.js`** - Customizable ASTER long

**Advanced Examples:**
- **`trading-strategy.js`** - Complete trading framework
- **`multi-symbol-trading.js`** - Trading multiple symbols
- **`get-klines-example.js`** - Candlestick data retrieval
- **`technical-analysis-example.js`** - Technical analysis patterns

To use the examples, clone the repository:
```bash
git clone https://github.com/asterdex/asterdex-client-js.git
cd asterdex-client-js
npm install
node examples/bitcoin-short-safe.js
```

### Risk Management

```javascript
async function riskManagedTrade() {
  try {
    // Check current positions
    const positions = await client.getPositions();
    const btcPosition = positions.find(p => p.symbol === 'BTCUSDT');
    
    if (btcPosition && parseFloat(btcPosition.positionAmt) !== 0) {
      console.log('Position already exists, closing first...');
      await client.closePosition('BTCUSDT');
    }
    
    // Set conservative leverage
    await client.setLeverage('BTCUSDT', 5);
    
    // Use only 25% of balance
    const balance = await client.getUsdtBalance();
    const maxRisk = balance * 0.25;
    
    const positionInfo = await client.calculateMaxPosition('BTCUSDT', 5, 0.95);
    const riskAdjustedQty = Math.min(positionInfo.quantity, maxRisk / positionInfo.price);
    
    // Place order
    const order = await client.placeMarketOrder('BTCUSDT', 'BUY', riskAdjustedQty);
    console.log('Risk-managed trade executed:', order);
    
  } catch (error) {
    console.error('Risk-managed trade failed:', error.message);
  }
}
```

## Error Handling

The client includes comprehensive error handling:

```javascript
try {
  const order = await client.placeMarketOrder('BTCUSDT', 'BUY', 0.01);
} catch (error) {
  if (error.response) {
    // API error response
    console.error('API Error:', error.response.data);
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { AsterdexClient, OrderResponse, Balance } from 'asterdex-client';

const client = new AsterdexClient({
  apiKey: 'your-key',
  apiSecret: 'your-secret'
});

// TypeScript will provide full intellisense and type checking
const order: OrderResponse = await client.placeMarketOrder('BTCUSDT', 'BUY', 0.01);
const balances: Balance[] = await client.getBalance();
```

## API Reference

### AsterdexClient

#### Constructor
- `new AsterdexClient(config: AsterdexConfig)`

#### Account Methods
- `getBalance(): Promise<Balance[]>`
- `getUsdtBalance(): Promise<number>`
- `getAvailableBalance(asset?: string): Promise<number>`
- `getTotalBalance(asset?: string): Promise<number>`
- `getCrossWalletBalance(asset?: string): Promise<number>`
- `getAccountInfo(): Promise<any>`

#### Position Methods
- `getPositions(symbol?: string): Promise<Position[]>`
- `getPositionAmount(symbol: string): Promise<number>`

#### Trading Methods
- `setLeverage(symbol: string, leverage: number): Promise<any>`
- `placeMarketOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, reduceOnly?: boolean): Promise<OrderResponse>`
- `placeLimitOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, price: number, timeInForce?: string, reduceOnly?: boolean): Promise<OrderResponse>`
- `closePosition(symbol: string, quantity?: number, side?: 'BUY' | 'SELL'): Promise<OrderResponse>`
- `closePositionExact(symbol: string, exactQuantity: number, side: 'BUY' | 'SELL'): Promise<OrderResponse>`

#### Order Management
- `cancelOrder(symbol: string, orderId: number): Promise<any>`
- `cancelAllOrders(symbol: string): Promise<any>`
- `getOpenOrders(symbol?: string): Promise<OrderResponse[]>`
- `getOrder(symbol: string, orderId: number): Promise<OrderResponse>`

#### Market Data
- `getExchangeInfo(): Promise<any>`
- `getLastPrice(symbol: string): Promise<number>`
- `get24hrTicker(symbol: string): Promise<any>`
- `getOrderBook(symbol: string, limit?: number): Promise<any>`

#### Utility Methods
- `calculateMaxPosition(symbol: string, leverage: number, safetyBuffer?: number): Promise<PositionInfo>`
- `executeFullBalanceTrade(symbol: string, side: 'BUY' | 'SELL', leverage: number, holdMs: number, safetyBuffer?: number): Promise<TradeResult>`

## Requirements

- Node.js >= 16.0.0
- ES Modules support

## Dependencies

- `axios` - HTTP client
- `crypto` - Cryptographic functions (Node.js built-in)
- `querystring` - URL query string parsing (Node.js built-in)

## License

MIT

## Support

- GitHub Issues: [https://github.com/asterdex/asterdex-client-js/issues](https://github.com/asterdex/asterdex-client-js/issues)
- Documentation: [https://docs.asterdex.com](https://docs.asterdex.com)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
