import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '../utils/storage';
import { Crypto, CryptoHolding, Trade } from '../types';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { analytics } from '../utils/analytics';

interface CryptoStore {
    // State
    cryptoWallet: number;
    cryptos: Crypto[];
    cryptoHoldings: Record<string, CryptoHolding>;
    cryptoTrades: Trade[];

    // Wallet Actions
    transferToCrypto: (amount: number) => void;
    transferFromCrypto: (amount: number) => void;

    // Trading Actions
    buyCrypto: (symbol: string, quantity: number, price: number, leverage: number) => void;
    sellCrypto: (symbol: string, quantity: number, price: number) => void;

    // Market Actions
    setCryptos: (cryptos: Crypto[]) => void;
    updateCryptoPrice: (symbol: string, newPrice: number) => void;
    updateCryptoPrices: (updates: Record<string, number>) => void;
    checkCryptoLiquidation: () => void;

    // V2 Engine State
    marketPhase: 'ACCUMULATION' | 'BULL_RUN' | 'EUPHORIA' | 'CORRECTION' | 'BEAR_WINTER';
    setMarketPhase: (phase: 'ACCUMULATION' | 'BULL_RUN' | 'EUPHORIA' | 'CORRECTION' | 'BEAR_WINTER') => void;
    dailyReset: () => void;

    // Getters
    getTotalCryptoValue: () => number;

    // Reset
    resetCrypto: () => void;
}

// Helper to get main store cash (we'll need to import useStore in components)
let getMainStoreCash: () => number = () => 0;
let setMainStoreCash: (amount: number) => void = () => { };
let addXp: (amount: number) => void = () => { };
let unlockAchievement: (id: string) => void = () => { };
let checkAndUnlockAchievements: () => void = () => { };
let updateChallengeProgress: (type: string, amount: number) => void = () => { };

export const setMainStoreHelpers = (
    getCash: () => number,
    setCash: (amount: number) => void,
    addXpFn: (amount: number) => void,
    unlockAch: (id: string) => void,
    checkAch: () => void,
    updateChallenge: (type: string, amount: number) => void
) => {
    getMainStoreCash = getCash;
    setMainStoreCash = setCash;
    addXp = addXpFn;
    unlockAchievement = unlockAch;
    checkAndUnlockAchievements = checkAch;
    updateChallengeProgress = updateChallenge;
};

const INITIAL_CRYPTO_WALLET = 10000;

export const useCryptoStore = create<CryptoStore>()(
    persist(
        (set, get) => ({
            cryptoWallet: INITIAL_CRYPTO_WALLET,
            cryptos: [],
            cryptoHoldings: {},
            cryptoTrades: [],
            marketPhase: 'ACCUMULATION',

            transferToCrypto: (amount) => {
                const mainCash = getMainStoreCash();
                const { cryptoWallet } = get();

                if (mainCash < amount) {
                    Alert.alert('Insufficient Funds', 'Not enough cash to transfer.');
                    return;
                }

                setMainStoreCash(mainCash - amount);
                set({ cryptoWallet: cryptoWallet + amount });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },

            transferFromCrypto: (amount) => {
                const mainCash = getMainStoreCash();
                const { cryptoWallet } = get();

                if (cryptoWallet < amount) {
                    Alert.alert('Insufficient Funds', 'Not enough crypto wallet balance.');
                    return;
                }

                setMainStoreCash(mainCash + amount);
                set({ cryptoWallet: cryptoWallet - amount });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },

            buyCrypto: (symbol, quantity, price, leverage = 1) => {
                const { cryptoWallet, cryptoHoldings, cryptoTrades } = get();
                const totalCost = (quantity * price) / leverage;

                if (cryptoWallet < totalCost) {
                    Alert.alert('Insufficient Balance', 'Not enough crypto wallet balance.');
                    return;
                }

                let liquidationPrice: number | undefined;
                if (leverage > 1) {
                    liquidationPrice = price * (1 - 1 / leverage);
                }

                const existingHolding = cryptoHoldings[symbol];
                let newHolding: CryptoHolding;

                if (existingHolding) {
                    const totalQuantity = existingHolding.quantity + quantity;
                    const totalCostBasis = (existingHolding.averageCost * existingHolding.quantity) + (price * quantity);
                    newHolding = {
                        symbol,
                        quantity: totalQuantity,
                        averageCost: totalCostBasis / totalQuantity,
                        leverage: Math.max(existingHolding.leverage, leverage),
                        liquidationPrice: liquidationPrice || existingHolding.liquidationPrice,
                        entryPrice: price
                    };
                } else {
                    newHolding = {
                        symbol,
                        quantity,
                        averageCost: price,
                        leverage,
                        liquidationPrice,
                        entryPrice: price
                    };
                }

                set({
                    cryptoWallet: cryptoWallet - totalCost,
                    cryptoHoldings: {
                        ...cryptoHoldings,
                        [symbol]: newHolding
                    },
                    cryptoTrades: [
                        {
                            id: Date.now().toString(),
                            symbol,
                            type: 'BUY',
                            quantity,
                            price,
                            timestamp: Date.now()
                        },
                        ...cryptoTrades
                    ]
                });

                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                addXp(10);
                updateChallengeProgress('volume', 1);
                checkAndUnlockAchievements();
                analytics.trackEvent('crypto_buy', { symbol, quantity, price, leverage });
            },

            sellCrypto: (symbol, quantity, price) => {
                const { cryptoWallet, cryptoHoldings, cryptoTrades } = get();
                const currentHolding = cryptoHoldings[symbol];

                if (!currentHolding || currentHolding.quantity < quantity) {
                    Alert.alert('Insufficient Holdings', 'You don\'t have enough to sell.');
                    return;
                }

                const newQuantity = currentHolding.quantity - quantity;
                const costBasis = currentHolding.averageCost * quantity;
                const saleValue = price * quantity;
                const profit = saleValue - costBasis;
                const initialMargin = costBasis / currentHolding.leverage;
                const totalReturn = initialMargin + profit;

                const newHoldings = { ...cryptoHoldings };
                if (newQuantity > 0.000001) {
                    newHoldings[symbol] = { ...currentHolding, quantity: newQuantity };
                } else {
                    delete newHoldings[symbol];
                }

                set({
                    cryptoWallet: cryptoWallet + totalReturn,
                    cryptoHoldings: newHoldings,
                    cryptoTrades: [
                        {
                            id: Date.now().toString(),
                            symbol,
                            type: 'SELL',
                            quantity,
                            price,
                            timestamp: Date.now(),
                            pnl: profit
                        },
                        ...cryptoTrades
                    ]
                });

                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                addXp(10);
                if (profit > 0) {
                    addXp(15);
                    updateChallengeProgress('profit', profit);
                } else {
                    addXp(5);
                }
                updateChallengeProgress('volume', 1);
                checkAndUnlockAchievements();
                analytics.trackEvent('crypto_sell', { symbol, quantity, price, profit });
            },

            setCryptos: (cryptos) => set({ cryptos }),

            updateCryptoPrice: (symbol, newPrice) => {
                const { cryptos } = get();
                set({
                    cryptos: cryptos.map(c => {
                        if (c.symbol === symbol) {
                            const change24h = ((newPrice - c.openPrice) / c.openPrice) * 100;
                            return {
                                ...c,
                                price: newPrice,
                                change24h: change24h,
                                history: [...c.history.slice(-49), { timestamp: Date.now(), value: newPrice }]
                            };
                        }
                        return c;
                    })
                });
                get().checkCryptoLiquidation();
            },

            updateCryptoPrices: (updates) => {
                const { cryptos } = get();
                set({
                    cryptos: cryptos.map(c => {
                        if (updates[c.symbol]) {
                            const newPrice = updates[c.symbol];
                            const change24h = ((newPrice - c.openPrice) / c.openPrice) * 100;
                            return {
                                ...c,
                                price: newPrice,
                                change24h: change24h,
                                history: [...c.history.slice(-49), { timestamp: Date.now(), value: newPrice }]
                            };
                        }
                        return c;
                    })
                });
                get().checkCryptoLiquidation();
            },

            checkCryptoLiquidation: () => {
                const { cryptos, cryptoHoldings } = get();
                const newHoldings = { ...cryptoHoldings };
                let liquidationOccurred = false;

                Object.keys(cryptoHoldings).forEach(symbol => {
                    const holding = cryptoHoldings[symbol];
                    const crypto = cryptos.find(c => c.symbol === symbol);

                    if (!crypto || !holding.liquidationPrice || holding.leverage === 1) return;

                    if (crypto.price <= holding.liquidationPrice) {
                        delete newHoldings[symbol];
                        liquidationOccurred = true;

                        Alert.alert(
                            '⚠️ LIQUIDATED',
                            `Your ${holding.leverage}x leveraged ${symbol} position was liquidated at £${holding.liquidationPrice.toFixed(2)}.`,
                            [{ text: 'OK', style: 'destructive' }]
                        );
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        addXp(50);
                        unlockAchievement('liquidated');
                        analytics.trackEvent('crypto_liquidated', { symbol, leverage: holding.leverage });
                    }
                });

                if (liquidationOccurred) {
                    set({ cryptoHoldings: newHoldings });
                }
            },

            setMarketPhase: (phase) => set({ marketPhase: phase }),

            dailyReset: () => {
                const { cryptos } = get();
                set({
                    cryptos: cryptos.map(c => ({
                        ...c,
                        openPrice: c.price
                    }))
                });
            },

            getTotalCryptoValue: () => {
                const { cryptoHoldings, cryptos } = get();
                return Object.values(cryptoHoldings).reduce((sum, h) => {
                    const crypto = cryptos.find(c => c.symbol === h.symbol);
                    return sum + (h.quantity * (crypto?.price || 0));
                }, 0);
            },

            resetCrypto: () => set({
                cryptoWallet: INITIAL_CRYPTO_WALLET,
                cryptoHoldings: {},
                cryptoTrades: [],
                marketPhase: 'ACCUMULATION'
            })
        }),
        {
            name: 'crypto-trader-storage',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
);
