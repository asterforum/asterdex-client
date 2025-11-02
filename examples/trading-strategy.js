/**
 * Trading strategy example using AsterDEX API Client
 * This example demonstrates a simple long/short strategy
 * Run with: node examples/trading-strategy.js
 * 
 * WARNING: This is for educational purposes only!
 * Always test with small amounts first.
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

class TradingStrategy {
  constructor(apiKey, apiSecret) {
    this.client = new AsterdexClient({ apiKey, apiSecret });
    this.symbol = 'BTCUSDT';
    this.leverage = 5; // Conservative leverage
    this.maxRiskPercent = 0.1; // Use only 10% of balance
  }

  async executeLongStrategy() {
    try {
      console.log('🟢 Executing LONG strategy...\n');

      // 1. Check if we already have a position
      const currentPosition = await this.client.getPositionAmount(this.symbol);
      if (currentPosition !== 0) {
        console.log(`⚠️  Position already exists: ${currentPosition}`);
        return;
      }

      // 2. Set leverage
      await this.client.setLeverage(this.symbol, this.leverage);
      console.log(`✅ Leverage set to ${this.leverage}x`);

      // 3. Calculate position size
      const [availableBalance, totalBalance, price] = await Promise.all([
        this.client.getAvailableBalance('USDT'),
        this.client.getTotalBalance('USDT'),
        this.client.getLastPrice(this.symbol)
      ]);
      
      const maxRiskAmount = availableBalance * this.maxRiskPercent;
      const maxQuantity = maxRiskAmount / price;

      console.log(`💰 Available Balance: $${availableBalance.toFixed(2)}`);
      console.log(`💰 Total Balance: $${totalBalance.toFixed(2)}`);
      console.log(`🎯 Max risk: $${maxRiskAmount.toFixed(2)} (${this.maxRiskPercent * 100}%)`);
      console.log(`📊 BTC Price: $${price.toFixed(2)}`);
      console.log(`📏 Max quantity: ${maxQuantity.toFixed(6)} BTC\n`);

      // 4. Place market buy order
      const order = await this.client.placeMarketOrder(this.symbol, 'BUY', maxQuantity);
      console.log(`✅ LONG order placed: ${order.filledQty} BTC @ $${price.toFixed(2)}`);

      // 5. Wait and monitor
      console.log('⏳ Monitoring position...');
      await this.monitorPosition(30000); // Monitor for 30 seconds

      // 6. Close position
      await this.client.closePosition(this.symbol);
      console.log('✅ Position closed');

    } catch (error) {
      console.error('❌ Long strategy failed:', error.message);
    }
  }

  async executeShortStrategy() {
    try {
      console.log('🔴 Executing SHORT strategy...\n');

      // 1. Check if we already have a position
      const currentPosition = await this.client.getPositionAmount(this.symbol);
      if (currentPosition !== 0) {
        console.log(`⚠️  Position already exists: ${currentPosition}`);
        return;
      }

      // 2. Set leverage
      await this.client.setLeverage(this.symbol, this.leverage);
      console.log(`✅ Leverage set to ${this.leverage}x`);

      // 3. Calculate position size
      const [availableBalance, totalBalance, price] = await Promise.all([
        this.client.getAvailableBalance('USDT'),
        this.client.getTotalBalance('USDT'),
        this.client.getLastPrice(this.symbol)
      ]);
      
      const maxRiskAmount = availableBalance * this.maxRiskPercent;
      const maxQuantity = maxRiskAmount / price;

      console.log(`💰 Available Balance: $${availableBalance.toFixed(2)}`);
      console.log(`💰 Total Balance: $${totalBalance.toFixed(2)}`);
      console.log(`🎯 Max risk: $${maxRiskAmount.toFixed(2)} (${this.maxRiskPercent * 100}%)`);
      console.log(`📊 BTC Price: $${price.toFixed(2)}`);
      console.log(`📏 Max quantity: ${maxQuantity.toFixed(6)} BTC\n`);

      // 4. Place market sell order (open short)
      const order = await this.client.placeMarketOrder(this.symbol, 'SELL', maxQuantity);
      console.log(`✅ SHORT order placed: ${order.filledQty} BTC @ $${price.toFixed(2)}`);

      // 5. Wait and monitor
      console.log('⏳ Monitoring position...');
      await this.monitorPosition(30000); // Monitor for 30 seconds

      // 6. Close short position
      await this.client.closePosition(this.symbol);
      console.log('✅ Short position closed');

    } catch (error) {
      console.error('❌ Short strategy failed:', error.message);
    }
  }

  async monitorPosition(durationMs) {
    const startTime = Date.now();
    const endTime = startTime + durationMs;

    while (Date.now() < endTime) {
      try {
        const position = await this.client.getPositionAmount(this.symbol);
        const price = await this.client.getLastPrice(this.symbol);
        
        console.log(`📊 Position: ${position.toFixed(6)} BTC | Price: $${price.toFixed(2)}`);
        
        // Wait 5 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('Error monitoring position:', error.message);
        break;
      }
    }
  }

  async getAccountSummary() {
    try {
      console.log('📊 Account Summary:\n');
      
      const [usdtAvailable, usdtTotal, usdtCross, positions, openOrders] = await Promise.all([
        this.client.getAvailableBalance('USDT'),
        this.client.getTotalBalance('USDT'),
        this.client.getCrossWalletBalance('USDT'),
        this.client.getPositions(),
        this.client.getOpenOrders()
      ]);

      console.log(`💰 USDT Available: $${usdtAvailable.toFixed(2)} (for trading)`);
      console.log(`💰 USDT Total: $${usdtTotal.toFixed(2)}`);
      console.log(`💰 USDT Cross Wallet: $${usdtCross.toFixed(2)}`);
      
      const activePositions = positions.filter(p => parseFloat(p.positionAmt) !== 0);
      console.log(`💼 Active Positions: ${activePositions.length}`);
      
      if (activePositions.length > 0) {
        activePositions.forEach(pos => {
          const amount = parseFloat(pos.positionAmt);
          const side = amount > 0 ? 'LONG' : 'SHORT';
          console.log(`  - ${pos.symbol}: ${Math.abs(amount).toFixed(6)} (${side})`);
        });
      }
      
      const activeOrders = openOrders.filter(o => o.status === 'NEW');
      console.log(`📋 Open Orders: ${activeOrders.length}`);
      
      if (activeOrders.length > 0) {
        activeOrders.forEach(order => {
          console.log(`  - ${order.symbol}: ${order.side} ${order.origQty} @ ${order.price} (${order.status})`);
        });
      }
      console.log();

      return { 
        usdtAvailable, 
        usdtTotal, 
        usdtCross, 
        positions: activePositions, 
        orders: activeOrders 
      };
    } catch (error) {
      console.error('❌ Failed to get account summary:', error.message);
      return null;
    }
  }
}

async function main() {
  const apiKey = process.env.ASTERDEX_API_KEY;
  const apiSecret = process.env.ASTERDEX_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error('❌ Please set ASTERDEX_API_KEY and ASTERDEX_API_SECRET in your .env file');
    process.exit(1);
  }

  const strategy = new TradingStrategy(apiKey, apiSecret);

  try {
    // Show account summary
    await strategy.getAccountSummary();

    // Ask user what to do (in a real app, you'd have a proper UI)
    console.log('🤖 Trading Strategy Demo');
    console.log('1. Execute LONG strategy');
    console.log('2. Execute SHORT strategy');
    console.log('3. Show account summary only');
    console.log('4. Exit\n');

    // For demo purposes, we'll just show the account summary
    // In a real application, you'd implement user input handling
    console.log('📝 Note: This is a demo. In a real application, you would implement user input handling.');
    console.log('💡 To execute trades, uncomment the lines below and modify as needed.\n');

    // Uncomment these lines to execute actual trades (BE CAREFUL!)
    // await strategy.executeLongStrategy();
    // await strategy.executeShortStrategy();

  } catch (error) {
    console.error('❌ Strategy execution failed:', error.message);
  }
}

// Run the strategy
main().catch(console.error);
