/**
 * Simple ASTER Long with 10x Leverage
 * Quick script to open and close an ASTER long position
 * 
 * Run with: node examples/aster-long-simple.js
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

async function asterLongSimple() {
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

  const SYMBOL = 'ASTERUSDT';
  const LEVERAGE = 10;

  try {
    console.log('🚀 Simple ASTER Long with 10x Leverage\n');

    // 1. Get balance and price
    const [usdtAvailable, asterPrice] = await Promise.all([
      client.getAvailableBalance('USDT'),
      client.getLastPrice(SYMBOL)
    ]);

    console.log(`💰 Available: $${usdtAvailable.toFixed(2)}`);
    console.log(`📈 ASTER Price: $${asterPrice.toFixed(4)}`);

    // 2. Set leverage
    await client.setLeverage(SYMBOL, LEVERAGE);
    console.log(`✅ Leverage set to ${LEVERAGE}x`);

    // 3. Calculate position (use 10% of balance for safety)
    const riskAmount = usdtAvailable * 0.1; // 10% risk
    const targetNotional = riskAmount * LEVERAGE;
    const asterQuantity = targetNotional / asterPrice;

    console.log(`\n🧮 Position: ${asterQuantity.toFixed(2)} ASTER ($${targetNotional.toFixed(2)} notional)`);

    // 4. Open LONG position
    console.log('\n🟢 Opening LONG position...');
    const longOrder = await client.placeMarketOrderSmart(SYMBOL, 'BUY', asterQuantity);
    
    console.log(`✅ LONG opened: ${longOrder.filledQty} ASTER at $${asterPrice.toFixed(4)}`);

    // 5. Wait 3 seconds
    console.log('\n⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 6. Close LONG position
    console.log('🔴 Closing LONG position...');
    const closeOrder = await client.placeMarketOrderSmart(SYMBOL, 'SELL', longOrder.filledQty, true);
    
    console.log(`✅ LONG closed: ${closeOrder.filledQty} ASTER`);

    // 7. Show final balance
    const finalBalance = await client.getAvailableBalance('USDT');
    const pnl = finalBalance - usdtAvailable;
    
    console.log(`\n📊 Final Balance: $${finalBalance.toFixed(2)}`);
    console.log(`📈 P&L: $${pnl.toFixed(2)}`);
    console.log('\n🎉 ASTER Long trade completed!');

  } catch (error) {
    console.error('❌ Trade failed:', error.message);
  }
}

// Run the simple ASTER long trade
asterLongSimple().catch(console.error);



