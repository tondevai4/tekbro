import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
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
    // OPTIMIZATION: Select only what we need to prevent re-renders
    const watchlist = useStore(state => state.watchlist);
    const toggleWatchlist = useStore(state => state.toggleWatchlist);
    const buyStock = useStore(state => state.buyStock);
    const cash = useStore(state => state.cash);

    const isWatchlisted = watchlist.includes(stock.symbol);

    // Animation for press effect
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Calculate price change
    const priceChange = stock.history.length >= 2
        ? stock.price - stock.history[stock.history.length - 2].value
        : 0;
    const changePercent = stock.history.length >= 2
        ? (priceChange / stock.history[stock.history.length - 2].value) * 100
        : 0;

    const isPositive = priceChange >= 0;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            tension: 400,
            friction: 15,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 400,
            friction: 15,
            useNativeDriver: true,
        }).start();
    };

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
        // FIFA Style: Deep, rich backgrounds
        if (isPositive) {
            return ['rgba(13, 77, 77, 0.8)', 'rgba(26, 95, 95, 0.4)']; // Deep Cyan/Green Glass
        } else {
            return ['rgba(77, 26, 26, 0.8)', 'rgba(95, 38, 38, 0.4)']; // Deep Red/Maroon Glass
        }
    };

    const getBorderColor = () => {
        if (isPositive) return COLORS.accent; // Glowing Cyan
        return '#FF4444'; // Glowing Red
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                onPress={() => router.push(`/stock/${stock.symbol}`)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <LinearGradient
                    colors={getGradientColors()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, { borderColor: getBorderColor() }]}
                >
                    <View style={styles.cardContent}>
                        {/* Left: Icon & Rank */}
                        <View style={styles.leftSection}>
                            <View style={[styles.iconContainer, { shadowColor: getBorderColor() }]}>
                                {/* Icons removed - can add lucide icons here later */}
                            </View>
                            {/* Momentum Badge (FIFA "Form") */}
                            {Math.abs(changePercent) > 2 && (
                                <View style={styles.badge}>
                                    <Zap size={10} color="#000" fill="#000" />
                                    <Text style={styles.badgeText}>HOT</Text>
                                </View>
                            )}
                        </View>

                        {/* Center: Info */}
                        <View style={styles.centerSection}>
                            <View style={styles.nameRow}>
                                <Text style={styles.symbol}>{stock.symbol}</Text>
                                <TouchableOpacity onPress={handleToggleWatchlist}>
                                    <Star
                                        size={14}
                                        color={isWatchlisted ? '#FFD700' : 'rgba(255,255,255,0.3)'}
                                        fill={isWatchlisted ? '#FFD700' : 'transparent'}
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.companyName} numberOfLines={1}>
                                {stock.name}
                            </Text>
                        </View>

                        {/* Right: Price & Action */}
                        <View style={styles.rightSection}>
                            <Text style={styles.price}>
                                £{stock.price.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </Text>
                            <View style={[styles.changeBadge, { backgroundColor: isPositive ? 'rgba(0,255,255,0.1)' : 'rgba(255,0,0,0.1)' }]}>
                                {isPositive ? <TrendingUp size={12} color={COLORS.accent} /> : <TrendingDown size={12} color="#FF4444" />}
                                <Text style={[styles.changeText, { color: isPositive ? COLORS.accent : '#FF4444' }]}>
                                    {changePercent.toFixed(2)}%
                                </Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
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
        marginBottom: SPACING.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    card: {
        borderRadius: RADIUS.xl,
        borderWidth: 1.5, // Thicker border for "Card" feel
        padding: 0, // Reset padding for inner content
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    leftSection: {
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.lg,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    iconText: {
        fontSize: 32,
    },
    badge: {
        position: 'absolute',
        bottom: -6,
        backgroundColor: COLORS.accent,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        shadowColor: COLORS.accent,
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    badgeText: {
        fontSize: 8,
        fontFamily: FONTS.bold,
        color: '#000',
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    symbol: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#FFF',
        letterSpacing: 0.5,
    },
    companyName: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.6)',
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    price: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#FFF',
        marginBottom: 4,
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.md,
        gap: 4,
    },
    changeText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
});
