/**
 * ASTER Long with 10x Leverage
 * Simple script to open an ASTER long position with 10x leverage
 * 
 * Run with: node examples/aster-long-10x.js
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

async function asterLong10x() {
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
  const SAFETY_BUFFER = 0.98; // Use 98% of available balance for safety

  try {
    console.log('🚀 ASTER Long with 10x Leverage\n');

    // 1. Get account balance
    console.log('📊 Initial Account Status:');
    const usdtAvailable = await client.getAvailableBalance('USDT');
    const usdtTotal = await client.getTotalBalance('USDT');
    
    console.log(`💰 USDT Available: $${usdtAvailable.toFixed(2)} (for trading)`);
    console.log(`💰 USDT Total: $${usdtTotal.toFixed(2)}\n`);

    // 2. Set leverage to 10x
    console.log(`⚙️  Setting leverage to ${LEVERAGE}x...`);
    await client.setLeverage(SYMBOL, LEVERAGE);
    console.log(`✅ Leverage set to ${LEVERAGE}x\n`);

    // 3. Get current ASTER price
    const asterPrice = await client.getLastPrice(SYMBOL);
    console.log(`📈 Current ASTER Price: $${asterPrice.toFixed(4)}\n`);

    // 4. Calculate position size
    const riskAmount = usdtAvailable * SAFETY_BUFFER;
    const targetNotional = riskAmount * LEVERAGE;
    let asterQuantity = targetNotional / asterPrice;

    console.log('🧮 Position Calculation:');
    console.log(`  Available Balance: $${usdtAvailable.toFixed(2)}`);
    console.log(`  Leverage: ${LEVERAGE}x`);
    console.log(`  Safety Buffer: ${(SAFETY_BUFFER * 100).toFixed(1)}%`);
    console.log(`  Risk Amount: $${riskAmount.toFixed(2)}`);
    console.log(`  Target Notional: $${targetNotional.toFixed(2)}`);
    console.log(`  ASTER Quantity: ${asterQuantity.toFixed(6)} ASTER\n`);

    // 5. Check minimum notional
    if (targetNotional < 5) {
      throw new Error(`Target notional ($${targetNotional.toFixed(2)}) is below minimum ($5)`);
    }

    // 6. Open LONG position with smart precision
    console.log('🟢 Opening LONG position...');
    const longOrder = await client.placeMarketOrderSmart(SYMBOL, 'BUY', asterQuantity);
    
    console.log(`✅ LONG position opened:`);
    console.log(`  Order ID: ${longOrder.orderId}`);
    console.log(`  Quantity: ${longOrder.filledQty} ASTER`);
    console.log(`  Price: $${asterPrice.toFixed(4)}`);
    console.log(`  Notional: $${(parseFloat(longOrder.filledQty) * asterPrice).toFixed(2)}\n`);

    // 7. Wait briefly
    console.log('⏳ Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 8. Monitor position for 30 seconds
    console.log('📊 Monitoring position for 30 seconds...');
    const startTime = Date.now();
    const entryPrice = asterPrice;
    
    while (Date.now() - startTime < 30000) {
      try {
        const [currentPrice, positionAmount] = await Promise.all([
          client.getLastPrice(SYMBOL),
          client.getPositionAmount(SYMBOL)
        ]);

        const priceChange = ((currentPrice - entryPrice) / entryPrice) * 100;
        // For long positions: profit when price goes up, loss when price goes down
        const unrealizedPnL = positionAmount * (currentPrice - entryPrice);
        
        // Debug: show the calculation details
        const priceDiff = currentPrice - entryPrice;
        const pnlSign = unrealizedPnL >= 0 ? '+' : '';
        
        console.log(`📊 Position: ${positionAmount.toFixed(6)} ASTER | Price: $${currentPrice.toFixed(4)} | Change: ${priceChange.toFixed(2)}% | PnL: ${pnlSign}$${unrealizedPnL.toFixed(2)}`);
        console.log(`   Debug: Entry: $${entryPrice.toFixed(4)}, Current: $${currentPrice.toFixed(4)}, Diff: $${priceDiff.toFixed(4)}, PnL: $${unrealizedPnL.toFixed(2)}`);
        
        // Wait 5 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('Error monitoring position:', error.message);
        break;
      }
    }

    // 9. Close LONG position (SELL to close long)
    console.log('\n🔴 Closing LONG position...');
    const closeOrder = await client.placeMarketOrderSmart(
      SYMBOL, 
      'SELL',                   // SELL closes a long position
      longOrder.filledQty,      // Use exact quantity from opening order
      true                      // This is a reduce-only order
    );

    console.log(`✅ LONG position closed:`);
    console.log(`  Order ID: ${closeOrder.orderId}`);
    console.log(`  Quantity: ${closeOrder.filledQty} ASTER\n`);

    // 10. Final account status
    console.log('📊 Final Account Status:');
    const finalUsdtAvailable = await client.getAvailableBalance('USDT');
    const finalUsdtTotal = await client.getTotalBalance('USDT');
    const finalPosition = await client.getPositionAmount(SYMBOL);
    const pnl = finalUsdtAvailable - usdtAvailable;
    
    console.log(`💰 USDT Available: $${finalUsdtAvailable.toFixed(2)}`);
    console.log(`💰 USDT Total: $${finalUsdtTotal.toFixed(2)}`);
    console.log(`💼 Remaining Position: ${finalPosition.toFixed(6)} ASTER`);
    console.log(`📈 P&L: $${pnl.toFixed(2)}`);
    console.log(`✅ Position fully closed`);

    console.log('\n🎉 ASTER Long 10x Trade Completed!');

  } catch (error) {
    console.error('❌ Trade failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Run the ASTER long trade
asterLong10x().catch(console.error);



