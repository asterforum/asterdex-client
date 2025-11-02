/**
 * Basic usage example for AsterDEX API Client
 * Run with: node examples/basic-usage.js
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Check if API credentials are available
  if (!process.env.ASTERDEX_API_KEY || !process.env.ASTERDEX_API_SECRET) {
    console.log('❌ API credentials not found!');
    console.log('Please set ASTERDEX_API_KEY and ASTERDEX_API_SECRET in your .env file');
    console.log('\n📝 Example .env file:');
    console.log('ASTERDEX_API_KEY=your_api_key_here');
    console.log('ASTERDEX_API_SECRET=your_api_secret_here');
    console.log('\n💡 Note: This example requires dotenv for local development.');
    console.log('   In production, provide credentials directly to AsterdexClient constructor.');
    return;
  }

  // Initialize client
  const client = new AsterdexClient({
    apiKey: process.env.ASTERDEX_API_KEY,
    apiSecret: process.env.ASTERDEX_API_SECRET
  });

  try {
    console.log('🚀 AsterDEX API Client Demo\n');

    // 1. Get account balance
    console.log('📊 Account Information:');
    const usdtAvailable = await client.getAvailableBalance('USDT');
    const usdtTotal = await client.getTotalBalance('USDT');
    const usdtCross = await client.getCrossWalletBalance('USDT');
    
    console.log(`USDT Available: $${usdtAvailable.toFixed(2)} (for trading)`);
    console.log(`USDT Total: $${usdtTotal.toFixed(2)}`);
    console.log(`USDT Cross Wallet: $${usdtCross.toFixed(2)}\n`);

    // Check other assets if available
    console.log('💰 Other Asset Balances:');
    const btcAvailable = await client.getAvailableBalance('BTC');
    const ethAvailable = await client.getAvailableBalance('ETH');
    
    if (btcAvailable > 0) {
      console.log(`BTC Available: ${btcAvailable.toFixed(8)} BTC`);
    }
    if (ethAvailable > 0) {
      console.log(`ETH Available: ${ethAvailable.toFixed(6)} ETH`);
    }
    console.log();

    // 2. Get market data
    console.log('📈 Market Data:');
    const price = await client.getLastPrice('BTCUSDT');
    const ticker = await client.get24hrTicker('BTCUSDT');
    console.log(`BTC Price: $${price.toFixed(2)}`);
    console.log(`24h Change: ${parseFloat(ticker.priceChangePercent).toFixed(2)}%\n`);

    // 3. Get current positions
    console.log('💼 Current Positions:');
    const positions = await client.getPositions();
    const activePositions = positions.filter(p => parseFloat(p.positionAmt) !== 0);
    
    if (activePositions.length === 0) {
      console.log('No active positions\n');
    } else {
      activePositions.forEach(pos => {
        console.log(`${pos.symbol}: ${pos.positionAmt} (${pos.positionSide})`);
      });
      console.log();
    }

    // 4. Get open orders
    console.log('📋 Open Orders:');
    const openOrders = await client.getOpenOrders();
    
    if (openOrders.length === 0) {
      console.log('No open orders\n');
    } else {
      openOrders.forEach(order => {
        console.log(`${order.symbol}: ${order.side} ${order.origQty} @ ${order.price} (${order.status})`);
      });
      console.log();
    }

    // 5. Calculate position sizing (demo only - no actual trading)
    console.log('🧮 Position Sizing Demo:');
    const positionInfo = await client.calculateMaxPosition('BTCUSDT', 10, 0.98);
    console.log(`Max position size for BTCUSDT with 10x leverage:`);
    console.log(`- Quantity: ${positionInfo.quantity.toFixed(6)} BTC`);
    console.log(`- Notional: $${positionInfo.effectiveNotional.toFixed(2)}`);
    console.log(`- Step size: ${positionInfo.stepSize}`);
    console.log(`- Min notional: $${positionInfo.minNotional}\n`);

    console.log('✅ Demo completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Run the demo
main().catch(console.error);
