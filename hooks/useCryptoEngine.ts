import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useCryptoStore } from '../store/useCryptoStore';
import { useMarketMoodStore } from '../store/useMarketMoodStore';
import { useStore } from '../store/useStore';
import { CRYPTO_CATALOG, initializeCryptos } from '../constants/cryptoData';
import { generateCryptoNewsEvent } from '../utils/NewsEngine';

/**
 * 🚀 CRYPTO ENGINE V2: News-Driven State Machine
 * 
 * Core Logic:
 * 1. State Machine: The market has phases (Accumulation, Bull, Euphoria, Crash, Bear).
 * 2. News Driver: News events TRIGGER phase transitions.
 * 3. Sentiment Integration: The "Fire" meter determines the PROBABILITY of pumps vs dumps.
 * 4. Daily Reset: Every X ticks, we reset "Open Price" to fix the "stuck %" issue.
 */

// Lanczos approximation for Gamma function (Standard Math)
const gamma = (z: number): number => {
    const p = [
        676.5203681218851, -1259.1392167224028, 771.32342877765313,
        -176.61502916214059, 12.507343278686905, -0.13857109526572012,
        9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    z -= 1;
    let x = 0.99999999999980993;
    for (let i = 0; i < p.length; i++) x += p[i] / (z + i + 1);
    const t = z + p.length - 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
};

// Lévy Flight Generator (Fat Tail Volatility)
const levyRandom = (alpha = 1.5) => {
    const u = Math.random();
    const v = Math.random();
    const sigma = Math.pow((Math.sin(Math.PI * alpha / 2) * gamma(1 + alpha)) / ((Math.pow(2, (alpha - 1) / 2)) * Math.sin(Math.PI * alpha / 2) * gamma((1 + alpha) / 2) * alpha), 1 / alpha);
    let x = 0, y = 0;
    while (x === 0) x = Math.random();
    while (y === 0) y = Math.random();
    const normal_u = Math.sqrt(-2.0 * Math.log(x)) * Math.cos(2.0 * Math.PI * y);
    let x2 = 0, y2 = 0;
    while (x2 === 0) x2 = Math.random();
    while (y2 === 0) y2 = Math.random();
    const normal_v = Math.sqrt(-2.0 * Math.log(x2)) * Math.cos(2.0 * Math.PI * y2);
    return (normal_u * sigma) / Math.pow(Math.abs(normal_v), 1 / alpha);
};

export const useCryptoEngine = () => {
    const {
        setCryptos,
        updateCryptoPrices,
        checkCryptoLiquidation,
        marketPhase,
        setMarketPhase,
        dailyReset
    } = useCryptoStore();

    const momentumRef = useRef<Record<string, number>>({});
    const tickCountRef = useRef(0);

    // 1. INITIALIZATION
    useEffect(() => {
        const currentCryptos = useCryptoStore.getState().cryptos;
        const needsReset = currentCryptos.length !== CRYPTO_CATALOG.length ||
            currentCryptos.some(c => !c || !c.price || c.price < 0.000001);

        if (needsReset) {
            const initializedCryptos = initializeCryptos();
            setCryptos(initializedCryptos);
            initializedCryptos.forEach(c => momentumRef.current[c.symbol] = 0);
        } else {
            currentCryptos.forEach(c => {
                if (momentumRef.current[c.symbol] === undefined) momentumRef.current[c.symbol] = 0;
            });
        }
    }, []);

    // 2. MAIN ENGINE LOOP (1s Ticks)
    useEffect(() => {
        const interval = setInterval(() => {
            const { cryptos } = useCryptoStore.getState();

            // 0. RE-INITIALIZATION CHECK
            if (cryptos.length === 0) {
                const initializedCryptos = initializeCryptos();
                setCryptos(initializedCryptos);
                initializedCryptos.forEach(c => momentumRef.current[c.symbol] = 0);
                return;
            }

            const { cryptoFearGreedIndex, updateCryptoEngine } = useMarketMoodStore.getState();
            const priceUpdates: Record<string, number> = {};

            let totalMomentum = 0;
            let totalVolatility = 0;

            // --- FEAR & GREED DRIVER ---
            // Crypto is 10x more volatile than stocks.
            // 0-20: REKT Zone (Crash)
            // 21-40: Fear (Bearish)
            // 41-60: Accumulation (Chop)
            // 61-80: FOMO (Bullish)
            // 81-100: Moon Mission (Parabolic)

            // Base bias: -0.5% to +0.5% per tick based on F&G
            // Strict correlation: The meter dictates the candle color.
            const sentimentBias = ((cryptoFearGreedIndex - 50) / 50) * 0.005;

            // PHASE LOGIC (Secondary Driver)
            // Phases amplify or dampen the F&G signal
            let phaseBias = 0;
            let phaseVolMultiplier = 1;

            switch (marketPhase) {
                case 'ACCUMULATION':
                    phaseBias = 0.0001;
                    phaseVolMultiplier = 0.6; // Low vol
                    break;
                case 'BULL_RUN':
                    phaseBias = 0.0005;
                    phaseVolMultiplier = 1.2;
                    break;
                case 'EUPHORIA':
                    phaseBias = 0.001; // Parabolic
                    phaseVolMultiplier = 2.5; // Extreme vol
                    break;
                case 'CORRECTION':
                    phaseBias = -0.0005;
                    phaseVolMultiplier = 1.5;
                    break;
                case 'BEAR_WINTER':
                    phaseBias = -0.0002;
                    phaseVolMultiplier = 0.4; // Boring bleed
                    break;
            }

            cryptos.forEach(crypto => {
                // 1. Base Volatility
                const baseVol = (CRYPTO_CATALOG.find(c => c.symbol === crypto.symbol)?.volatility || 0.05) * 0.01;

                // 2. Momentum (Inertia)
                let currentMomentum = momentumRef.current[crypto.symbol] || 0;
                currentMomentum = (currentMomentum * 0.95) + (phaseBias * 0.05); // Decay + Phase Pull
                momentumRef.current[crypto.symbol] = currentMomentum;

                // 3. Random Walk (Lévy Flight for Fat Tails)
                // Volatility scales with F&G Extremes
                const extremeFactor = Math.abs(cryptoFearGreedIndex - 50) / 50;
                const noise = levyRandom() * baseVol * phaseVolMultiplier * (1 + extremeFactor);

                // 4. Calculate Move
                // Move = Sentiment + Momentum + Noise
                const percentChange = sentimentBias + currentMomentum + noise;
                let newPrice = crypto.price * (1 + percentChange);

                // --- SMART FLOOR LOGIC ---
                const catalogItem = CRYPTO_CATALOG.find(c => c.symbol === crypto.symbol);
                const basePrice = catalogItem?.basePrice || 1;
                const hardFloor = catalogItem?.minPrice || (basePrice * 0.30);

                if (newPrice < hardFloor) {
                    newPrice = hardFloor;
                    // Hard Bounce
                    momentumRef.current[crypto.symbol] = Math.abs(momentumRef.current[crypto.symbol]) * 0.8 + 0.01;
                }

                // --- SMART CEILING LOGIC ---
                let ceilingMult = 100;
                if (marketPhase === 'BEAR_WINTER') ceilingMult = 1.5;
                if (marketPhase === 'CORRECTION') ceilingMult = 2.0;
                if (marketPhase === 'ACCUMULATION') ceilingMult = 3.0;

                const hardCeiling = basePrice * ceilingMult;
                if (newPrice > hardCeiling) {
                    newPrice = hardCeiling;
                    momentumRef.current[crypto.symbol] = -Math.abs(momentumRef.current[crypto.symbol]) * 0.5 - 0.005;
                }

                // Safety Clamps
                newPrice = Math.max(0.000001, newPrice);
                priceUpdates[crypto.symbol] = newPrice;

                totalMomentum += currentMomentum;
                totalVolatility += Math.abs(percentChange);
            });

            // Update Prices
            updateCryptoPrices(priceUpdates);
            checkCryptoLiquidation();

            // Update Mood Store
            // Update Mood Store
            updateCryptoEngine({
                momentum: totalMomentum / cryptos.length,
                volatility: totalVolatility / cryptos.length,
                dominance: 50, // Placeholder
                hype: cryptoFearGreedIndex // Use F&G as proxy for hype
            });

            // DAILY RESET LOGIC
            tickCountRef.current += 1;
            if (tickCountRef.current >= 300) {
                dailyReset();
                tickCountRef.current = 0;
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [marketPhase, useMarketMoodStore.getState().cryptoFearGreedIndex]); // Re-bind on F&G change

    // 3. NEWS & PHASE CONTROLLER
    const lastNewsTimeRef = useRef(Date.now());
    const { setActiveNews } = useStore();

    useEffect(() => {
        const checkNews = () => {
            // Generate news every 2-4 minutes
            if (Date.now() - lastNewsTimeRef.current > 120000 + Math.random() * 120000) {
                const { cryptos } = useCryptoStore.getState();
                if (cryptos.length === 0) return;

                const news = generateCryptoNewsEvent(cryptos);
                if (news) {
                    setActiveNews(news);
                    lastNewsTimeRef.current = Date.now();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    // PHASE TRANSITION LOGIC
                    // News drives the market phase!
                    const { marketPhase } = useCryptoStore.getState();

                    if (news.impact > 0.15) {
                        // Massive Bullish News -> EUPHORIA
                        setMarketPhase('EUPHORIA');
                    } else if (news.impact > 0.05 && marketPhase !== 'EUPHORIA') {
                        // Good News -> BULL_RUN
                        setMarketPhase('BULL_RUN');
                    } else if (news.impact < -0.15) {
                        // Disaster News -> CORRECTION
                        setMarketPhase('CORRECTION');
                    } else if (news.impact < -0.05 && marketPhase === 'EUPHORIA') {
                        // Bad news during euphoria -> CORRECTION
                        setMarketPhase('CORRECTION');
                    } else if (Math.abs(news.impact) < 0.02) {
                        // Boring News -> ACCUMULATION or BEAR_WINTER
                        if (Math.random() > 0.5) setMarketPhase('ACCUMULATION');
                        else setMarketPhase('BEAR_WINTER');
                    }

                    // Immediate Price Impact
                    const priceUpdates: Record<string, number> = {};
                    cryptos.forEach(c => {
                        if ((news.type === 'COMPANY' && news.symbol === c.symbol) ||
                            (news.type === 'SECTOR' && news.sector === 'Crypto')) {

                            const jump = news.impact * (marketPhase === 'EUPHORIA' ? 1.5 : 1); // Amplify in euphoria
                            priceUpdates[c.symbol] = c.price * (1 + jump);
                            momentumRef.current[c.symbol] += jump * 0.5; // Kickstart momentum
                        }
                    });

                    if (Object.keys(priceUpdates).length > 0) {
                        updateCryptoPrices(priceUpdates);
                    }
                }
            }
        };

        const newsInterval = setInterval(checkNews, 5000);
        return () => clearInterval(newsInterval);
    }, []);
};
