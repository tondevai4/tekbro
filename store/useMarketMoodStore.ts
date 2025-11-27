import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Error-safe AsyncStorage wrapper
const asyncStorageWrapper = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(name);
        } catch (error) {
            console.error('AsyncStorage getItem error:', error);
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            await AsyncStorage.setItem(name, value);
        } catch (error) {
            console.error('AsyncStorage setItem error:', error);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            await AsyncStorage.removeItem(name);
        } catch (error) {
            console.error('AsyncStorage removeItem error:', error);
        }
    },
};

type MarketCyclePhase = 'early' | 'mid' | 'late' | 'recession';
type Sector = 'Tech' | 'Finance' | 'Healthcare' | 'Consumer' | 'Energy' | 'Real Estate';

interface MarketMoodStore {
    // State
    fearGreedIndex: number; // 0-100 (single source of truth)
    marketCyclePhase: MarketCyclePhase;
    volatilityIndex: number; // 0-100 (simulated VIX)
    tickCount: number; // For cycle transitions

    // Price tracking for calculations
    recentHighs: number; // Count of stocks hitting recent highs
    recentLows: number; // Count of stocks hitting recent lows
    risingVolume: number; // Volume in rising stocks
    fallingVolume: number; // Volume in falling stocks

    // Getters
    getMoodLabel: () => string;
    getMoodColor: () => string;
    getSectorMultiplier: (sector: Sector, phase: MarketCyclePhase) => number;

    // Updates
    updateMood: (metrics: {
        stocksAboveMA: number;
        totalStocks: number;
        newHighs: number;
        newLows: number;
        risingVolume: number;
        fallingVolume: number;
        averageVolatility: number;
        cashPercentage: number;
    }) => void;
    applyNewsSentiment: (impact: number, type: 'BULLISH' | 'BEARISH') => void;
    tick: () => void;
    checkCycleTransition: (avgReturn: number) => void;
    reset: () => void;
}

// Sector performance multipliers based on market cycle phase
const SECTOR_MULTIPLIERS: Record<MarketCyclePhase, Record<Sector, number>> = {
    early: {
        Tech: 0.02,           // +2% bias
        Finance: 0.01,        // +1% bias
        Healthcare: 0,        // Neutral
        Consumer: 0.01,       // +1% bias
        Energy: 0,            // Neutral
        'Real Estate': -0.005 // -0.5% bias
    },
    mid: {
        Tech: 0.01,
        Finance: 0.01,
        Healthcare: 0,
        Consumer: 0.01,
        Energy: 0.01,
        'Real Estate': 0.005
    },
    late: {
        Tech: -0.01,
        Finance: 0.02,
        Healthcare: 0,
        Consumer: -0.01,
        Energy: 0.02,
        'Real Estate': 0.01
    },
    recession: {
        Tech: -0.02,
        Finance: -0.03,
        Healthcare: 0.02,      // Defensive
        Consumer: -0.02,
        Energy: -0.01,
        'Real Estate': -0.015
    }
};

export const useMarketMoodStore = create<MarketMoodStore>()(
    persist(
        (set, get) => ({
            // Initial state
            fearGreedIndex: 50, // Start neutral
            marketCyclePhase: 'early',
            volatilityIndex: 20,
            tickCount: 0,
            recentHighs: 0,
            recentLows: 0,
            risingVolume: 0,
            fallingVolume: 0,

            getMoodLabel: () => {
                const index = get().fearGreedIndex;
                if (index <= 24) return 'Extreme Fear';
                if (index <= 49) return 'Fear';
                if (index <= 55) return 'Neutral';
                if (index <= 75) return 'Greed';
                return 'Extreme Greed';
            },

            getMoodColor: () => {
                const index = get().fearGreedIndex;
                if (index <= 24) return '#FF4444'; // Red
                if (index <= 49) return '#FF8800'; // Orange
                if (index <= 55) return '#FFD700'; // Gold
                if (index <= 75) return '#00CC00'; // Green
                return '#00FF00'; // Bright green
            },

            getSectorMultiplier: (sector: Sector, phase?: MarketCyclePhase) => {
                const currentPhase = phase || get().marketCyclePhase;
                return SECTOR_MULTIPLIERS[currentPhase][sector] || 0;
            },

            updateMood: (metrics) => {
                // Calculate 7 components (like real Fear & Greed Index)

                // 1. Price Momentum (0-100): % of stocks above MA
                const priceMomentum = (metrics.stocksAboveMA / metrics.totalStocks) * 100;

                // 2. Price Strength (0-100): New highs vs new lows
                const totalExtremes = metrics.newHighs + metrics.newLows;
                const priceStrength = totalExtremes > 0
                    ? (metrics.newHighs / totalExtremes) * 100
                    : 50;

                // 3. Price Breadth (0-100): Rising volume vs falling volume
                const totalVolume = metrics.risingVolume + metrics.fallingVolume;
                const priceBreadth = totalVolume > 0
                    ? (metrics.risingVolume / totalVolume) * 100
                    : 50;

                // 4. Put/Call Ratio (0-100): Inverse of volatility (high vol = fear = put demand)
                const putCallRatio = 100 - metrics.averageVolatility;

                // 5. Market Volatility (0-100): Direct VIX simulation
                const volatility = metrics.averageVolatility;
                set({ volatilityIndex: volatility });

                // 6. Junk Bond Demand (0-100): Inverse of volatility (low vol = risk appetite)
                const junkBondDemand = 100 - metrics.averageVolatility;

                // 7. Safe Haven Demand (0-100): Inverse of cash % (high cash = fear)
                const safeHavenDemand = 100 - (metrics.cashPercentage * 100);

                // Average all 7 components
                const newIndex = (
                    priceMomentum +
                    priceStrength +
                    priceBreadth +
                    putCallRatio +
                    (100 - volatility) + // Invert VIX (high VIX = fear)
                    junkBondDemand +
                    safeHavenDemand
                ) / 7;

                // Clamp and update
                const clampedIndex = Math.max(0, Math.min(100, newIndex));
                set({ fearGreedIndex: clampedIndex });
            },

            applyNewsSentiment: (impact: number, type: 'BULLISH' | 'BEARISH') => {
                const currentIndex = get().fearGreedIndex;

                // Convert impact (-1 to 1) to F&G shift
                // Bullish news pushes toward greed, bearish toward fear
                const shift = type === 'BULLISH'
                    ? impact * 15  // Max +15 for major bullish news
                    : impact * -15; // Max -15 for major bearish news

                const newIndex = currentIndex + shift;
                const clampedIndex = Math.max(0, Math.min(100, newIndex));

                set({ fearGreedIndex: clampedIndex });
            },

            tick: () => {
                set(state => ({ tickCount: state.tickCount + 1 }));
            },

            checkCycleTransition: (avgReturn: number) => {
                const { marketCyclePhase, fearGreedIndex, tickCount } = get();

                // Only check every 300 ticks (5 minutes at 1s per tick, or 15 min at 3s per tick)
                if (tickCount % 300 !== 0) return;

                let newPhase = marketCyclePhase;

                switch (marketCyclePhase) {
                    case 'early':
                        // EARLY → MID: Sustained recovery (+10% over period)
                        if (avgReturn > 0.10) {
                            newPhase = 'mid';
                        }
                        break;

                    case 'mid':
                        // MID → LATE: Strong growth (+15%) + high greed
                        if (avgReturn > 0.15 && fearGreedIndex > 70) {
                            newPhase = 'late';
                        }
                        break;

                    case 'late':
                        // LATE → RECESSION: Correction (-10%) or extreme greed (>85)
                        if (avgReturn < -0.10 || fearGreedIndex > 85) {
                            newPhase = 'recession';
                        }
                        break;

                    case 'recession':
                        // RECESSION → EARLY: Deep selloff (-20%) + extreme fear (<20)
                        if (avgReturn < -0.20 && fearGreedIndex < 20) {
                            newPhase = 'early';
                        }
                        break;
                }

                if (newPhase !== marketCyclePhase) {
                    set({ marketCyclePhase: newPhase });
                }
            },

            reset: () => {
                set({
                    fearGreedIndex: 50,
                    marketCyclePhase: 'early',
                    volatilityIndex: 20,
                    tickCount: 0,
                    recentHighs: 0,
                    recentLows: 0,
                    risingVolume: 0,
                    fallingVolume: 0
                });
            }
        }),
        {
            name: 'market-mood-storage',
            storage: createJSONStorage(() => asyncStorageWrapper),
        }
    )
);
