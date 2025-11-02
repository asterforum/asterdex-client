/**
 * Get Klines Example
 * Demonstrates how to fetch candlestick/kline data for technical analysis
 * 
 * Run with: node examples/get-klines-example.js
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

async function getKlinesExample() {
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

  const SYMBOL = 'ASTERUSDT';

  try {
    console.log('📊 Get Klines Example\n');

    // 1. Get recent 1-minute klines (last 10 candles)
    console.log('🕐 Recent 1-minute klines (last 10 candles):');
    const recentKlines = await client.getKlines(SYMBOL, '1m', { limit: 10 });
    
    console.log('📈 Recent ASTER 1m Klines:');
    recentKlines.forEach((kline, index) => {
      const [openTime, open, high, low, close, volume, closeTime, quoteVolume, trades, takerBuyBase, takerBuyQuote] = kline;
      const openDate = new Date(parseInt(openTime));
      const closeDate = new Date(parseInt(closeTime));
      
      console.log(`  ${index + 1}. ${openDate.toISOString()}`);
      console.log(`     Open: $${parseFloat(open).toFixed(4)} | High: $${parseFloat(high).toFixed(4)} | Low: $${parseFloat(low).toFixed(4)} | Close: $${parseFloat(close).toFixed(4)}`);
      console.log(`     Volume: ${parseFloat(volume).toFixed(2)} ASTER | Trades: ${trades}`);
      console.log('');
    });

    // 2. Get 1-hour klines for the last 24 hours
    console.log('🕐 1-hour klines (last 24 hours):');
    const hourlyKlines = await client.getKlines(SYMBOL, '1h', { limit: 24 });
    
    console.log('📈 ASTER 1h Klines (24h):');
    hourlyKlines.slice(0, 5).forEach((kline, index) => {
      const [openTime, open, high, low, close, volume] = kline;
      const openDate = new Date(parseInt(openTime));
      const priceChange = ((parseFloat(close) - parseFloat(open)) / parseFloat(open)) * 100;
      const changeColor = priceChange >= 0 ? '🟢' : '🔴';
      
      console.log(`  ${index + 1}. ${openDate.toISOString()} ${changeColor}`);
      console.log(`     O: $${parseFloat(open).toFixed(4)} | H: $${parseFloat(high).toFixed(4)} | L: $${parseFloat(low).toFixed(4)} | C: $${parseFloat(close).toFixed(4)}`);
      console.log(`     Change: ${priceChange.toFixed(2)}% | Volume: ${parseFloat(volume).toFixed(2)} ASTER`);
      console.log('');
    });

    // 3. Get daily klines for the last 7 days
    console.log('📅 Daily klines (last 7 days):');
    const dailyKlines = await client.getKlines(SYMBOL, '1d', { limit: 7 });
    
    console.log('📈 ASTER Daily Klines (7 days):');
    dailyKlines.forEach((kline, index) => {
      const [openTime, open, high, low, close, volume] = kline;
      const openDate = new Date(parseInt(openTime));
      const priceChange = ((parseFloat(close) - parseFloat(open)) / parseFloat(open)) * 100;
      const changeColor = priceChange >= 0 ? '🟢' : '🔴';
      
      console.log(`  ${index + 1}. ${openDate.toDateString()} ${changeColor}`);
      console.log(`     O: $${parseFloat(open).toFixed(4)} | H: $${parseFloat(high).toFixed(4)} | L: $${parseFloat(low).toFixed(4)} | C: $${parseFloat(close).toFixed(4)}`);
      console.log(`     Change: ${priceChange.toFixed(2)}% | Volume: ${parseFloat(volume).toFixed(2)} ASTER`);
      console.log('');
    });

    // 4. Get klines for a specific time range
    console.log('⏰ Klines for specific time range:');
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1 hour ago
    const timeRangeKlines = await client.getKlines(SYMBOL, '5m', {
      startTime: oneHourAgo,
      endTime: now,
      limit: 12 // 12 x 5min = 1 hour
    });
    
    console.log('📈 ASTER 5m Klines (last hour):');
    timeRangeKlines.forEach((kline, index) => {
      const [openTime, open, high, low, close, volume] = kline;
      const openDate = new Date(parseInt(openTime));
      const priceChange = ((parseFloat(close) - parseFloat(open)) / parseFloat(open)) * 100;
      const changeColor = priceChange >= 0 ? '🟢' : '🔴';
      
      console.log(`  ${index + 1}. ${openDate.toLocaleTimeString()} ${changeColor}`);
      console.log(`     O: $${parseFloat(open).toFixed(4)} | H: $${parseFloat(high).toFixed(4)} | L: $${parseFloat(low).toFixed(4)} | C: $${parseFloat(close).toFixed(4)}`);
      console.log(`     Change: ${priceChange.toFixed(2)}% | Volume: ${parseFloat(volume).toFixed(2)} ASTER`);
      console.log('');
    });

    // 5. Show available intervals
    console.log('📊 Available Kline Intervals:');
    const intervals = [
      '1m', '3m', '5m', '15m', '30m',  // Minutes
      '1h', '2h', '4h', '6h', '8h', '12h',  // Hours
      '1d', '3d', '1w', '1M'  // Days, Weeks, Months
    ];
    
    intervals.forEach(interval => {
      console.log(`  ${interval}`);
    });

    // 6. Show kline data structure
    console.log('\n📋 Kline Data Structure:');
    console.log('Each kline array contains:');
    console.log('  [0] Open Time (timestamp)');
    console.log('  [1] Open Price');
    console.log('  [2] High Price');
    console.log('  [3] Low Price');
    console.log('  [4] Close Price');
    console.log('  [5] Volume');
    console.log('  [6] Close Time (timestamp)');
    console.log('  [7] Quote Asset Volume');
    console.log('  [8] Number of Trades');
    console.log('  [9] Taker Buy Base Asset Volume');
    console.log('  [10] Taker Buy Quote Asset Volume');
    console.log('  [11] Ignore');

    console.log('\n✅ Get Klines example completed!');

  } catch (error) {
    console.error('❌ Example failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Run the get klines example
getKlinesExample().catch(console.error);

