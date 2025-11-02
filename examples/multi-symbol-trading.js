/**
 * Multi-Symbol Trading Example
 * Shows how to trade different symbols with correct precision
 * 
 * Run with: node examples/multi-symbol-trading.js
 */

import { AsterdexClient, precisionManager } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

async function multiSymbolTrading() {
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

  // Different symbols with their precision requirements
  const tradingPairs = [
    { symbol: 'ASTERUSDT', precision: 2, description: 'ASTER (2 decimal places)' },
    { symbol: 'SOLUSDT', precision: 2, description: 'SOL (2 decimal places)' },
    { symbol: 'BNBUSDT', precision: 2, description: 'BNB (2 decimal places)' },
    { symbol: 'ETHUSDT', precision: 3, description: 'ETH (3 decimal places)' },
    { symbol: 'BTCUSDT', precision: 3, description: 'BTC (3 decimal places)' }
  ];

  try {
    console.log('🚀 Multi-Symbol Trading Demo\n');

    for (const { symbol, precision, description } of tradingPairs) {
      console.log(`📊 ${symbol} - ${description}`);
      
      try {
        // Get current price
        const price = await client.getLastPrice(symbol);
        console.log(`  Current Price: $${price.toFixed(2)}`);
        
        // Set leverage
        await client.setLeverage(symbol, 5);
        console.log(`  ✅ Leverage set to 5x`);
        
        // Calculate test quantity with correct precision
        const testQuantity = 1.23456789; // Very precise number
        const smartQuantity = precisionManager.getSmartQuantity(symbol, testQuantity);
        
        console.log(`  Test Quantity: ${testQuantity} → ${smartQuantity.toFixed(precision)} (${precision} dp)`);
        
        // Show what would happen with wrong precision
        const wrongPrecision = precision === 2 ? 3 : 2;
        const wrongQuantity = Math.floor(testQuantity * Math.pow(10, wrongPrecision)) / Math.pow(10, wrongPrecision);
        console.log(`  Wrong Precision: ${wrongQuantity.toFixed(wrongPrecision)} (${wrongPrecision} dp) ❌`);
        
        console.log(`  ✅ Correct precision: ${precision} decimal places\n`);
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}\n`);
      }
    }

    // Show precision summary
    console.log('📋 Precision Summary:');
    console.log('┌─────────────┬─────────────┬─────────────────────────────────┐');
    console.log('│ Symbol      │ Precision   │ Example Quantities             │');
    console.log('├─────────────┼─────────────┼─────────────────────────────────┤');
    
    tradingPairs.forEach(({ symbol, precision }) => {
      const examples = [];
      if (precision === 0) {
        examples.push('1, 2, 3');
      } else if (precision === 1) {
        examples.push('0.1, 0.2, 0.3');
      } else if (precision === 2) {
        examples.push('0.01, 0.02, 0.03');
      } else if (precision === 3) {
        examples.push('0.001, 0.002, 0.003');
      }
      
      const symbolPadded = symbol.padEnd(12);
      const precisionPadded = `${precision} dp`.padEnd(11);
      const examplesPadded = examples.join(', ').padEnd(31);
      
      console.log(`│ ${symbolPadded} │ ${precisionPadded} │ ${examplesPadded} │`);
    });
    
    console.log('└─────────────┴─────────────┴─────────────────────────────────┘');

    console.log('\n🎯 Key Takeaways:');
    console.log('  • ASTER, SOL, BNB: Use 2 decimal places (0.01, 0.02, 0.03...)');
    console.log('  • ETH, BTC: Use 3 decimal places (0.001, 0.002, 0.003...)');
    console.log('  • Smart precision system handles this automatically');
    console.log('  • Always use placeMarketOrderSmart() for automatic precision');

    console.log('\n🎉 Multi-symbol trading demo completed!');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the multi-symbol trading demo
multiSymbolTrading().catch(console.error);



