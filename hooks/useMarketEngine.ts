import { useEffect, useState, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { useMarketMoodStore } from '../store/useMarketMoodStore';
import { initializeStocks, STOCK_CATALOG } from '../constants/stockData';
import { generateNewsEvent } from '../utils/NewsEngine';

/**
 * 🎲 THE GUMPTION ENGINE (Market V3)
 * 
 * Philosophy: "Organic Chaos"
 * - No scripted "Rally Modes".
 * - Stocks follow a Random Walk with Drift.
 * - "Fat Tails": Uses Gaussian (Normal) distribution for RNG. Most moves are small, but rare events are HUGE.
 * - Drift: Each stock has a hidden "trend" that evolves slowly.
 * - News: News events "kick" the drift, changing the future path.
 */

// Box-Muller Transform: Generates numbers with a Normal Distribution (Bell Curve)
// Mean = 0, Variance = 1
// Returns values mostly between -2 and 2, but can go higher (The "Fat Tail")
const boxMullerRandom = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
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
        updateMood,
        tick,
        checkCycleTransition
    } = useMarketMoodStore();

    const lastNewsTimeRef = useRef(Date.now());

    // 🌊 DRIFT SYSTEM: The hidden "Current" of the stock
    // Positive = Bullish trend, Negative = Bearish trend
    // This value itself "walks" randomly over time.
    const driftRef = useRef<Record<string, number>>({});

    // Initialize stocks and drift
    useEffect(() => {
        const currentStocks = useStore.getState().stocks;
        const needsReset = currentStocks.length !== STOCK_CATALOG.length ||
            currentStocks.some(s => !s || !s.price || s.price < 1 || !s.history || s.history.length === 0);

        if (needsReset) {
            const initializedStocks = initializeStocks();
            setStocks(initializedStocks);

            // Initialize random drift
            initializedStocks.forEach(stock => {
                driftRef.current[stock.symbol] = (Math.random() - 0.5) * 0.002;
            });
        } else {
            // Hydrate drift for existing stocks if missing
            currentStocks.forEach(stock => {
                if (driftRef.current[stock.symbol] === undefined) {
                    driftRef.current[stock.symbol] = (Math.random() - 0.5) * 0.002;
                }
            });
        }
    }, []);

    // ⚡ THE GAME LOOP (1s Updates - Faster for organic feel)
    useEffect(() => {
        const interval = setInterval(() => {
            const currentStocks = useStore.getState().stocks;
            if (currentStocks.length === 0) return;

            const priceUpdates: Record<string, number> = {};

            currentStocks.forEach(stock => {
                if (!stock || !stock.price) return;

                // 1. Evolve the Drift (The Trend)
                // The drift itself takes a random walk, making trends persist but eventually turn
                const driftChange = (Math.random() - 0.5) * 0.0005;
                let currentDrift = (driftRef.current[stock.symbol] || 0) + driftChange;

                // Mean Reversion for Drift: Pull it slightly back to 0 so it doesn't explode
                currentDrift *= 0.99;
                driftRef.current[stock.symbol] = currentDrift;

                // 2. Calculate Volatility Component (The Noise)
                // Use Box-Muller for "Fat Tail" risks
                const baseStock = STOCK_CATALOG.find(s => s.symbol === stock.symbol);
                const volatility = (baseStock?.volatility || 1.0) * 0.008; // Base volatility scaling
                const noise = boxMullerRandom() * volatility;

                // 2. Get mood and sector biases
                const moodDirectionBias = (fearGreedIndex - 50) / 5000; // ±0.01 max
                const sectorBias = getSectorMultiplier(stock.sector as any, marketCyclePhase);

                // 3. Calculate Final Move
                // Move = Drift + Noise + Mood Bias + Sector Bias
                const percentChange = currentDrift + noise + moodDirectionBias + sectorBias;

                // 4. Update Price
                let newPrice = stock.price * (1 + percentChange);

                // Safety clamps
                const maxPrice = (baseStock?.price || 100) * 20;
                const minPrice = 1.00; // Penny stock floor
                newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

                priceUpdates[stock.symbol] = newPrice;
            });

            updateMarketPrices(priceUpdates);

            // 🌡️ UPDATE MARKET MOOD (Feed data to central mood store)
            const stocksAboveMA = currentStocks.filter(s => {
                // Simple check: is current price above recent average?
                const recentPrices = s.history.slice(-10).map(h => h.value);
                const avg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
                return s.price > avg;
            }).length;

            // Calculate new highs/lows (stocks within 2% of recent extremes)
            let newHighs = 0;
            let newLows = 0;
            let risingVol = 0;
            let fallingVol = 0;
            let totalVol = 0;

            currentStocks.forEach(s => {
                const recentPrices = s.history.slice(-50).map(h => h.value);
                const max = Math.max(...recentPrices);
                const min = Math.min(...recentPrices);

                if (s.price >= max * 0.98) newHighs++;
                if (s.price <= min * 1.02) newLows++;

                // Track volume by direction
                const prevPrice = s.history.length > 1 ? s.history[s.history.length - 2].value : s.price;
                const isRising = s.price > prevPrice;
                const vol = Math.abs(s.price - prevPrice) * 1000; // Simplified volume

                totalVol += vol;
                if (isRising) risingVol += vol;
                else fallingVol += vol;
            });

            // Calculate average volatility
            const volatilities = currentStocks.map(s => {
                const baseStock = STOCK_CATALOG.find(bs => bs.symbol === s.symbol);
                return (baseStock?.volatility || 1.0) * 100;
            });
            const avgVol = volatilities.reduce((sum, v) => sum + v, 0) / volatilities.length;

            // Get cash percentage from main store
            const { cash, holdings } = useStore.getState();
            const totalEquity = cash + Object.values(holdings).reduce((sum, h) => {
                const stock = currentStocks.find(s => s.symbol === h.symbol);
                return sum + (stock ? h.quantity * stock.price : 0);
            }, 0);
            const cashPct = totalEquity > 0 ? cash / totalEquity : 0.5;

            // Update mood store with all metrics
            updateMood({
                stocksAboveMA,
                totalStocks: currentStocks.length,
                newHighs,
                newLows,
                risingVolume: risingVol,
                fallingVolume: fallingVol,
                averageVolatility: avgVol,
                cashPercentage: cashPct
            });

            // Increment tick counter
            tick();

            // Check for market cycle transitions (every 300 ticks)
            const returns = currentStocks.map(s => {
                const history = s.history.slice(-50);
                if (history.length < 2) return 0;
                const oldPrice = history[0].value;
                return (s.price - oldPrice) / oldPrice;
            });
            const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
            checkCycleTransition(avgReturn);

        }, 3000); // 3 second tick (Throttled for performance)

        return () => clearInterval(interval);
    }, []);

    // 📰 NEWS SYSTEM (Organic Triggers)
    useEffect(() => {
        const checkNews = () => {
            const timeSinceLastNews = Date.now() - lastNewsTimeRef.current;
            const nextInterval = 120000; // 2 minutes

            if (timeSinceLastNews > nextInterval) {
                const currentStocks = useStore.getState().stocks;
                if (currentStocks.length === 0) return;

                const news = generateNewsEvent(currentStocks);
                if (news) {
                    setActiveNews(news);
                    lastNewsTimeRef.current = Date.now();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    // 📰 NEWS SHIFTS MARKET SENTIMENT!
                    useMarketMoodStore.getState().applyNewsSentiment(
                        Math.abs(news.impact),
                        news.impact > 0 ? 'BULLISH' : 'BEARISH'
                    );

                    // 🔥 NEWS IMPACTS DRIFT (The "Kick")
                    // Instead of just jumping the price, we permanently shift the trend (Drift)
                    // This creates a lasting narrative effect.

                    const priceUpdates: Record<string, number> = {};

                    currentStocks.forEach(stock => {
                        let impactFactor = 0;
                        let driftKick = 0;

                        if (news.type === 'COMPANY' && news.symbol === stock.symbol) {
                            impactFactor = news.impact; // Immediate jump
                            driftKick = news.impact * 0.1; // Lasting trend shift
                        } else if (news.type === 'SECTOR' && news.sector === stock.sector) {
                            impactFactor = news.impact * 0.8;
                            driftKick = news.impact * 0.05;
                        } else if (news.type === 'MARKET' || news.type === 'ECONOMIC') {
                            impactFactor = news.impact * 0.5;
                            driftKick = news.impact * 0.02;
                        }

                        if (impactFactor !== 0) {
                            // 1. Immediate Price Shock
                            const currentPrice = stock.price;
                            priceUpdates[stock.symbol] = currentPrice * (1 + impactFactor);

                            // 2. Lasting Drift Shift
                            if (driftRef.current[stock.symbol] !== undefined) {
                                driftRef.current[stock.symbol] += driftKick;
                            }
                        }
                    });

                    if (Object.keys(priceUpdates).length > 0) {
                        updateMarketPrices(priceUpdates);
                    }
                }
            }
        };

        const newsInterval = setInterval(checkNews, 2000);
        return () => clearInterval(newsInterval);
    }, []);

    return {
        dismissEvent: () => setActiveNews(null)
    };
};
