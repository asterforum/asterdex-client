/**
 * Complete Bitcoin Short Example with 15x Leverage
 * This example shows the complete code structure for:
 * 1. Setting leverage to 15x
 * 2. Opening a full balance Bitcoin short
 * 3. Monitoring and closing the position
 * 
 * Run with: node examples/bitcoin-short-complete.js
 * 
 * IMPORTANT: Set your API credentials in .env file before running!
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

async function bitcoinShortComplete() {
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
  const SAFETY_BUFFER = 0.98; // 2% safety buffer

  try {
    console.log('🔴 Bitcoin Short with 15x Leverage - Complete Example\n');

    // STEP 1: Get account information
    console.log('📊 Step 1: Getting account information...');
    const usdtAvailable = await client.getAvailableBalance('USDT');
    console.log(`💰 USDT Available: $${usdtAvailable.toFixed(2)}`);

    // STEP 2: Set leverage to 15x
    console.log('\n⚙️  Step 2: Setting leverage to 15x...');
    await client.setLeverage(SYMBOL, LEVERAGE);
    console.log(`✅ Leverage set to ${LEVERAGE}x`);

    // STEP 3: Get current Bitcoin price
    console.log('\n📈 Step 3: Getting current Bitcoin price...');
    const btcPrice = await client.getLastPrice(SYMBOL);
    console.log(`📊 BTC Price: $${btcPrice.toFixed(2)}`);

    // STEP 4: Calculate position size using full available balance
    console.log('\n🧮 Step 4: Calculating position size...');
    const targetNotional = usdtAvailable * LEVERAGE * SAFETY_BUFFER;
    let btcQuantity = targetNotional / btcPrice;
    
    // Round to 3 decimal places (BTC step size is usually 0.001)
    btcQuantity = Math.floor(btcQuantity * 1000) / 1000;

    console.log(`  Available Balance: $${usdtAvailable.toFixed(2)}`);
    console.log(`  Leverage: ${LEVERAGE}x`);
    console.log(`  Safety Buffer: ${(SAFETY_BUFFER * 100).toFixed(1)}%`);
    console.log(`  Target Notional: $${targetNotional.toFixed(2)}`);
    console.log(`  BTC Quantity: ${btcQuantity.toFixed(3)} BTC (rounded to 0.001)`);

    // STEP 5: Validate position size
    if (btcQuantity <= 0) {
      throw new Error('Calculated quantity is <= 0');
    }
    if (targetNotional < 5) {
      throw new Error(`Target notional ($${targetNotional.toFixed(2)}) is below minimum ($5)`);
    }

    // STEP 6: Open SHORT position (SELL to open short)
    console.log('\n🔴 Step 5: Opening SHORT position...');
    const shortOrder = await client.placeMarketOrder(
      SYMBOL, 
      'SELL',  // SELL opens a short position
      btcQuantity, 
      false   // Not a reduce-only order
    );

    console.log(`✅ SHORT position opened:`);
    console.log(`  Order ID: ${shortOrder.orderId}`);
    console.log(`  Quantity: ${shortOrder.filledQty} BTC`);
    console.log(`  Price: $${btcPrice.toFixed(2)}`);
    console.log(`  Notional: $${(shortOrder.filledQty * btcPrice).toFixed(2)}`);

    // STEP 7: Monitor position (optional - you can skip this)
    console.log('\n⏳ Step 6: Monitoring position for 15 seconds...');
    const startTime = Date.now();
    const endTime = startTime + 15000; // 15 seconds

    while (Date.now() < endTime) {
      try {
        const [currentPrice, positionAmount] = await Promise.all([
          client.getLastPrice(SYMBOL),
          client.getPositionAmount(SYMBOL)
        ]);

        const priceChange = ((currentPrice - btcPrice) / btcPrice) * 100;
        const unrealizedPnL = positionAmount * (btcPrice - currentPrice);
        
        console.log(`📊 Position: ${positionAmount.toFixed(6)} BTC | Price: $${currentPrice.toFixed(2)} | Change: ${priceChange.toFixed(2)}% | PnL: $${unrealizedPnL.toFixed(2)}`);
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      } catch (error) {
        console.error('Error monitoring position:', error.message);
        break;
      }
    }

    // STEP 8: Close SHORT position (BUY to close short)
    console.log('\n🟢 Step 7: Closing SHORT position...');
    const closeOrder = await client.closePositionExact(
      SYMBOL, 
      shortOrder.filledQty,  // Use exact quantity from opening order
      'BUY'                   // BUY closes a short position
    );

    console.log(`✅ SHORT position closed:`);
    console.log(`  Order ID: ${closeOrder.orderId}`);
    console.log(`  Quantity: ${closeOrder.filledQty} BTC`);

    // STEP 9: Final account status
    console.log('\n📊 Step 8: Final account status...');
    const finalUsdtAvailable = await client.getAvailableBalance('USDT');
    const remainingPosition = await client.getPositionAmount(SYMBOL);

    console.log(`💰 Final USDT Available: $${finalUsdtAvailable.toFixed(2)}`);
    console.log(`💼 Remaining Position: ${remainingPosition.toFixed(6)} BTC`);

    const profitLoss = finalUsdtAvailable - usdtAvailable;
    console.log(`📈 P&L: $${profitLoss.toFixed(2)}`);

    if (remainingPosition !== 0) {
      console.log(`⚠️  Warning: ${remainingPosition.toFixed(6)} BTC position remains`);
    } else {
      console.log(`✅ Position fully closed`);
    }

    console.log('\n🎉 Bitcoin Short 15x Trade Completed Successfully!');

  } catch (error) {
    console.error('❌ Trade failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Run the complete Bitcoin short example
bitcoinShortComplete().catch(console.error);
