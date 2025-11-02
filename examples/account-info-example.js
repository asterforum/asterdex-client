/**
 * Account Information Example
 * Demonstrates comprehensive account information and position management
 * 
 * Run with: node examples/account-info-example.js
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

async function accountInfoExample() {
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

  try {
    console.log('📊 Account Information Example\n');

    // 1. Get comprehensive account information
    console.log('🔍 Getting Account Information...');
    const accountInfo = await client.getAccountInfo();
    
    console.log('📋 Account Overview:');
    console.log(`  Fee Tier: ${accountInfo.feeTier}`);
    console.log(`  Can Trade: ${accountInfo.canTrade ? '✅' : '❌'}`);
    console.log(`  Can Deposit: ${accountInfo.canDeposit ? '✅' : '❌'}`);
    console.log(`  Can Withdraw: ${accountInfo.canWithdraw ? '✅' : '❌'}`);
    console.log('');

    // 2. Display total balances
    console.log('💰 Total Balances:');
    console.log(`  Total Wallet Balance: $${parseFloat(accountInfo.totalWalletBalance).toFixed(2)}`);
    console.log(`  Total Margin Balance: $${parseFloat(accountInfo.totalMarginBalance).toFixed(2)}`);
    console.log(`  Available Balance: $${parseFloat(accountInfo.availableBalance).toFixed(2)}`);
    console.log(`  Max Withdraw Amount: $${parseFloat(accountInfo.maxWithdrawAmount).toFixed(2)}`);
    console.log(`  Total Unrealized PnL: $${parseFloat(accountInfo.totalUnrealizedProfit).toFixed(2)}`);
    console.log('');

    // 3. Display margin information
    console.log('📊 Margin Information:');
    console.log(`  Total Initial Margin: $${parseFloat(accountInfo.totalInitialMargin).toFixed(2)}`);
    console.log(`  Total Maintenance Margin: $${parseFloat(accountInfo.totalMaintMargin).toFixed(2)}`);
    console.log(`  Position Initial Margin: $${parseFloat(accountInfo.totalPositionInitialMargin).toFixed(2)}`);
    console.log(`  Open Order Initial Margin: $${parseFloat(accountInfo.totalOpenOrderInitialMargin).toFixed(2)}`);
    console.log('');

    // 4. Display asset information
    console.log('💎 Asset Information:');
    if (accountInfo.assets && accountInfo.assets.length > 0) {
      accountInfo.assets.forEach(asset => {
        console.log(`  ${asset.asset}:`);
        console.log(`    Wallet Balance: ${parseFloat(asset.walletBalance).toFixed(8)} ${asset.asset}`);
        console.log(`    Available Balance: ${parseFloat(asset.availableBalance).toFixed(8)} ${asset.asset}`);
        console.log(`    Margin Balance: ${parseFloat(asset.marginBalance).toFixed(8)} ${asset.asset}`);
        console.log(`    Unrealized PnL: ${parseFloat(asset.unrealizedProfit).toFixed(8)} ${asset.asset}`);
        console.log(`    Max Withdraw: ${parseFloat(asset.maxWithdrawAmount).toFixed(8)} ${asset.asset}`);
        console.log(`    Margin Available: ${asset.marginAvailable ? '✅' : '❌'}`);
        console.log('');
      });
    } else {
      console.log('  No assets found');
    }

    // 5. Display positions
    console.log('📈 Position Information:');
    const positions = await client.getPositions();
    
    if (positions && positions.length > 0) {
      const activePositions = positions.filter(pos => parseFloat(pos.positionAmt) !== 0);
      
      if (activePositions.length > 0) {
        console.log(`  Found ${activePositions.length} active positions:`);
        activePositions.forEach(position => {
          const positionAmt = parseFloat(position.positionAmt);
          const side = positionAmt > 0 ? 'LONG' : 'SHORT';
          const size = Math.abs(positionAmt);
          
          console.log(`    ${position.symbol}:`);
          console.log(`      Side: ${side}`);
          console.log(`      Size: ${size.toFixed(8)} ${position.symbol.replace('USDT', '')}`);
          console.log(`      Entry Price: $${parseFloat(position.entryPrice).toFixed(5)}`);
          console.log(`      Leverage: ${position.leverage}x`);
          const unrealizedPnL = parseFloat(position.unRealizedProfit || position.unrealizedProfit || '0');
        const pnlDisplay = isNaN(unrealizedPnL) ? '0.00' : unrealizedPnL.toFixed(2);
        console.log(`      Unrealized PnL: $${pnlDisplay}`);
          console.log(`      Isolated: ${position.isolated ? 'Yes' : 'No'}`);
          console.log('');
        });
      } else {
        console.log('  No active positions found');
      }
    } else {
      console.log('  No positions found');
    }

    // 6. Get positions for specific symbols
    console.log('🎯 Symbol-Specific Position Check:');
    const symbolsToCheck = ['ASTERUSDT', 'BTCUSDT', 'ETHUSDT'];
    
    for (const symbol of symbolsToCheck) {
      const symbolPositions = await client.getPositions(symbol);
      const activePosition = symbolPositions.find(pos => parseFloat(pos.positionAmt) !== 0);
      
      if (activePosition) {
        const positionAmt = parseFloat(activePosition.positionAmt);
        const side = positionAmt > 0 ? 'LONG' : 'SHORT';
        const size = Math.abs(positionAmt);
        
        console.log(`  ${symbol}: ${side} ${size.toFixed(8)} at $${parseFloat(activePosition.entryPrice).toFixed(5)}`);
      } else {
        console.log(`  ${symbol}: No position`);
      }
    }
    console.log('');

    // 7. Show account summary
    console.log('📊 Account Summary:');
    const totalBalance = parseFloat(accountInfo.totalWalletBalance);
    const availableBalance = parseFloat(accountInfo.availableBalance);
    const unrealizedPnL = parseFloat(accountInfo.totalUnrealizedProfit);
    const usedBalance = totalBalance - availableBalance;
    const usagePercent = (usedBalance / totalBalance) * 100;
    
    console.log(`  Total Balance: $${totalBalance.toFixed(2)}`);
    console.log(`  Available: $${availableBalance.toFixed(2)} (${(100 - usagePercent).toFixed(1)}%)`);
    console.log(`  Used: $${usedBalance.toFixed(2)} (${usagePercent.toFixed(1)}%)`);
    console.log(`  Unrealized PnL: $${unrealizedPnL.toFixed(2)}`);
    console.log(`  Account Status: ${accountInfo.canTrade ? 'Active' : 'Restricted'}`);
    
    if (unrealizedPnL > 0) {
      console.log(`  🟢 Total PnL: +$${unrealizedPnL.toFixed(2)} (Profit)`);
    } else if (unrealizedPnL < 0) {
      console.log(`  🔴 Total PnL: $${unrealizedPnL.toFixed(2)} (Loss)`);
    } else {
      console.log(`  ⚪ Total PnL: $${unrealizedPnL.toFixed(2)} (Break-even)`);
    }

    console.log('\n✅ Account information example completed!');

  } catch (error) {
    console.error('❌ Example failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Run the account information example
accountInfoExample().catch(console.error);
