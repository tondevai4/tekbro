import { useEffect, useState, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { useMarketMoodStore } from '../store/useMarketMoodStore';
import { initializeStocks, STOCK_CATALOG } from '../constants/stockData';
import { generateNewsEvent } from '../utils/NewsEngine';

/**
 * 🏛️ STOCK MARKET ENGINE V2: Macro-Economic State Machine
 * 
 * Core Logic:
 * 1. Macro Drivers: Interest Rates, GDP Growth, Inflation.
 * 2. State Machine:
 *    - EXPANSION: High GDP, Low Rates -> Bull Market
 *    - OVERHEATING: High GDP, High Inflation -> Rate Hikes -> Volatility
 *    - STAGFLATION: Low GDP, High Inflation -> Bear Market
 *    - RECESSION: Negative GDP, Low Rates -> Crash/Accumulation
 * 3. Earnings Season: Quarterly events where stocks beat/miss expectations.
 * 4. Fed Meetings: Simulated rate decisions.
 */

// Box-Muller Transform for Normal Distribution
const boxMullerRandom = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export const useMarketEngine = () => {
    const {
        setStocks,
        updateMarketPrices,
        setActiveNews,
    } = useStore();

    const {
        fearGreedIndex,
        marketCyclePhase,
        getSectorMultiplier,
        updateMarketEngine,
        tick,
        interestRate,
        gdpGrowth,
        inflation,
        setMacroMetrics
    } = useMarketMoodStore();

    const lastNewsTimeRef = useRef(Date.now());
    const driftRef = useRef<Record<string, number>>({});
    const tickCountRef = useRef(0);

    // 1. INITIALIZATION
    useEffect(() => {
        const currentStocks = useStore.getState().stocks;
        const needsReset = currentStocks.length !== STOCK_CATALOG.length ||
            currentStocks.some(s => !s || !s.price || s.price < 1);

        if (needsReset) {
            const initializedStocks = initializeStocks();
            setStocks(initializedStocks);
            initializedStocks.forEach(stock => {
                driftRef.current[stock.symbol] = (Math.random() - 0.5) * 0.002;
            });
        } else {
            currentStocks.forEach(stock => {
                if (driftRef.current[stock.symbol] === undefined) {
                    driftRef.current[stock.symbol] = (Math.random() - 0.5) * 0.002;
                }
            });
        }
    }, []);

    // 2. MACRO SIMULATION LOOP (Every 10s)
    useEffect(() => {
        const macroInterval = setInterval(() => {
            let newRate = interestRate;
            let newGDP = gdpGrowth;
            let newInflation = inflation;

            // Economic Logic
            // High Growth -> Higher Inflation
            if (gdpGrowth > 3.0) newInflation += 0.1;
            // High Inflation -> Rate Hikes (Fed Response)
            if (inflation > 3.0) newRate += 0.05;
            // High Rates -> Lower Growth (Cooling)
            if (interestRate > 4.0) newGDP -= 0.1;
            // Low Rates -> Higher Growth (Stimulus)
            if (interestRate < 2.0) newGDP += 0.1;

            // Mean Reversion (Economy tends to stabilize)
            newGDP = newGDP * 0.98 + 2.0 * 0.02; // Target 2% growth
            newInflation = newInflation * 0.98 + 2.0 * 0.02; // Target 2% inflation
            newRate = Math.max(0, Math.min(10, newRate)); // Clamp rates

            setMacroMetrics({
                interestRate: Number(newRate.toFixed(2)),
                gdpGrowth: Number(newGDP.toFixed(2)),
                inflation: Number(newInflation.toFixed(2))
            });

            // Calculate Average Market Return for Cycle Logic
            const currentStocks = useStore.getState().stocks;
            const avgReturn = currentStocks.length > 0 ? currentStocks.reduce((sum, s) => {
                const startPrice = s.history.length > 0 ? s.history[0].value : s.price;
                return sum + ((s.price - startPrice) / startPrice);
            }, 0) / currentStocks.length : 0;

            // TRIGGER CYCLE TRANSITION CHECK
            // checkCycleTransition(avgReturn); // Deprecated in V2 Engine

        }, 10000);

        return () => clearInterval(macroInterval);
    }, [interestRate, gdpGrowth, inflation]);

    // 3. MAIN MARKET LOOP (1s Ticks)
    useEffect(() => {
        const interval = setInterval(() => {
            const currentStocks = useStore.getState().stocks;
            // 0. RE-INITIALIZATION CHECK
            if (currentStocks.length === 0) {
                const initializedStocks = initializeStocks();
                setStocks(initializedStocks);
                initializedStocks.forEach(stock => {
                    driftRef.current[stock.symbol] = (Math.random() - 0.5) * 0.002;
                });
                return;
            }

            const priceUpdates: Record<string, number> = {};

            // --- FEAR & GREED DRIVER ---
            // The "Heartbeat" of the market. 
            // 0-20: Extreme Fear (Crash/Dump)
            // 21-40: Fear (Bearish/Correction)
            // 41-60: Neutral (Chop/Sideways)
            // 61-80: Greed (Bullish/Rally)
            // 81-100: Extreme Greed (Euphoria/Pump)

            // Base bias: -0.3% to +0.3% per tick based on F&G
            // This ensures strict correlation: Low F&G = Red Candles, High F&G = Green Candles
            const sentimentBias = ((fearGreedIndex - 50) / 50) * 0.003;

            currentStocks.forEach(stock => {
                // 1. Evolve Drift (Trend)
                const driftChange = (Math.random() - 0.5) * 0.0005;
                let currentDrift = (driftRef.current[stock.symbol] || 0) + driftChange;
                currentDrift *= 0.99; // Mean reversion
                driftRef.current[stock.symbol] = currentDrift;

                // 2. Volatility (Fat Tail)
                // Higher volatility when F&G is extreme (Fear OR Greed)
                const extremeFactor = Math.abs(fearGreedIndex - 50) / 50; // 0 to 1
                const baseStock = STOCK_CATALOG.find(s => s.symbol === stock.symbol);
                const volatility = (baseStock?.volatility || 1.0) * (0.005 + (extremeFactor * 0.005));
                const noise = boxMullerRandom() * volatility;

                // 3. Sector Sensitivity
                // Tech/Crypto/Consumer are "Risk On" (High Beta) - they move MORE with F&G
                // Utilities/Healthcare are "Risk Off" (Low Beta) - they move LESS
                let beta = 1.0;
                if (stock.sector === 'Tech' || stock.sector === 'Consumer') beta = 1.5;
                if (stock.sector === 'Healthcare' || stock.sector === 'Energy') beta = 0.7;

                // 4. Calculate Move
                // Move = (Sentiment * Beta) + Noise + Drift
                const percentChange = (sentimentBias * beta) + noise + currentDrift;
                let newPrice = stock.price * (1 + percentChange);

                // --- SMART FLOOR LOGIC ---
                const basePrice = baseStock?.price || 10;
                const hardFloor = basePrice * 0.20; // 20% of base price is the floor

                if (newPrice < hardFloor) {
                    newPrice = hardFloor;
                    // Bounce off the floor!
                    driftRef.current[stock.symbol] = Math.abs(driftRef.current[stock.symbol]) * 0.5 + 0.005;
                }

                // --- SMART CEILING LOGIC ---
                let ceilingMult = 50;
                if (gdpGrowth < 0) ceilingMult = 1.5; // Recession cap

                const hardCeiling = basePrice * ceilingMult;
                if (newPrice > hardCeiling) {
                    newPrice = hardCeiling;
                    driftRef.current[stock.symbol] = -Math.abs(driftRef.current[stock.symbol]) * 0.5 - 0.002;
                }

                // Safety Clamps
                if (isNaN(newPrice)) newPrice = stock.price;
                newPrice = Math.max(0.01, Math.min(100000, newPrice));

                priceUpdates[stock.symbol] = newPrice;
            });

            updateMarketPrices(priceUpdates);

            // Update Mood Metrics
            const stocksAboveMA = currentStocks.filter(s => {
                const recent = s.history.slice(-10).map(h => h.value);
                const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
                return s.price > avg;
            }).length;

            let newHighs = 0, newLows = 0, risingVol = 0, fallingVol = 0;
            currentStocks.forEach(s => {
                const recent = s.history.slice(-50).map(h => h.value);
                const max = Math.max(...recent);
                const min = Math.min(...recent);
                if (s.price >= max * 0.99) newHighs++;
                if (s.price <= min * 1.01) newLows++;

                const prev = s.history.length > 1 ? s.history[s.history.length - 2].value : s.price;
                const vol = Math.abs(s.price - prev) * 1000;
                if (s.price > prev) risingVol += vol;
                else fallingVol += vol;
            });

            const avgVol = currentStocks.reduce((sum, s) => {
                const base = STOCK_CATALOG.find(b => b.symbol === s.symbol);
                return sum + ((base?.volatility || 1) * 100);
            }, 0) / currentStocks.length;

            const { cash, holdings } = useStore.getState();
            const totalEquity = cash + Object.values(holdings).reduce((sum, h) => {
                const s = currentStocks.find(st => st.symbol === h.symbol);
                return sum + (s ? h.quantity * s.price : 0);
            }, 0);
            const cashPct = totalEquity > 0 ? cash / totalEquity : 0.5;

            // Feedback Loop: Market performance feeds back into F&G
            // But heavily damped to prevent runaway feedback loops
            updateMarketEngine({
                stocksAboveMA,
                totalStocks: currentStocks.length,
                newHighs,
                newLows,
                risingVolume: risingVol,
                fallingVolume: fallingVol,
                averageVolatility: avgVol,
                cashPercentage: cashPct,
                momentum: (risingVol - fallingVol) / (risingVol + fallingVol + 1) * 100 // Calculated momentum
            });

            tick();

        }, 1000);

        return () => clearInterval(interval);
    }, [fearGreedIndex, interestRate, gdpGrowth]); // Re-bind on F&G change

    // 4. NEWS SYSTEM
    useEffect(() => {
        const checkNews = () => {
            const timeSinceLastNews = Date.now() - lastNewsTimeRef.current;
            if (timeSinceLastNews > 120000) { // 2 mins
                const currentStocks = useStore.getState().stocks;
                if (currentStocks.length === 0) return;

                const news = generateNewsEvent(currentStocks);
                if (news) {
                    setActiveNews(news);
                    lastNewsTimeRef.current = Date.now();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    // News Impact Logic
                    const priceUpdates: Record<string, number> = {};
                    currentStocks.forEach(stock => {
                        let impact = 0;
                        if (news.type === 'COMPANY' && news.symbol === stock.symbol) impact = news.impact;
                        else if (news.type === 'SECTOR' && news.sector === stock.sector) impact = news.impact * 0.8;
                        else if (news.type === 'MARKET') impact = news.impact * 0.5;

                        if (impact !== 0) {
                            priceUpdates[stock.symbol] = stock.price * (1 + impact);
                            // Permanent Drift Shift
                            if (driftRef.current[stock.symbol] !== undefined) {
                                driftRef.current[stock.symbol] += impact * 0.1;
                            }
                        }
                    });

                    if (Object.keys(priceUpdates).length > 0) {
                        updateMarketPrices(priceUpdates);
                    }
                }
            }
        };
        const newsInterval = setInterval(checkNews, 5000);
        return () => clearInterval(newsInterval);
    }, []);

    // Optimization: Stable callback
    const dismissEvent = useRef(() => setActiveNews(null)).current;

    return {
        dismissEvent
    };
};
