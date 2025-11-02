/**
 * Technical Analysis Example
 * Demonstrates basic technical analysis using klines data
 * 
 * Run with: node examples/technical-analysis-example.js
 */

import { AsterdexClient } from '../index.js';
import dotenv from 'dotenv';

dotenv.config();

async function technicalAnalysisExample() {
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
    console.log('📊 Technical Analysis Example\n');

    // 1. Get recent 1-hour klines for analysis
    const klines = await client.getKlines(SYMBOL, '1h', { limit: 24 });
    
    console.log('📈 ASTER 24h Hourly Analysis:');
    console.log('');

    // 2. Calculate basic technical indicators
    const prices = klines.map(kline => parseFloat(kline[4])); // Close prices
    const volumes = klines.map(kline => parseFloat(kline[5])); // Volumes
    
    // Simple Moving Average (SMA)
    const sma5 = calculateSMA(prices, 5);
    const sma10 = calculateSMA(prices, 10);
    const sma20 = calculateSMA(prices, 20);
    
    console.log('📊 Moving Averages:');
    console.log(`  SMA 5:  $${sma5.toFixed(4)}`);
    console.log(`  SMA 10: $${sma10.toFixed(4)}`);
    console.log(`  SMA 20: $${sma20.toFixed(4)}`);
    console.log('');

    // 3. Price analysis
    const currentPrice = prices[prices.length - 1];
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    const priceRange = highestPrice - lowestPrice;
    const pricePosition = ((currentPrice - lowestPrice) / priceRange) * 100;
    
    console.log('💰 Price Analysis:');
    console.log(`  Current Price: $${currentPrice.toFixed(4)}`);
    console.log(`  24h High: $${highestPrice.toFixed(4)}`);
    console.log(`  24h Low: $${lowestPrice.toFixed(4)}`);
    console.log(`  Price Range: $${priceRange.toFixed(4)}`);
    console.log(`  Position in Range: ${pricePosition.toFixed(1)}%`);
    console.log('');

    // 4. Volume analysis
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;
    
    console.log('📊 Volume Analysis:');
    console.log(`  Current Volume: ${currentVolume.toFixed(2)} ASTER`);
    console.log(`  Average Volume: ${avgVolume.toFixed(2)} ASTER`);
    console.log(`  Volume Ratio: ${volumeRatio.toFixed(2)}x ${volumeRatio > 1.5 ? '🔥' : volumeRatio < 0.5 ? '📉' : '📊'}`);
    console.log('');

    // 5. Trend analysis
    const trend = analyzeTrend(prices);
    console.log('📈 Trend Analysis:');
    console.log(`  Trend: ${trend.direction} ${trend.strength}`);
    console.log(`  Support: $${trend.support.toFixed(4)}`);
    console.log(`  Resistance: $${trend.resistance.toFixed(4)}`);
    console.log('');

    // 6. RSI calculation
    const rsi = calculateRSI(prices, 14);
    console.log('📊 Technical Indicators:');
    console.log(`  RSI (14): ${rsi.toFixed(2)} ${getRSISignal(rsi)}`);
    console.log('');

    // 7. Trading signals
    const signals = generateTradingSignals(prices, sma5, sma10, sma20, rsi);
    console.log('🎯 Trading Signals:');
    signals.forEach(signal => {
      console.log(`  ${signal.type}: ${signal.message} ${signal.strength}`);
    });
    console.log('');

    // 8. Recent price action
    console.log('📈 Recent Price Action (Last 5 Hours):');
    klines.slice(-5).forEach((kline, index) => {
      const [openTime, open, high, low, close, volume] = kline;
      const openDate = new Date(parseInt(openTime));
      const priceChange = ((parseFloat(close) - parseFloat(open)) / parseFloat(open)) * 100;
      const changeColor = priceChange >= 0 ? '🟢' : '🔴';
      
      console.log(`  ${index + 1}. ${openDate.toLocaleTimeString()} ${changeColor}`);
      console.log(`     O: $${parseFloat(open).toFixed(4)} | H: $${parseFloat(high).toFixed(4)} | L: $${parseFloat(low).toFixed(4)} | C: $${parseFloat(close).toFixed(4)}`);
      console.log(`     Change: ${priceChange.toFixed(2)}% | Volume: ${parseFloat(volume).toFixed(2)} ASTER`);
      console.log('');
    });

    console.log('✅ Technical analysis completed!');

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Helper functions for technical analysis
function calculateSMA(prices, period) {
  if (prices.length < period) return prices[prices.length - 1];
  const recentPrices = prices.slice(-period);
  return recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
}

function calculateRSI(prices, period) {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function analyzeTrend(prices) {
  const recent = prices.slice(-10);
  const older = prices.slice(-20, -10);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  let direction = 'Sideways';
  let strength = 'Weak';
  
  if (change > 2) {
    direction = 'Bullish';
    strength = change > 5 ? 'Strong' : 'Moderate';
  } else if (change < -2) {
    direction = 'Bearish';
    strength = change < -5 ? 'Strong' : 'Moderate';
  }
  
  const support = Math.min(...recent);
  const resistance = Math.max(...recent);
  
  return { direction, strength, support, resistance };
}

function getRSISignal(rsi) {
  if (rsi > 70) return '🔴 Overbought';
  if (rsi < 30) return '🟢 Oversold';
  if (rsi > 50) return '🟡 Bullish';
  return '🟡 Bearish';
}

function generateTradingSignals(prices, sma5, sma10, sma20, rsi) {
  const signals = [];
  const currentPrice = prices[prices.length - 1];
  
  // Moving average signals
  if (sma5 > sma10 && sma10 > sma20) {
    signals.push({
      type: '🟢 BUY',
      message: 'Golden Cross - All MAs aligned upward',
      strength: 'Strong'
    });
  } else if (sma5 < sma10 && sma10 < sma20) {
    signals.push({
      type: '🔴 SELL',
      message: 'Death Cross - All MAs aligned downward',
      strength: 'Strong'
    });
  }
  
  // Price vs MA signals
  if (currentPrice > sma20) {
    signals.push({
      type: '🟢 BUY',
      message: 'Price above SMA20 - Bullish trend',
      strength: 'Moderate'
    });
  } else {
    signals.push({
      type: '🔴 SELL',
      message: 'Price below SMA20 - Bearish trend',
      strength: 'Moderate'
    });
  }
  
  // RSI signals
  if (rsi < 30) {
    signals.push({
      type: '🟢 BUY',
      message: 'RSI oversold - Potential reversal',
      strength: 'Strong'
    });
  } else if (rsi > 70) {
    signals.push({
      type: '🔴 SELL',
      message: 'RSI overbought - Potential reversal',
      strength: 'Strong'
    });
  }
  
  return signals;
}

// Run the technical analysis example
technicalAnalysisExample().catch(console.error);

