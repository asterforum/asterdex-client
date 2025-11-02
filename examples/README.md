# AsterDEX API Client Examples

This directory contains practical examples showing how to use the AsterDEX API client for trading scenarios.

## 📁 Available Examples

### Core Examples

#### 1. **Basic Usage** (`basic-usage.js`)
- Basic API functionality
- Account balances and market data
- Position sizing calculations
- **Run**: `node examples/basic-usage.js`

#### 2. **Balance Check** (`balance-check.js`)
- Comprehensive balance checking
- All asset balances
- Trading readiness assessment
- Cross margin analysis
- **Run**: `node examples/balance-check.js`

#### 3. **Account Info** (`account-info-example.js`)
- Detailed account information
- Position overview
- Balance breakdown
- **Run**: `node examples/account-info-example.js`

### Trading Examples

#### 4. **Bitcoin Short Examples**

##### **Safe Short** (`bitcoin-short-safe.js`)
- Conservative Bitcoin short with 15x leverage
- Uses only 10% of available balance
- Proper quantity rounding
- **Run**: `node examples/bitcoin-short-safe.js`

##### **Complete Short** (`bitcoin-short-complete.js`)
- Full Bitcoin short with 15x leverage
- Uses full available balance
- Position monitoring
- Complete trade lifecycle
- **Run**: `node examples/bitcoin-short-complete.js`

##### **Advanced Short** (`bitcoin-short-15x.js`)
- Advanced Bitcoin short with 15x leverage
- Full balance trading
- Extended monitoring
- Comprehensive error handling
- **Run**: `node examples/bitcoin-short-15x.js`

#### 5. **ASTER Long Examples**

##### **Simple Long** (`aster-long-simple.js`)
- Basic ASTER long position with leverage
- Simple open/close example
- **Run**: `node examples/aster-long-simple.js`

##### **10x Leverage Long** (`aster-long-10x.js`)
- ASTER long with 10x leverage
- Position management
- **Run**: `node examples/aster-long-10x.js`

##### **Custom Long** (`aster-long-custom.js`)
- Customizable ASTER long position
- Accepts quantity as command-line argument
- **Run**: `node examples/aster-long-custom.js [quantity]`

### Market Data & Analysis

#### 6. **Get Klines** (`get-klines-example.js`)
- Fetch candlestick/kline data
- Multiple time intervals
- Technical analysis data
- **Run**: `node examples/get-klines-example.js`

#### 7. **Technical Analysis** (`technical-analysis-example.js`)
- Advanced technical analysis
- Price patterns
- Market indicators
- **Run**: `node examples/technical-analysis-example.js`

### Advanced Examples

#### 8. **Trading Strategy** (`trading-strategy.js`)
- Complete trading strategy framework
- Risk management examples
- Account summary with positions and orders
- **Run**: `node examples/trading-strategy.js`

#### 9. **Multi-Symbol Trading** (`multi-symbol-trading.js`)
- Trading multiple symbols
- Precision handling for different assets
- Symbol-specific configurations
- **Run**: `node examples/multi-symbol-trading.js`

## 🚀 Quick Start

1. **Set up your API credentials**:
   ```bash
   cp .env.example .env
   # Edit .env with your API credentials
   ```

2. **Run a basic example**:
   ```bash
   node examples/basic-usage.js
   ```

3. **Try a safe Bitcoin short**:
   ```bash
   node examples/bitcoin-short-safe.js
   ```

## ⚠️ Important Notes

1. **API Credentials**: Always set your API credentials in the `.env` file
2. **Risk Management**: Start with small amounts and test thoroughly
3. **Leverage**: High leverage (15x) amplifies both gains and losses
4. **Position Sizing**: Examples show different risk levels (10%, 50%, 100%)
5. **Quantity Precision**: Orders must match symbol precision requirements

## 🔧 Customization

You can modify the examples to:
- Change leverage (1x to 125x)
- Adjust position sizes
- Use different symbols (ETHUSDT, ADAUSDT, etc.)
- Modify hold times
- Add custom risk management

## 📚 Key Concepts

### **Short Trading**
- **SELL** opens a short position (betting price will go down)
- **BUY** closes a short position
- Profit when price decreases, loss when price increases

### **Long Trading**
- **BUY** opens a long position (betting price will go up)
- **SELL** closes a long position
- Profit when price increases, loss when price decreases

### **Leverage**
- Leverage multiplies your position size
- Higher leverage = higher risk and reward
- Always use available balance for calculations

### **Position Sizing**
- **Available Balance**: Funds you can actually trade with
- **Total Balance**: Includes locked funds from positions
- **Cross Wallet**: Shared across all positions in cross-margin mode

## 🛡️ Safety Features

All examples include:
- API credential validation
- Position size validation
- Error handling
- Quantity precision rounding
- Risk management
- Position monitoring

## 📖 Next Steps

1. **Study the examples** to understand the patterns
2. **Modify parameters** to match your risk tolerance
3. **Test with small amounts** before larger trades
4. **Build your own strategies** using the client methods
5. **Implement proper risk management** in your trading bots

Happy trading! 🚀
