import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Zap, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { Stock } from '../types';
import { useStore } from '../store/useStore';
import { HapticPatterns } from '../utils/haptics';

interface StockCardProps {
    stock: Stock;
}

// Company icons mapping
const COMPANY_ICONS: Record<string, string> = {
    'AAPL': '🍎', 'NVDA': '🎮', 'TSLA': '🚗', 'MSFT': '💻', 'GOOGL': '🔍',
    'AMZN': '📦', 'META': '👥', 'NFLX': '🎬', 'PLTR': '🛡️', 'COIN': '🪙',
    'ABNB': '🏠', 'UBER': '🚕', 'SHOP': '🛍️', 'SQ': '💳', 'RBLX': '🎮',
    'SNAP': '👻', 'SPOT': '🎵', 'TWTR': '🐦', 'ZM': '📹', 'DOCU': '📝',
};

const StockCardComponent: React.FC<StockCardProps> = ({ stock }) => {
    const router = useRouter();
    const { watchlist, toggleWatchlist, buyStock, cash } = useStore();
    const isWatchlisted = watchlist.includes(stock.symbol);

    // Calculate price change
    const priceChange = stock.history.length >= 2
        ? stock.price - stock.history[stock.history.length - 2].value
        : 0;
    const changePercent = stock.history.length >= 2
        ? (priceChange / stock.history[stock.history.length - 2].value) * 100
        : 0;

    const isPositive = priceChange >= 0;

    const handleQuickBuy = (e: any) => {
        e.stopPropagation();
        if (cash >= stock.price) {
            buyStock(stock.symbol, 1, stock.price);
            HapticPatterns.tradeExecuted();
        } else {
            HapticPatterns.error();
        }
    };

    const handleToggleWatchlist = (e: any) => {
        e.stopPropagation();
        toggleWatchlist(stock.symbol);
        HapticPatterns.light();
    };

    const getGradientColors = (): [string, string] => {
        if (isPositive) {
            return ['#0D4D4D', '#1A5F5F'];
        } else {
            return ['#4D1A1A', '#5F2626'];
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push(`/stock/${stock.symbol}`)}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Company Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.icon}>
                        <Text style={styles.iconText}>{COMPANY_ICONS[stock.symbol] || '📈'}</Text>
                    </View>
                </View>

                {/* Stock Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.topRow}>
                        <View style={styles.symbolContainer}>
                            <Text style={styles.symbol}>{stock.symbol}</Text>
                            <TouchableOpacity
                                onPress={handleToggleWatchlist}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Star
                                    size={16}
                                    color={isWatchlisted ? COLORS.accent : COLORS.textMuted}
                                    fill={isWatchlisted ? COLORS.accent : 'transparent'}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>
                                £{stock.price.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.bottomRow}>
                        <View style={styles.changeContainer}>
                            {isPositive ? (
                                <TrendingUp size={14} color={COLORS.positive} />
                            ) : (
                                <TrendingDown size={14} color={COLORS.negative} />
                            )}
                            <Text style={[
                                styles.changeText,
                                isPositive ? styles.positiveText : styles.negativeText
                            ]}>
                                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.quickBuyButton}
                            onPress={handleQuickBuy}
                            activeOpacity={0.7}
                        >
                            <Zap size={12} color={cash >= stock.price ? '#000' : COLORS.textMuted} />
                            <Text style={[
                                styles.quickBuyText,
                                cash < stock.price && styles.disabledText
                            ]}>
                                Buy
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

// Memoize with custom comparison to prevent unnecessary re-renders
export const StockCard = memo(StockCardComponent, (prevProps, nextProps) => {
    return (
        prevProps.stock.symbol === nextProps.stock.symbol &&
        prevProps.stock.price === nextProps.stock.price &&
        prevProps.stock.history.length === nextProps.stock.history.length
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.sm,
    },
    card: {
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        marginBottom: SPACING.sm,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 28,
    },
    infoContainer: {
        gap: SPACING.sm,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    symbolContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    symbol: {
        fontSize: FONTS.sizes.lg,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: FONTS.sizes.lg,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    changeText: {
        fontSize: FONTS.sizes.sm,
        fontFamily: FONTS.medium,
    },
    positiveText: {
        color: COLORS.positive,
    },
    negativeText: {
        color: COLORS.negative,
    },
    quickBuyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.accent,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        borderRadius: RADIUS.sm,
    },
    quickBuyText: {
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.bold,
        color: '#000',
    },
    disabledText: {
        opacity: 0.5,
    },
});
