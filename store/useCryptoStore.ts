import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Crypto, CryptoHolding, Trade } from '../types';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { analytics } from '../utils/analytics';

// Error-safe AsyncStorage wrapper
const asyncStorageWrapper: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            const value = await AsyncStorage.getItem(name);
            return value;
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

interface CryptoStore {
    // State
    cryptoWallet: number;
    cryptos: Crypto[];
    cryptoHoldings: Record<string, CryptoHolding>;
    cryptoTrades: Trade[];
    fearGreedIndex: number;

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

    // Utility
    getTotalCryptoValue: () => number;
    reset: () => void;
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
            // Initial state
            cryptoWallet: INITIAL_CRYPTO_WALLET,
            cryptos: [],
            cryptoHoldings: {},
            cryptoTrades: [],
            fearGreedIndex: 50, // 0-100 (50 = neutral)

            // 🏦 WALLET TRANSFERS
            transferToCrypto: (amount) => {
                const mainCash = getMainStoreCash();
                const { cryptoWallet } = get();

                if (mainCash < amount) {
                    Alert.alert('Insufficient Funds', 'Not enough cash to transfer.');
                    return;
                }

                // Deduct from main wallet and add to crypto wallet
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

                // Add to main wallet and deduct from crypto wallet
                setMainStoreCash(mainCash + amount);
                set({ cryptoWallet: cryptoWallet - amount });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },

            // 💰 BUY CRYPTO WITH LEVERAGE
            buyCrypto: (symbol, quantity, price, leverage) => {
                const { cryptoWallet, cryptoHoldings, cryptoTrades } = get();
                const totalCost = (quantity * price) / leverage; // Leverage reduces capital required

                if (cryptoWallet < totalCost) {
                    Alert.alert('Insufficient Balance', 'Not enough crypto wallet balance.');
                    return;
                }

                // Calculate liquidation price for leveraged positions
                let liquidationPrice: number | undefined;
                if (leverage > 1) {
                    // Liquidation when loss = initial margin
                    // For long: liquidationPrice = entryPrice * (1 - 1/leverage)
                    liquidationPrice = price * (1 - 1 / leverage);
                }

                const existingHolding = cryptoHoldings[symbol];
                let newHolding: CryptoHolding;

                if (existingHolding) {
                    // Average down the position
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
                            timestamp: Date.now(),
                        },
                        ...cryptoTrades
                    ]
                });

                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                addXp(10);
                updateChallengeProgress('volume', 1); // Count as a trade
                checkAndUnlockAchievements();
                analytics.trackEvent('crypto_buy', { symbol, quantity, price, leverage });
            },

            // 💸 SELL CRYPTO
            sellCrypto: (symbol, quantity, price) => {
                const { cryptoWallet, cryptoHoldings, cryptoTrades } = get();
                const currentHolding = cryptoHoldings[symbol];

                if (!currentHolding || currentHolding.quantity < quantity) {
                    Alert.alert('Insufficient Holdings', 'You don\'t have enough to sell.');
                    return;
                }

                const newQuantity = currentHolding.quantity - quantity;

                // FIXED LEVERAGE MATH:
                // Calculate raw P&L (what you'd make without leverage)
                const costBasis = currentHolding.averageCost * quantity;
                const saleValue = price * quantity;
                const rawProfit = saleValue - costBasis;

                // Apply leverage to P&L ONLY
                const leveragedProfit = rawProfit * currentHolding.leverage;

                // Initial margin was: (avgCost * quantity) / leverage
                const initialMargin = costBasis / currentHolding.leverage;

                // Total return = margin back + leveraged profit
                const totalReturn = initialMargin + leveragedProfit;

                const newHoldings = { ...cryptoHoldings };
                if (newQuantity === 0) {
                    delete newHoldings[symbol];
                } else {
                    newHoldings[symbol] = {
                        ...currentHolding,
                        quantity: newQuantity
                    };
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
                            pnl: leveragedProfit
                        },
                        ...cryptoTrades
                    ]
                });

                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                addXp(10);
                if (leveragedProfit > 0) {
                    addXp(15);
                    updateChallengeProgress('profit', leveragedProfit);
                } else {
                    addXp(5);
                }
                updateChallengeProgress('volume', 1);
                checkAndUnlockAchievements();
                analytics.trackEvent('crypto_sell', { symbol, quantity, price, profit: leveragedProfit });
            },

            // ⚠️ CHECK FOR LIQUIDATIONS
            checkCryptoLiquidation: () => {
                const { cryptos, cryptoHoldings } = get();
                const newHoldings = { ...cryptoHoldings };
                let liquidationOccurred = false;

                Object.keys(cryptoHoldings).forEach(symbol => {
                    const holding = cryptoHoldings[symbol];
                    const crypto = cryptos.find(c => c.symbol === symbol);

                    if (!crypto || !holding.liquidationPrice || holding.leverage === 1) {
                        return;
                    }

                    // Check if current price hit liquidation
                    if (crypto.price <= holding.liquidationPrice) {
                        // Position liquidated - lose all margin
                        delete newHoldings[symbol];
                        liquidationOccurred = true;

                        Alert.alert(
                            '⚠️ LIQUIDATED',
                            `Your ${holding.leverage}x leveraged ${symbol} position was liquidated at £${holding.liquidationPrice.toFixed(2)}.`,
                            [{ text: 'OK', style: 'destructive' }]
                        );
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

                        // Award XP for getting rekt (dark humor)
                        addXp(50);
                        unlockAchievement('liquidated');
                        analytics.trackEvent('crypto_liquidated', { symbol, leverage: holding.leverage });
                    }
                });

                if (liquidationOccurred) {
                    set({ cryptoHoldings: newHoldings });
                }
            },

            // 📊 UPDATE CRYPTO PRICES
            updateCryptoPrice: (symbol, newPrice) => {
                const { cryptos } = get();
                set({
                    cryptos: cryptos.map((crypto) =>
                        crypto.symbol === symbol
                            ? {
                                ...crypto,
                                price: newPrice,
                                history: [
                                    ...crypto.history.slice(-49),
                                    { timestamp: Date.now(), value: newPrice }
                                ],
                            }
                            : crypto
                    ),
                });
                get().checkCryptoLiquidation();
            },

            updateCryptoPrices: (priceUpdates: Record<string, number>) => {
                const { cryptos } = get();
                const timestamp = Date.now();

                set({
                    cryptos: cryptos.map((crypto) => {
                        const newPrice = priceUpdates[crypto.symbol];
                        if (newPrice !== undefined) {
                            return {
                                ...crypto,
                                price: newPrice,
                                history: [
                                    ...crypto.history.slice(-49),
                                    { timestamp, value: newPrice }
                                ],
                            };
                        }
                        return crypto;
                    }),
                });

                get().checkCryptoLiquidation();
            },

            setCryptos: (cryptos) => set({ cryptos }),

            // 💵 GET TOTAL CRYPTO VALUE
            getTotalCryptoValue: () => {
                const { cryptos, cryptoHoldings } = get();
                return Object.values(cryptoHoldings).reduce((total, holding) => {
                    const crypto = cryptos.find(c => c.symbol === holding.symbol);
                    if (!crypto) return total;
                    return total + (holding.quantity * crypto.price);
                }, 0);
            },

            // 🔄 RESET
            reset: () => {
                set({
                    cryptoWallet: INITIAL_CRYPTO_WALLET,
                    cryptos: [],
                    cryptoHoldings: {},
                    cryptoTrades: [],
                    fearGreedIndex: 50
                });
            },
        }),
        {
            name: 'crypto-trader-storage',
            storage: createJSONStorage(() => asyncStorageWrapper),
        }
    )
);
