import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { TrendingUp, TrendingDown, Star, ChevronLeft, Building2, Activity } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { playSound } from '../../utils/sounds';
import { TradeModal } from '../../components/TradeModal';

export default function StockDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { stocks, cash, holdings, buyStock, sellStock, watchlist, toggleWatchlist } = useStore();

    // id parameter is actually the symbol from the router
    const stock = stocks.find(s => s.symbol === id);
    const [showModal, setShowModal] = useState(false);
    const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
    const [quantity, setQuantity] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    if (!stock) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Stock not found</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isStarred = watchlist.includes(stock.symbol);
    const ownedShares = holdings[stock.symbol]?.quantity || 0;
    const ownedValue = ownedShares * stock.price;
    const averageCost = holdings[stock.symbol]?.averageCost || 0;

    // Calculate price change from SESSION START (must match StockCard!)
    const priceChange = stock.history.length >= 2
        ? stock.price - stock.history[stock.history.length - 2].value
        : 0;
    const priceChangePercent = stock.history.length >= 2
        ? (priceChange / stock.history[stock.history.length - 2].value) * 100
        : 0;

    const isPositive = priceChange >= 0;

    const handleTrade = async (qty: number) => {
        try {
            if (tradeType === 'BUY') {
                if (cash < qty * stock.price) {
                    Alert.alert('Insufficient Funds', 'You cannot afford this trade.');
                    return;
                }
                await buyStock(stock.symbol, qty, stock.price);
                playSound('buy');
            } else {
                if (ownedShares < qty) {
                    Alert.alert('Insufficient Shares', 'You do not own enough shares.');
                    return;
                }

                const isProfitable = (stock.price - averageCost) > 0;
                const profitPercent = averageCost > 0 ? ((stock.price - averageCost) / averageCost) * 100 : 0;

                await sellStock(stock.symbol, qty, stock.price);

                if (isProfitable) {
                    playSound('sell_profit');
                    if (profitPercent > 5) {
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 5000);
                    }
                } else {
                    playSound('sell_loss');
                }
            }

            setShowModal(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', `${tradeType === 'BUY' ? 'Bought' : 'Sold'} ${qty} shares of ${stock.symbol}`);
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Transaction failed');
        }
    };

    const volatilityLabel = stock.volatility <= 3 ? 'Low' : stock.volatility <= 7 ? 'Medium' : 'High';
    const volatilityColor = stock.volatility <= 3 ? COLORS.positive : stock.volatility <= 7 ? COLORS.warning : COLORS.negative;

    return (
        <SafeAreaView style={styles.container}>
            {showConfetti && (
                <ConfettiCannon
                    count={200}
                    origin={{ x: -10, y: 0 }}
                    autoStart={true}
                    fadeOut={true}
                />
            )}
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.text} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { toggleWatchlist(stock.symbol); Haptics.selectionAsync(); }}>
                    <Star
                        size={24}
                        color={isStarred ? COLORS.warning : COLORS.textMuted}
                        fill={isStarred ? COLORS.warning : 'none'}
                        strokeWidth={2}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Stock Title */}
                <View style={styles.titleSection}>
                    <Text style={styles.symbol}>{stock.symbol}</Text>
                    <Text style={styles.companyName}>{stock.name}</Text>
                    {stock.description && (
                        <Text style={styles.description}>{stock.description}</Text>
                    )}
                </View>

                {/* Price Card */}
                <View style={styles.priceCard}>
                    <Text style={styles.priceLabel}>Current Price</Text>
                    <Text style={styles.price}>£{stock.price.toFixed(2)}</Text>
                    <View style={[
                        styles.changeBadge,
                        { backgroundColor: isPositive ? COLORS.positiveSubtle : COLORS.negativeSubtle }
                    ]}>
                        {isPositive ? (
                            <TrendingUp size={16} color={COLORS.positive} strokeWidth={2.5} />
                        ) : (
                            <TrendingDown size={16} color={COLORS.negative} strokeWidth={2.5} />
                        )}
                        <Text style={[styles.changeText, { color: isPositive ? COLORS.positive : COLORS.negative }]}>
                            {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}% Today
                        </Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: COLORS.accentSubtle }]}>
                            <Building2 size={18} color={COLORS.accent} />
                        </View>
                        <Text style={styles.statLabel}>Market Cap</Text>
                        <Text style={styles.statValue}>£{(stock.marketCap / 1e9).toFixed(1)}B</Text>
                    </View>

                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: volatilityColor + '20' }]}>
                            <Activity size={18} color={volatilityColor} />
                        </View>
                        <Text style={styles.statLabel}>Volatility</Text>
                        <Text style={[styles.statValue, { color: volatilityColor }]}>{volatilityLabel} ({stock.volatility}/10)</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>52-Week Range</Text>
                        <View style={styles.rangeContainer}>
                            <Text style={[styles.rangeValue, { color: COLORS.negative }]}>
                                £{Math.min(...stock.history.map(h => h.value)).toFixed(2)}
                            </Text>
                            <Text style={styles.rangeSeparator}>—</Text>
                            <Text style={[styles.rangeValue, { color: COLORS.positive }]}>
                                £{Math.max(...stock.history.map(h => h.value)).toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Sector</Text>
                        <View style={styles.sectorBadge}>
                            <Text style={styles.sectorText}>{stock.sector}</Text>
                        </View>
                    </View>

                    {ownedShares > 0 && (
                        <>
                            <View style={[styles.statItem, styles.ownedCard]}>
                                <Text style={styles.statLabel}>Your Position</Text>
                                <Text style={styles.statValue}>{ownedShares} shares</Text>
                                <Text style={styles.ownedValue}>£{ownedValue.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.statItem, styles.ownedCard]}>
                                <Text style={styles.statLabel}>Average Cost</Text>
                                <Text style={styles.statValue}>£{averageCost.toFixed(2)}</Text>
                                <Text style={[styles.ownedValue, { color: stock.price >= averageCost ? COLORS.positive : COLORS.negative }]}>
                                    {stock.price >= averageCost ? '+' : ''}{((stock.price - averageCost) / averageCost * 100).toFixed(2)}%
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Trading Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.tradeButton, styles.buyButton]}
                    onPress={() => { setTradeType('BUY'); setShowModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                    <Text style={styles.tradeButtonText}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tradeButton, styles.sellButton]}
                    onPress={() => { setTradeType('SELL'); setShowModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    disabled={ownedShares === 0}
                >
                    <Text style={[styles.tradeButtonText, ownedShares === 0 && { opacity: 0.3 }]}>
                        Sell {ownedShares > 0 && `(${ownedShares})`}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Trade Modal */}
            <TradeModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                tradeType={tradeType}
                symbol={stock.symbol}
                price={stock.price}
                cash={cash}
                ownedShares={ownedShares}
                onConfirm={handleTrade}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
    },
    backButton: {
        padding: SPACING.sm,
    },
    content: {
        flex: 1,
    },
    titleSection: {
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.xxl,
    },
    symbol: {
        fontSize: 36,
        fontWeight: '800',
        color: COLORS.text,
        fontFamily: FONTS.bold,
        letterSpacing: -1,
        marginBottom: SPACING.xs,
    },
    companyName: {
        fontSize: 16,
        color: COLORS.textSub,
        fontFamily: FONTS.regular,
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSub,
        fontFamily: FONTS.regular,
        lineHeight: 20,
        marginTop: SPACING.sm,
    },
    priceCard: {
        backgroundColor: COLORS.bgElevated,
        marginHorizontal: SPACING.xl,
        padding: SPACING.xxl,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        marginBottom: SPACING.xxl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    priceLabel: {
        fontSize: 12,
        color: COLORS.textSub,
        fontFamily: FONTS.medium,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
    },
    price: {
        fontSize: 48,
        fontWeight: '800',
        color: COLORS.text,
        fontFamily: FONTS.bold,
        letterSpacing: -2,
        marginBottom: SPACING.md,
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
    },
    changeText: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: FONTS.bold,
    },
    statsGrid: {
        paddingHorizontal: SPACING.xl,
        gap: SPACING.md,
    },
    statItem: {
        backgroundColor: COLORS.bgElevated,
        padding: SPACING.lg,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
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
    sectorBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        backgroundColor: COLORS.accentSubtle,
        borderRadius: RADIUS.sm,
    },
    sectorText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.accent,
        fontFamily: FONTS.semibold,
    },
    ownedCard: {
        backgroundColor: COLORS.accentSubtle,
        borderColor: COLORS.accent,
    },
    ownedValue: {
        fontSize: 14,
        color: COLORS.accent,
        fontFamily: FONTS.medium,
        marginTop: SPACING.xs,
    },
    rangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginTop: SPACING.xs,
    },
    rangeValue: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: FONTS.bold,
    },
    rangeSeparator: {
        fontSize: 16,
        color: COLORS.textMuted,
        fontFamily: FONTS.regular,
    },
    footer: {
        flexDirection: 'row',
        gap: SPACING.md,
        padding: SPACING.xl,
        backgroundColor: COLORS.bg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    tradeButton: {
        flex: 1,
        paddingVertical: SPACING.lg,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    buyButton: {
        backgroundColor: COLORS.positive,
    },
    sellButton: {
        backgroundColor: COLORS.accent,
    },
    tradeButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#000',
        fontFamily: FONTS.bold,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.bgElevated,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.xxl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    inputSection: {
        marginBottom: SPACING.xxl,
    },
    inputLabel: {
        fontSize: 14,
        color: COLORS.textSub,
        fontFamily: FONTS.medium,
        marginBottom: SPACING.sm,
    },
    input: {
        backgroundColor: COLORS.bgSubtle,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        fontSize: 18,
        color: COLORS.text,
        fontFamily: FONTS.bold,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.lg,
    },
    costLabel: {
        fontSize: 14,
        color: COLORS.textSub,
        fontFamily: FONTS.regular,
    },
    costValue: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    availableText: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontFamily: FONTS.regular,
        marginTop: SPACING.sm,
    },
    confirmButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: SPACING.lg,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.3,
    },
    confirmButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#000',
        fontFamily: FONTS.bold,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xxl,
    },
    errorText: {
        fontSize: 20,
        color: COLORS.text,
        fontFamily: FONTS.semibold,
        marginBottom: SPACING.xl,
    },
    backButtonText: {
        color: COLORS.accent,
        fontSize: 16,
        fontFamily: FONTS.semibold,
    },
});
