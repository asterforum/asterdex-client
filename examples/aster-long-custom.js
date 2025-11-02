/**
 * Custom ASTER Long with 10x Leverage
 * Script to open an ASTER long position with custom quantity
 * 
 * Usage: node examples/aster-long-custom.js [quantity]
 * Example: node examples/aster-long-custom.js 1000
 * 
 * Run with: node examples/aster-long-custom.js
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

async function asterLongCustom() {
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

  // Get quantity from command line argument or use default
  const args = process.argv.slice(2);
  const customQuantity = args[0] ? parseFloat(args[0]) : null;

  try {
    console.log('🚀 Custom ASTER Long with 10x Leverage\n');

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

    // 3. Determine quantity
    let asterQuantity;
    if (customQuantity) {
      asterQuantity = customQuantity;
      console.log(`\n🎯 Using custom quantity: ${asterQuantity} ASTER`);
    } else {
      // Use 5% of balance for safety
      const riskAmount = usdtAvailable * 0.05;
      const targetNotional = riskAmount * LEVERAGE;
      asterQuantity = targetNotional / asterPrice;
      console.log(`\n🧮 Auto-calculated quantity: ${asterQuantity.toFixed(2)} ASTER`);
    }

    const notional = asterQuantity * asterPrice;
    console.log(`📊 Notional Value: $${notional.toFixed(2)}`);

    // 4. Check minimum notional
    if (notional < 5) {
      throw new Error(`Notional value ($${notional.toFixed(2)}) is below minimum ($5)`);
    }

    // 5. Open LONG position
    console.log('\n🟢 Opening LONG position...');
    const longOrder = await client.placeMarketOrderSmart(SYMBOL, 'BUY', asterQuantity);
    
    console.log(`✅ LONG opened:`);
    console.log(`  Quantity: ${longOrder.filledQty} ASTER`);
    console.log(`  Price: $${asterPrice.toFixed(4)}`);
    console.log(`  Notional: $${(parseFloat(longOrder.filledQty) * asterPrice).toFixed(2)}`);

    // 6. Wait 5 seconds
    console.log('\n⏳ Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 7. Close LONG position
    console.log('🔴 Closing LONG position...');
    const closeOrder = await client.placeMarketOrderSmart(SYMBOL, 'SELL', longOrder.filledQty, true);
    
    console.log(`✅ LONG closed: ${closeOrder.filledQty} ASTER`);

    // 8. Show final balance
    const finalBalance = await client.getAvailableBalance('USDT');
    const pnl = finalBalance - usdtAvailable;
    
    console.log(`\n📊 Final Balance: $${finalBalance.toFixed(2)}`);
    console.log(`📈 P&L: $${pnl.toFixed(2)}`);
    console.log('\n🎉 Custom ASTER Long trade completed!');

  } catch (error) {
    console.error('❌ Trade failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Show usage if no arguments
if (process.argv.length < 3) {
  console.log('💡 Usage: node examples/aster-long-custom.js [quantity]');
  console.log('   Example: node examples/aster-long-custom.js 1000');
  console.log('   Example: node examples/aster-long-custom.js 500.5');
  console.log('');
}

// Run the custom ASTER long trade
asterLongCustom().catch(console.error);



