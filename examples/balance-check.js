/**
 * Balance checking example for AsterDEX API Client
 * This example demonstrates how to check various balance types
 * Run with: node examples/balance-check.js
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkBalances() {
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

  try {
    console.log('💰 AsterDEX Balance Checker\n');

    // Get all balance information
    console.log('📊 Getting all balance information...\n');
    
    const [allBalances, usdtAvailable, usdtTotal, usdtCross, btcAvailable, ethAvailable] = await Promise.all([
      client.getBalance(),
      client.getAvailableBalance('USDT'),
      client.getTotalBalance('USDT'),
      client.getCrossWalletBalance('USDT'),
      client.getAvailableBalance('BTC'),
      client.getAvailableBalance('ETH')
    ]);

    // Display USDT balances
    console.log('💵 USDT Balances:');
    console.log(`  Available: $${usdtAvailable.toFixed(2)} (for trading)`);
    console.log(`  Total: $${usdtTotal.toFixed(2)}`);
    console.log(`  Cross Wallet: $${usdtCross.toFixed(2)}`);
    console.log(`  Difference (Total - Available): $${(usdtTotal - usdtAvailable).toFixed(2)}\n`);

    // Display other asset balances
    console.log('🪙 Other Asset Balances:');
    if (btcAvailable > 0) {
      console.log(`  BTC Available: ${btcAvailable.toFixed(8)} BTC`);
    } else {
      console.log('  BTC Available: 0.00000000 BTC');
    }
    
    if (ethAvailable > 0) {
      console.log(`  ETH Available: ${ethAvailable.toFixed(6)} ETH`);
    } else {
      console.log('  ETH Available: 0.000000 ETH');
    }
    console.log();

    // Display all balances from the raw API response
    console.log('📋 All Balances (Raw API Response):');
    allBalances.forEach(balance => {
      const available = parseFloat(balance.availableBalance || '0');
      const total = parseFloat(balance.balance || '0');
      const cross = parseFloat(balance.crossWalletBalance || '0');
      
      if (available > 0 || total > 0) {
        console.log(`  ${balance.asset}:`);
        console.log(`    Available: ${available.toFixed(8)}`);
        console.log(`    Total: ${total.toFixed(8)}`);
        console.log(`    Cross Wallet: ${cross.toFixed(8)}`);
        console.log(`    Margin Available: ${balance.marginAvailable}`);
        console.log();
      }
    });

    // Check if we have enough balance for trading
    console.log('🔍 Trading Readiness Check:');
    const minTradingBalance = 10; // Minimum $10 for trading
    
    if (usdtAvailable >= minTradingBalance) {
      console.log(`✅ Ready for trading! Available: $${usdtAvailable.toFixed(2)}`);
      
      // Calculate potential position sizes
      const btcPrice = await client.getLastPrice('BTCUSDT');
      const maxBtcQuantity = usdtAvailable / btcPrice;
      
      console.log(`📊 Potential position sizes:`);
      console.log(`  BTC: ${maxBtcQuantity.toFixed(6)} BTC (at $${btcPrice.toFixed(2)})`);
      console.log(`  With 10x leverage: ${(maxBtcQuantity * 10).toFixed(6)} BTC`);
    } else {
      console.log(`❌ Insufficient balance for trading. Available: $${usdtAvailable.toFixed(2)}, Required: $${minTradingBalance}`);
    }

    // Check cross wallet balance (for cross-margin mode)
    console.log('\n🔄 Cross Margin Analysis:');
    if (usdtCross > 0) {
      console.log(`Cross wallet balance: $${usdtCross.toFixed(2)}`);
      console.log('This balance can be used across all positions in cross-margin mode.');
    } else {
      console.log('No cross wallet balance available.');
    }

    // Show account summary
    console.log('\n📈 Account Summary:');
    const accountInfo = await client.getAccountInfo();
    console.log(`Total Wallet Balance: $${parseFloat(accountInfo.totalWalletBalance || '0').toFixed(2)}`);
    console.log(`Total Margin Balance: $${parseFloat(accountInfo.totalMarginBalance || '0').toFixed(2)}`);
    console.log(`Total Unrealized PnL: $${parseFloat(accountInfo.totalUnrealizedPnl || '0').toFixed(2)}`);

    console.log('\n✅ Balance check completed!');

  } catch (error) {
    console.error('❌ Balance check failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Run the balance check
checkBalances().catch(console.error);
