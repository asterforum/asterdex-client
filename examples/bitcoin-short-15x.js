/**
 * Bitcoin Short with 15x Leverage Example
 * This example demonstrates:
 * 1. Setting leverage to 15x
 * 2. Opening a full balance Bitcoin short position
 * 3. Monitoring the position
 * 4. Closing the position
 * 
 * Run with: node examples/bitcoin-short-15x.js
 * WARNING: This is for educational purposes only!
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

async function bitcoinShort15x() {
  // Check if API credentials are available
  if (!process.env.ASTERDEX_API_KEY || !process.env.ASTERDEX_API_SECRET) {
    console.log('❌ API credentials not found!');
    console.log('Please set ASTERDEX_API_KEY and ASTERDEX_API_SECRET in your .env file');
    console.log('\n💡 Note: This example requires dotenv for local development.');
    console.log('   In production, provide credentials directly to AsterdexClient constructor.');
    return;
  }

  const client = new AsterdexClient({
    apiKey: process.env.ASTERDEX_API_KEY,
    apiSecret: process.env.ASTERDEX_API_SECRET
  });

  const SYMBOL = 'BTCUSDT';
  const LEVERAGE = 5;
  const HOLD_TIME_MS = 30000; // 30 seconds
  const SAFETY_BUFFER = 0.98; // 2% safety buffer

  try {
    console.log('🔴 Bitcoin Short with 15x Leverage\n');

    // 1. Check initial balance
    console.log('📊 Initial Account Status:');
    const [usdtAvailable, usdtTotal, currentPositions] = await Promise.all([
      client.getAvailableBalance('USDT'),
      client.getTotalBalance('USDT'),
      client.getPositions(SYMBOL)
    ]);

    console.log(`💰 USDT Available: $${usdtAvailable.toFixed(2)}`);
    console.log(`💰 USDT Total: $${usdtTotal.toFixed(2)}`);

    const currentPosition = currentPositions.find(p => p.symbol === SYMBOL);
    if (currentPosition && parseFloat(currentPosition.positionAmt) !== 0) {
      console.log(`⚠️  Existing position: ${currentPosition.positionAmt} BTC`);
      console.log('Closing existing position first...');
      await client.closePosition(SYMBOL);
      console.log('✅ Existing position closed\n');
    }

    // 2. Set leverage to 15x
    console.log(`⚙️  Setting leverage to ${LEVERAGE}x...`);
    await client.setLeverage(SYMBOL, LEVERAGE);
    console.log(`✅ Leverage set to ${LEVERAGE}x\n`);

    // 3. Get current Bitcoin price
    const btcPrice = await client.getLastPrice(SYMBOL);
    console.log(`📈 Current BTC Price: $${btcPrice.toFixed(2)}\n`);

    // 4. Calculate position size using full available balance
    const targetNotional = usdtAvailable * LEVERAGE * SAFETY_BUFFER;
    let btcQuantity = targetNotional / btcPrice;
    
    // Round to 3 decimal places (BTC step size is usually 0.001)
    btcQuantity = Math.floor(btcQuantity * 1000) / 1000;
    
    console.log('🧮 Position Calculation:');
    console.log(`  Available Balance: $${usdtAvailable.toFixed(2)}`);
    console.log(`  Leverage: ${LEVERAGE}x`);
    console.log(`  Safety Buffer: ${(SAFETY_BUFFER * 100).toFixed(1)}%`);
    console.log(`  Target Notional: $${targetNotional.toFixed(2)}`);
    console.log(`  BTC Quantity: ${btcQuantity.toFixed(3)} BTC (rounded to 0.001)\n`);

    // 5. Validate position size
    if (btcQuantity <= 0) {
      throw new Error('Calculated quantity is <= 0');
    }

    if (targetNotional < 5) {
      throw new Error(`Target notional ($${targetNotional.toFixed(2)}) is below minimum ($5)`);
    }

    // 6. Open SHORT position (SELL to open short) with smart precision
    console.log('🔴 Opening SHORT position...');
    const shortOrder = await client.placeMarketOrderSmart(
      SYMBOL, 
      'SELL',  // SELL opens a short position
      btcQuantity, 
      false   // Not a reduce-only order
    );

    console.log(`✅ SHORT position opened:`);
    console.log(`  Order ID: ${shortOrder.orderId}`);
    console.log(`  Quantity: ${shortOrder.filledQty} BTC`);
    console.log(`  Price: $${btcPrice.toFixed(2)}`);
    console.log(`  Notional: $${(shortOrder.filledQty * btcPrice).toFixed(2)}\n`);

    // 7. Monitor position for specified time
    console.log(`⏳ Monitoring position for ${HOLD_TIME_MS / 1000} seconds...`);
    const startTime = Date.now();
    const endTime = startTime + HOLD_TIME_MS;

    while (Date.now() < endTime) {
      try {
        const [currentPrice, positionAmount] = await Promise.all([
          client.getLastPrice(SYMBOL),
          client.getPositionAmount(SYMBOL)
        ]);

        const priceChange = ((currentPrice - btcPrice) / btcPrice) * 100;
        // For short positions: profit when price goes down, loss when price goes up
        // Correct formula: positionAmount * (currentPrice - entryPrice)
        const unrealizedPnL = positionAmount * (currentPrice - btcPrice);
        
        // Debug: show the calculation details
        const priceDiff = currentPrice - btcPrice;
        const pnlSign = unrealizedPnL >= 0 ? '+' : '';
        
        console.log(`📊 Position: ${positionAmount.toFixed(6)} BTC | Price: $${currentPrice.toFixed(2)} | Change: ${priceChange.toFixed(2)}% | PnL: ${pnlSign}$${unrealizedPnL.toFixed(2)}`);
        console.log(`   Debug: Entry: $${btcPrice.toFixed(2)}, Current: $${currentPrice.toFixed(2)}, Diff: $${priceDiff.toFixed(2)}, PnL: $${unrealizedPnL.toFixed(2)}`);
        
        // Wait 5 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('Error monitoring position:', error.message);
        break;
      }
    }

    // 8. Close SHORT position (BUY to close short) with smart precision
    console.log('\n🟢 Closing SHORT position...');
    const closeOrder = await client.placeMarketOrderSmart(
      SYMBOL, 
      'BUY',                   // BUY closes a short position
      shortOrder.filledQty,    // Use exact quantity from opening order
      true                     // This is a reduce-only order
    );

    console.log(`✅ SHORT position closed:`);
    console.log(`  Order ID: ${closeOrder.orderId}`);
    console.log(`  Quantity: ${closeOrder.filledQty} BTC`);

    // 9. Final account status
    console.log('\n📊 Final Account Status:');
    const [finalUsdtAvailable, finalUsdtTotal, finalPositions] = await Promise.all([
      client.getAvailableBalance('USDT'),
      client.getTotalBalance('USDT'),
      client.getPositions(SYMBOL)
    ]);

    const finalPosition = finalPositions.find(p => p.symbol === SYMBOL);
    const remainingPosition = finalPosition ? parseFloat(finalPosition.positionAmt) : 0;

    console.log(`💰 USDT Available: $${finalUsdtAvailable.toFixed(2)}`);
    console.log(`💰 USDT Total: $${finalUsdtTotal.toFixed(2)}`);
    console.log(`💼 Remaining Position: ${remainingPosition.toFixed(6)} BTC`);

    const profitLoss = finalUsdtAvailable - usdtAvailable;
    console.log(`📈 P&L: $${profitLoss.toFixed(2)}`);

    if (remainingPosition !== 0) {
      console.log(`⚠️  Warning: ${remainingPosition.toFixed(6)} BTC position remains`);
    } else {
      console.log(`✅ Position fully closed`);
    }

    console.log('\n🎉 Bitcoin Short 15x Trade Completed!');

  } catch (error) {
    console.error('❌ Trade failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Run the Bitcoin short example
bitcoinShort15x().catch(console.error);
