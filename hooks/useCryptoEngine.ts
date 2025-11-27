import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useCryptoStore } from '../store/useCryptoStore';
import { useStore } from '../store/useStore';
import { CRYPTO_CATALOG, initializeCryptos } from '../constants/cryptoData';
import { generateCryptoNewsEvent } from '../utils/NewsEngine';

/**
 * 🚀 CRYPTO ENGINE (Market V4)
 * 
 * Philosophy: "Digital Wild West"
 * - 24/7 Trading: The market never sleeps.
 * - Lévy Flight Volatility: Extreme events are common (Fat Tails).
 * - Momentum & Hype: Prices are driven by momentum (Drift) and sudden hype cycles.
 */

// Lanczos approximation for Gamma function
// Accurate enough for our simulation needs
const gamma = (z: number): number => {
    const p = [
        676.5203681218851, -1259.1392167224028, 771.32342877765313,
        -176.61502916214059, 12.507343278686905, -0.13857109526572012,
        9.9843695780195716e-6, 1.5056327351493116e-7
    ];

    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));

    z -= 1;
    let x = 0.99999999999980993;
    for (let i = 0; i < p.length; i++) {
        x += p[i] / (z + i + 1);
    }
    const t = z + p.length - 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
};

// Lévy Flight Generator: Produces "fat tail" random numbers for extreme volatility
// Alpha < 2.0 results in infinite variance (heavy tails)
const levyRandom = (alpha = 1.5) => {
    const u = Math.random();
    const v = Math.random();

    // Mantegna's algorithm for symmetric stable Levy distribution
    const sigma = Math.pow(
        (Math.sin(Math.PI * alpha / 2) *
            gamma(1 + alpha)) /
        ((Math.pow(2, (alpha - 1) / 2)) *
            Math.sin(Math.PI * alpha / 2) *
            gamma((1 + alpha) / 2) * alpha),
        1 / alpha
    );

    // Standard Gaussian for normal noise
    let x = 0, y = 0;
    while (x === 0) x = Math.random();
    while (y === 0) y = Math.random();
    const normal_u = Math.sqrt(-2.0 * Math.log(x)) * Math.cos(2.0 * Math.PI * y);

    let x2 = 0, y2 = 0;
    while (x2 === 0) x2 = Math.random();
    while (y2 === 0) y2 = Math.random();
    const normal_v = Math.sqrt(-2.0 * Math.log(x2)) * Math.cos(2.0 * Math.PI * y2);

    const step = (normal_u * sigma) / Math.pow(Math.abs(normal_v), 1 / alpha);

    return step;
};

export const useCryptoEngine = () => {
    const {
        setCryptos,
        updateCryptoPrices,
        checkCryptoLiquidation,
        fearGreedIndex
    } = useCryptoStore();

    // 🌊 MOMENTUM SYSTEM: Crypto trends tend to persist longer
    const momentumRef = useRef<Record<string, number>>({});
    const trendHistoryRef = useRef<Record<string, number[]>>({});

    // Initialize cryptos and momentum
    useEffect(() => {
        const currentCryptos = useCryptoStore.getState().cryptos;
        const needsReset = currentCryptos.length !== CRYPTO_CATALOG.length ||
            currentCryptos.some(c => !c || !c.price || c.price < 0.000001);

        if (needsReset) {
            const initializedCryptos = initializeCryptos();
            setCryptos(initializedCryptos);

            // Initialize random momentum and trend history
            initializedCryptos.forEach(crypto => {
                momentumRef.current[crypto.symbol] = (Math.random() - 0.5) * 0.005;
                trendHistoryRef.current[crypto.symbol] = [];
            });
        } else {
            // Hydrate momentum and trend history
            currentCryptos.forEach(crypto => {
                if (momentumRef.current[crypto.symbol] === undefined) {
                    momentumRef.current[crypto.symbol] = (Math.random() - 0.5) * 0.005;
                }
                if (trendHistoryRef.current[crypto.symbol] === undefined) {
                    trendHistoryRef.current[crypto.symbol] = [];
                }
                // Initialize openPrice if missing (for session percentage calc)
                if (!crypto.openPrice || crypto.openPrice === 0) {
                    useCryptoStore.setState(state => ({
                        cryptos: state.cryptos.map(c =>
                            c.symbol === crypto.symbol ? { ...c, openPrice: c.price } : c
                        )
                    }));
                }
            });
        }
    }, []);

    // ⚡ THE CRYPTO LOOP (2s Updates - Slightly slower than stocks to allow processing)
    useEffect(() => {
        const interval = setInterval(() => {
            const currentCryptos = useCryptoStore.getState().cryptos;
            if (currentCryptos.length === 0) return;

            const priceUpdates: Record<string, number> = {};
            let marketMoodChange = 0;

            currentCryptos.forEach(crypto => {
                // 1. Evolve Momentum (The Hype)
                // Momentum changes more erratically in crypto
                const momentumChange = (Math.random() - 0.5) * 0.001;
                let currentMomentum = (momentumRef.current[crypto.symbol] || 0) + momentumChange;

                // Weaker Mean Reversion: Crypto trends can go parabolic
                currentMomentum *= 0.995;
                momentumRef.current[crypto.symbol] = currentMomentum;

                // 2. Calculate Volatility (The Chaos)
                const cryptoConfig = CRYPTO_CATALOG.find(c => c.symbol === crypto.symbol);
                const baseVolatility = cryptoConfig?.volatility || 0.05;

                // Scale volatility by Fear & Greed Index
                // Extreme Fear (Low Index) = High Volatility (Panic selling)
                // Extreme Greed (High Index) = High Volatility (FOMO buying)
                const fearGreedFactor = Math.abs(fearGreedIndex - 50) / 25; // 0 to 2x multiplier
                const volatility = baseVolatility * (1 + fearGreedFactor) * 0.02;

                // 3. Generate Move
                const noise = levyRandom() * volatility;

                // 🐂 BULL RUN / 🐻 BEAR MARKET LOGIC
                // If Greed > 75, bias momentum upwards (Bull Run)
                // If Fear < 25, bias momentum downwards (Panic Sell)
                let moodBias = 0;
                if (fearGreedIndex > 75) {
                    moodBias = 0.002; // +0.2% per tick bias
                } else if (fearGreedIndex < 25) {
                    moodBias = -0.003; // -0.3% per tick bias (Fear is stronger)
                }

                // 🎢 TREND MOMENTUM: Reduce rubber-banding
                const trendHistory = trendHistoryRef.current[crypto.symbol] || [];
                const recentTrend = trendHistory.slice(-3).reduce((sum, t) => sum + t, 0) / Math.max(trendHistory.length, 1);
                const momentumBias = recentTrend * 0.25; // 25% of recent trend persists

                const percentChange = currentMomentum + noise + moodBias + momentumBias;

                // Store trend for next iteration
                trendHistory.push(percentChange);
                trendHistoryRef.current[crypto.symbol] = trendHistory.slice(-5); // Keep last 5 ticks

                // 4. Update Price
                let newPrice = crypto.price * (1 + percentChange);

                // STRICT Safety clamps based on basePrice to prevent runaway prices
                const baseCrypto = CRYPTO_CATALOG.find(c => c.symbol === crypto.symbol);
                if (baseCrypto) {
                    const maxPrice = baseCrypto.basePrice * 3; // Max 3x from base
                    const minPrice = baseCrypto.basePrice * 0.3; // Min 30% of base
                    newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
                } else {
                    // Fallback if base not found
                    newPrice = Math.max(0.000001, newPrice);
                }

                priceUpdates[crypto.symbol] = newPrice;

                // Track overall market mood
                marketMoodChange += percentChange;
            });

            // Batch update prices
            updateCryptoPrices(priceUpdates);

            // Check for liquidations immediately after price updates
            checkCryptoLiquidation();

            // Slowly update Fear & Greed Index based on market performance
            // If market is up, Greed increases. If down, Fear increases.
            const currentFearGreed = useCryptoStore.getState().fearGreedIndex;
            const moodImpact = marketMoodChange * 100; // Scale up small % changes
            let newFearGreed = currentFearGreed + moodImpact;

            // Mean reversion to 50 (Neutral)
            newFearGreed = newFearGreed * 0.99 + 50 * 0.01;

            // Clamp 0-100
            newFearGreed = Math.max(0, Math.min(100, newFearGreed));

            useCryptoStore.setState({ fearGreedIndex: newFearGreed });

        }, 2000); // 2 second tick

        return () => clearInterval(interval);
    }, [fearGreedIndex]); // Re-run if fear/greed changes significantly (though ref handles momentum)

    // 📰 CRYPTO NEWS SYSTEM
    const lastNewsTimeRef = useRef(Date.now());
    const { setActiveNews } = useStore();

    useEffect(() => {
        const checkNews = () => {
            const timeSinceLastNews = Date.now() - lastNewsTimeRef.current;
            const nextInterval = 180000; // 3 minutes (less frequent than stocks)

            if (timeSinceLastNews > nextInterval) {
                const currentCryptos = useCryptoStore.getState().cryptos;
                if (currentCryptos.length === 0) return;

                const news = generateCryptoNewsEvent(currentCryptos);
                if (news) {
                    setActiveNews(news);
                    lastNewsTimeRef.current = Date.now();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    // 🔥 NEWS IMPACT
                    const priceUpdates: Record<string, number> = {};

                    currentCryptos.forEach(crypto => {
                        let impactFactor = 0;
                        let momentumKick = 0;

                        if (news.type === 'COMPANY' && news.symbol === crypto.symbol) {
                            impactFactor = news.impact; // Immediate jump
                            momentumKick = news.impact * 0.2; // Strong momentum shift
                        } else if (news.type === 'SECTOR' && news.sector === 'Crypto') {
                            impactFactor = news.impact;
                            momentumKick = news.impact * 0.1;
                        }

                        if (impactFactor !== 0) {
                            // 1. Immediate Price Shock
                            const currentPrice = crypto.price;
                            priceUpdates[crypto.symbol] = currentPrice * (1 + impactFactor);

                            // 2. Lasting Momentum Shift
                            if (momentumRef.current[crypto.symbol] !== undefined) {
                                momentumRef.current[crypto.symbol] += momentumKick;
                            }
                        }
                    });

                    if (Object.keys(priceUpdates).length > 0) {
                        updateCryptoPrices(priceUpdates);
                        checkCryptoLiquidation();
                    }
                }
            }
        };

        const newsInterval = setInterval(checkNews, 5000);
        return () => clearInterval(newsInterval);
    }, []);
};
