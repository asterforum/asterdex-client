/**
 * Safe Bitcoin Short Example with 15x Leverage
 * This example uses a smaller position size for safer testing
 * 
 * Run with: node examples/bitcoin-short-safe.js
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

async function bitcoinShortSafe() {
  // Check API credentials
  if (!process.env.ASTERDEX_API_KEY || !process.env.ASTERDEX_API_SECRET) {
    console.log('❌ API credentials not found!');
    console.log('Please set ASTERDEX_API_KEY and ASTERDEX_API_SECRET in your .env file');
    return;
  }

  const client = new AsterdexClient({
    apiKey: process.env.ASTERDEX_API_KEY,
    apiSecret: process.env.ASTERDEX_API_SECRET
  });

  const SYMBOL = 'BTCUSDT';
  const LEVERAGE = 15;
  const RISK_PERCENT = 0.1; // Use only 10% of available balance for safety

  try {
    console.log('🔴 Safe Bitcoin Short with 15x Leverage\n');

    // STEP 1: Get account information
    const usdtAvailable = await client.getAvailableBalance('USDT');
    console.log(`💰 USDT Available: $${usdtAvailable.toFixed(2)}`);

    // STEP 2: Set leverage to 15x
    await client.setLeverage(SYMBOL, LEVERAGE);
    console.log(`✅ Leverage set to ${LEVERAGE}x`);

    // STEP 3: Get current Bitcoin price
    const btcPrice = await client.getLastPrice(SYMBOL);
    console.log(`📊 BTC Price: $${btcPrice.toFixed(2)}`);

    // STEP 4: Calculate SAFE position size (only 10% of balance)
    const riskAmount = usdtAvailable * RISK_PERCENT;
    const targetNotional = riskAmount * LEVERAGE;
    let btcQuantity = targetNotional / btcPrice;
    
    // Round to 3 decimal places
    btcQuantity = Math.floor(btcQuantity * 1000) / 1000;

    console.log(`\n🧮 Position Calculation:`);
    console.log(`  Risk Amount (${RISK_PERCENT * 100}%): $${riskAmount.toFixed(2)}`);
    console.log(`  Leverage: ${LEVERAGE}x`);
    console.log(`  Target Notional: $${targetNotional.toFixed(2)}`);
    console.log(`  BTC Quantity: ${btcQuantity.toFixed(3)} BTC`);

    // STEP 5: Validate position size
    if (btcQuantity <= 0) {
      throw new Error('Calculated quantity is <= 0');
    }
    if (targetNotional < 5) {
      throw new Error(`Target notional ($${targetNotional.toFixed(2)}) is below minimum ($5)`);
    }

    // STEP 6: Open SHORT position with smart precision
    console.log('\n🔴 Opening SHORT position...');
    const shortOrder = await client.placeMarketOrderSmart(SYMBOL, 'SELL', btcQuantity);
    
    console.log(`✅ SHORT opened:`);
    console.log(`  Order ID: ${shortOrder.orderId}`);
    console.log(`  Quantity: ${shortOrder.filledQty} BTC`);
    console.log(`  Price: $${btcPrice.toFixed(2)}`);

    // STEP 7: Wait briefly
    console.log('\n⏳ Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // STEP 8: Close SHORT position with smart precision
    console.log('🟢 Closing SHORT position...');
    const closeOrder = await client.placeMarketOrderSmart(SYMBOL, 'BUY', shortOrder.filledQty, true);
    
    console.log(`✅ SHORT closed:`);
    console.log(`  Order ID: ${closeOrder.orderId}`);
    console.log(`  Quantity: ${closeOrder.filledQty} BTC`);

    // STEP 9: Check results
    const finalBalance = await client.getAvailableBalance('USDT');
    const pnl = finalBalance - usdtAvailable;
    
    console.log(`\n📊 Results:`);
    console.log(`  Initial Balance: $${usdtAvailable.toFixed(2)}`);
    console.log(`  Final Balance: $${finalBalance.toFixed(2)}`);
    console.log(`  P&L: $${pnl.toFixed(2)}`);

    console.log('\n🎉 Safe Bitcoin Short Trade Completed!');

  } catch (error) {
    console.error('❌ Trade failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Run the safe Bitcoin short example
bitcoinShortSafe().catch(console.error);
