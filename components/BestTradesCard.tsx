import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, ArrowUpRight, Trophy } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { Trade } from '../types';

interface Props {
    trades: Trade[];
    onTradePress: (tradeId: string) => void;
    onViewAll: () => void;
}

export function BestTradesCard({ trades, onTradePress, onViewAll }: Props) {
    // Filter for profitable trades and sort by profit amount
    const bestTrades = trades
        .filter(t => t.pnl && t.pnl > 0)
        .sort((a, b) => (b.pnl || 0) - (a.pnl || 0))
        .slice(0, 5); // Top 5

    if (bestTrades.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No profitable trades yet. Start trading!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Best Trades</Text>
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {bestTrades.map((trade, index) => (
                    <TouchableOpacity
                        key={trade.id}
                        activeOpacity={0.7}
                        onPress={() => onTradePress(trade.id)}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                            style={styles.card}
                        >
                            <View style={styles.header}>
                                <View style={styles.rankBadge}>
                                    <Trophy size={10} color={index === 0 ? '#FFD700' : COLORS.textTertiary} />
                                    <Text style={[styles.rankText, index === 0 && { color: '#FFD700' }]}>#{index + 1}</Text>
                                </View>
                                <Text style={styles.date}>{new Date(trade.timestamp).toLocaleDateString()}</Text>
                            </View>

                            <View style={styles.mainInfo}>
                                <Text style={styles.symbol}>{trade.symbol}</Text>
                                <View style={styles.pnlBadge}>
                                    <ArrowUpRight size={14} color={COLORS.success} />
                                    <Text style={styles.pnlText}>+£{trade.pnl?.toFixed(2)}</Text>
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <Text style={styles.type}>{trade.type === 'BUY' ? 'Long' : 'Short'}</Text>
                                <Text style={styles.returnText}>
                                    +{(((trade.pnl || 0) / (trade.price * trade.quantity)) * 100).toFixed(1)}%
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    viewAllText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.primary,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    emptyContainer: {
        padding: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
    },
    card: {
        width: 160,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    rankText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        color: COLORS.textTertiary,
    },
    date: {
        fontSize: 10,
        color: COLORS.textTertiary,
        fontFamily: FONTS.regular,
    },
    mainInfo: {
        marginBottom: SPACING.md,
    },
    symbol: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginBottom: 4,
    },
    pnlBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    pnlText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: COLORS.success,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 8,
    },
    type: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
        textTransform: 'uppercase',
    },
    returnText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: COLORS.success,
    },
});
