import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stock } from '../types';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { Star, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import * as Haptics from 'expo-haptics';

interface StockCardProps {
    stock: Stock;
}

// Sector emoji mapping
const SECTOR_EMOJI: Record<string, string> = {
    'Tech': '💻',
    'Finance': '💰',
    'Healthcare': '🏥',
    'Consumer': '🛍️',
    'Crypto': '🪙',
    'Energy': '⚡',
    'Meme': '🎮',
    'Luxury': '💎',
    'Index': '📊'
};

const StockCardComponent: React.FC<StockCardProps> = ({ stock }) => {
    const router = useRouter();
    const { toggleWatchlist, watchlist } = useStore();
    const isWatched = watchlist.includes(stock.symbol);

    const priceChange = stock.history && stock.history.length >= 2
        ? stock.price - stock.history[stock.history.length - 2].value
        : 0;
    const percentChange = stock.history && stock.history.length >= 2
        ? (priceChange / stock.history[stock.history.length - 2].value) * 100
        : 0;

    const isPositive = priceChange >= 0;
    const sectorEmoji = SECTOR_EMOJI[stock.sector] || '📈';

    const handlePress = () => {
        Haptics.selectionAsync();
        router.push(`/stock/${stock.id}`);
    };

    const handleQuickBuy = (e: any) => {
        e.stopPropagation();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({ pathname: `/stock/${stock.id}`, params: { action: 'buy' } });
    };

    const handleWatchlist = (e: any) => {
        e.stopPropagation();
        toggleWatchlist(stock.symbol);
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
            <View style={styles.leftContent}>
                <View style={[styles.iconContainer, { backgroundColor: isPositive ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255, 70, 70, 0.1)' }]}>
                    <Text style={styles.emoji}>{sectorEmoji}</Text>
                </View>
                <View>
                    <Text style={styles.symbol}>{stock.symbol}</Text>
                    <Text style={styles.name} numberOfLines={1}>{stock.name}</Text>
                </View>
            </View>

            <View style={styles.rightContent}>
                <View style={{ alignItems: 'flex-end', marginRight: SPACING.md }}>
                    <Text style={styles.price}>£{(stock.price || 0).toFixed(2)}</Text>
                    <Text style={[styles.change, { color: isPositive ? COLORS.positive : COLORS.negative }]}>
                        {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
                    </Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity onPress={handleQuickBuy} style={styles.actionButton}>
                        <Zap size={20} color={COLORS.accent} fill={COLORS.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleWatchlist} style={styles.actionButton}>
                        <Star
                            size={20}
                            color={isWatched ? COLORS.accent : COLORS.textSub}
                            fill={isWatched ? COLORS.accent : 'transparent'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Memoize to prevent unnecessary re-renders when stock price hasn't changed
export const StockCard = React.memo(StockCardComponent, (prevProps, nextProps) => {
    return (
        prevProps.stock.symbol === nextProps.stock.symbol &&
        prevProps.stock.price === nextProps.stock.price &&
        prevProps.stock.history.length === nextProps.stock.history.length
    );
});

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    emoji: {
        fontSize: 24,
    },
    symbol: {
        color: COLORS.text,
        fontSize: FONTS.sizes.md,
        fontFamily: FONTS.weights.bold,
    },
    name: {
        color: COLORS.textSub,
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.weights.regular,
        maxWidth: 120,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        color: COLORS.text,
        fontSize: FONTS.sizes.md,
        fontFamily: FONTS.weights.bold,
        textAlign: 'right',
    },
    change: {
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.weights.medium,
        textAlign: 'right',
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    actionButton: {
        padding: SPACING.xs,
    }
});
