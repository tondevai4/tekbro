import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { GlassCard } from '../../components/GlassCard';
import { MiniChart } from '../../components/MiniChart';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme';
import { GRADIENTS, getStockEmoji } from '../../constants/gradients';

export default function PortfolioScreen() {
    const { stocks, cash, holdings } = useStore();
    const [refreshing, setRefreshing] = useState(false);

    // Calculate portfolio metrics
    const holdingsArray = Object.entries(holdings).map(([symbol, data]) => {
        const stock = stocks.find(s => s.symbol === symbol);
        if (!stock || data.quantity === 0) return null;

        const currentValue = stock.price * data.quantity;
        const invested = data.averageCost * data.quantity;
        const gain = currentValue - invested;
        const gainPercent = (gain / invested) * 100;

        return {
            symbol,
            stock,
            quantity: data.quantity,
            currentValue,
            invested,
            gain,
            gainPercent,
        };
    }).filter(Boolean);

    const totalInvested = holdingsArray.reduce((sum, h) => sum + (h?.invested || 0), 0);
    const totalValue = holdingsArray.reduce((sum, h) => sum + (h?.currentValue || 0), 0);
    const totalGain = totalValue - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    const netWorth = cash + totalValue;

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const renderHoldingCard = ({ item }: any) => {
        const isGain = item.gain >= 0;
        const gradient = isGain ? GRADIENTS.gainSubtle : GRADIENTS.lossSubtle;
        const emoji = getStockEmoji(item.symbol);

        return (
            <TouchableOpacity style={styles.holdingCard} activeOpacity={0.8}>
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.holdingGradient}
                >
                    {/* Emoji Icon */}
                    <View style={styles.emojiContainer}>
                        <Text style={styles.emoji}>{emoji}</Text>
                    </View>

                    {/* Stock Info */}
                    <View style={styles.holdingInfo}>
                        <Text style={styles.holdingSymbol}>{item.symbol}</Text>
                        <Text style={styles.holdingQuantity}>{item.quantity} shares</Text>
                    </View>

                    {/* Mini Chart */}
                    <View style={styles.chartContainer}>
                        <MiniChart
                            data={item.stock.history}
                            color={isGain ? COLORS.positive : COLORS.negative}
                            width={60}
                            height={30}
                        />
                    </View>

                    {/* Value & Gain */}
                    <View style={styles.holdingValues}>
                        <Text style={styles.holdingValue}>£{item.currentValue.toFixed(2)}</Text>
                        <View style={styles.gainBadge}>
                            {isGain ? (
                                <TrendingUp size={12} color={COLORS.positive} strokeWidth={3} />
                            ) : (
                                <TrendingDown size={12} color={COLORS.negative} strokeWidth={3} />
                            )}
                            <Text style={[styles.gainText, { color: isGain ? COLORS.positive : COLORS.negative }]}>
                                {isGain ? '+' : ''}{item.gainPercent.toFixed(2)}%
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="light" />

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.accent}
                    />
                }
            >
                {/* Header - Portfolio Value */}
                <LinearGradient
                    colors={['#000000', '#0A0A0A']}
                    style={styles.header}
                >
                    <Text style={styles.headerLabel}>Portfolio Value</Text>
                    <Text style={styles.portfolioValue}>£{netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>

                    {/* Today's Gain Card */}
                    <GlassCard style={styles.gainCard}>
                        <View style={styles.gainCardContent}>
                            <Text style={styles.gainLabel}>Total P&L</Text>
                            <View style={styles.gainRow}>
                                {totalGain >= 0 ? (
                                    <TrendingUp size={20} color={COLORS.positive} strokeWidth={3} />
                                ) : (
                                    <TrendingDown size={20} color={COLORS.negative} strokeWidth={3} />
                                )}
                                <Text style={[styles.gainValue, { color: totalGain >= 0 ? COLORS.positive : COLORS.negative }]}>
                                    {totalGain >= 0 ? '+' : ''}£{Math.abs(totalGain).toFixed(2)}
                                </Text>
                                <Text style={[styles.gainPercent, { color: totalGain >= 0 ? COLORS.positive : COLORS.negative }]}>
                                    ({totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%)
                                </Text>
                            </View>
                        </View>
                    </GlassCard>
                </LinearGradient>

                {/* Holdings Grid */}
                <View style={styles.holdingsSection}>
                    <Text style={styles.sectionTitle}>Your Holdings</Text>
                    {holdingsArray.length > 0 ? (
                        <View style={styles.holdingsGrid}>
                            {holdingsArray.map((holding, index) => (
                                <View key={holding.symbol} style={{ flex: 1, minWidth: '48%' }}>
                                    {renderHoldingCard({ item: holding })}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <GlassCard style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No holdings yet</Text>
                            <Text style={styles.emptySubtext}>Start trading to build your portfolio</Text>
                        </GlassCard>
                    )}
                </View>

                {/* Stats Footer */}
                <View style={styles.statsFooter}>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statLabel}>Cash</Text>
                        <Text style={styles.statValue}>£{cash.toFixed(2)}</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statLabel}>Invested</Text>
                        <Text style={styles.statValue}>£{totalInvested.toFixed(2)}</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statLabel}>Return</Text>
                        <Text style={[styles.statValue, { color: totalGain >= 0 ? COLORS.positive : COLORS.negative }]}>
                            {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}%
                        </Text>
                    </GlassCard>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        padding: SPACING.xxl,
        paddingTop: SPACING.xl,
    },
    headerLabel: {
        fontSize: 14,
        color: COLORS.textSub,
        fontFamily: FONTS.medium,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
    },
    portfolioValue: {
        fontSize: 56,
        fontWeight: '800',
        color: COLORS.text,
        fontFamily: FONTS.bold,
        letterSpacing: -2,
        marginBottom: SPACING.lg,
    },
    gainCard: {
        marginTop: SPACING.md,
    },
    gainCardContent: {
        gap: SPACING.sm,
    },
    gainLabel: {
        fontSize: 12,
        color: COLORS.textSub,
        fontFamily: FONTS.medium,
    },
    gainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    gainValue: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: FONTS.bold,
    },
    gainPercent: {
        fontSize: 16,
        fontFamily: FONTS.semibold,
    },
    holdingsSection: {
        padding: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.lg,
    },
    holdingsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    holdingCard: {
        marginBottom: SPACING.md,
    },
    holdingGradient: {
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    emojiContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    emoji: {
        fontSize: 24,
    },
    holdingInfo: {
        marginBottom: SPACING.sm,
    },
    holdingSymbol: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    holdingQuantity: {
        fontSize: 12,
        color: COLORS.textSub,
        fontFamily: FONTS.regular,
    },
    chartContainer: {
        marginVertical: SPACING.sm,
    },
    holdingValues: {
        marginTop: SPACING.sm,
    },
    holdingValue: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.xs,
    },
    gainBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    gainText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: FONTS.semibold,
    },
    emptyCard: {
        padding: SPACING.xxl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSub,
        fontFamily: FONTS.semibold,
        marginBottom: SPACING.xs,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontFamily: FONTS.regular,
    },
    statsFooter: {
        flexDirection: 'row',
        gap: SPACING.md,
        padding: SPACING.xl,
    },
    statCard: {
        flex: 1,
        padding: SPACING.lg,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSub,
        fontFamily: FONTS.medium,
        marginBottom: SPACING.xs,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
});
