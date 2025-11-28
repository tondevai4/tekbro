import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, TrendingUp, TrendingDown, Activity, Building2, Info, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { MiniChart } from '../../components/MiniChart';
import { TradeModal } from '../../components/TradeModal';
import { playSound } from '../../utils/sounds';

export default function StockDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    const { stocks, cash, holdings, buyStock, sellStock, watchlist, toggleWatchlist } = useStore();

    // id parameter is actually the symbol from the router
    const stock = stocks.find(s => s.symbol === id);
    const [showModal, setShowModal] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    if (!stock) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.text }]}>Stock not found</Text>
                    <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.bgElevated }]}>
                        <Text style={[styles.backButtonText, { color: theme.primary }]}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isStarred = watchlist.includes(stock.symbol);
    const ownedShares = holdings[stock.symbol]?.quantity || 0;
    const ownedValue = ownedShares * stock.price;
    const averageCost = holdings[stock.symbol]?.averageCost || 0;

    // Calculate price change from SESSION START
    const priceChange = stock.history.length >= 2
        ? stock.price - stock.history[stock.history.length - 2].value
        : 0;
    const priceChangePercent = stock.history.length >= 2
        ? (priceChange / stock.history[stock.history.length - 2].value) * 100
        : 0;

    const isPositive = priceChange >= 0;

    const getGradientColors = () => {
        if (isPositive) {
            return [theme.primary + '20', theme.primary + '05'] as const;
        } else {
            return ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.05)'] as const;
        }
    };

    const handleTrade = async (qty: number, type: 'BUY' | 'SELL') => {
        try {
            if (type === 'BUY') {
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
            Alert.alert('Success', `${type === 'BUY' ? 'Bought' : 'Sold'} ${qty} shares of ${stock.symbol}`);
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Transaction failed');
        }
    };

    const volatilityLabel = stock.volatility <= 3 ? 'Low' : stock.volatility <= 7 ? 'Medium' : 'High';
    const volatilityColor = stock.volatility <= 3 ? theme.positive : stock.volatility <= 7 ? theme.warning : theme.negative;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
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
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.bgElevated }]}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{stock.name}</Text>
                <TouchableOpacity onPress={() => { toggleWatchlist(stock.symbol); Haptics.selectionAsync(); }} style={[styles.backButton, { backgroundColor: theme.bgElevated }]}>
                    <Star
                        size={20}
                        color={isStarred ? theme.warning : theme.textMuted}
                        fill={isStarred ? theme.warning : 'none'}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <View style={styles.iconRow}>
                        <View style={[styles.placeholderLogo, { backgroundColor: theme.bgElevated }]}>
                            <Text style={[styles.placeholderText, { color: theme.text }]}>{stock.symbol[0]}</Text>
                        </View>
                        <View>
                            <Text style={[styles.symbol, { color: theme.text }]}>{stock.symbol}</Text>
                            <Text style={[styles.name, { color: theme.textSub }]}>{stock.name}</Text>
                        </View>
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={[styles.price, { color: theme.text }]}>£{stock.price.toFixed(2)}</Text>
                        <View style={[styles.changeBadge, { backgroundColor: isPositive ? theme.positive + '20' : theme.negative + '20' }]}>
                            {isPositive ? <TrendingUp size={16} color={theme.positive} /> : <TrendingDown size={16} color={theme.negative} />}
                            <Text style={[styles.changeText, { color: isPositive ? theme.positive : theme.negative }]}>
                                {priceChangePercent.toFixed(2)}%
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Chart */}
                <View style={[styles.chartCard, { borderColor: theme.border }]}>
                    <LinearGradient
                        colors={getGradientColors()}
                        style={styles.chartBackground}
                    >
                        <MiniChart
                            data={stock.history}
                            width={320}
                            height={160}
                            color={isPositive ? theme.primary : theme.negative}
                        />
                    </LinearGradient>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statItem, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
                        <View style={[styles.statIcon, { backgroundColor: theme.primary + '20' }]}>
                            <Building2 size={18} color={theme.primary} />
                        </View>
                        <Text style={[styles.statLabel, { color: theme.textSub }]}>Market Cap</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>£{(stock.marketCap / 1e9).toFixed(1)}B</Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
                        <View style={[styles.statIcon, { backgroundColor: volatilityColor + '20' }]}>
                            <Activity size={18} color={volatilityColor} />
                        </View>
                        <Text style={[styles.statLabel, { color: theme.textSub }]}>Volatility</Text>
                        <Text style={[styles.statValue, { color: volatilityColor }]}>{volatilityLabel}</Text>
                    </View>
                </View>

                {/* Position Card */}
                {ownedShares > 0 && (
                    <View style={[styles.positionCard, { borderColor: theme.primary + '50' }]}>
                        <LinearGradient
                            colors={[theme.primary + '30', theme.primary + '10']}
                            style={styles.positionGradient}
                        >
                            <View style={styles.positionHeader}>
                                <Text style={[styles.positionTitle, { color: theme.text }]}>Your Position</Text>
                                <Text style={[styles.positionValue, { color: theme.text }]}>£{ownedValue.toFixed(2)}</Text>
                            </View>
                            <View style={styles.positionDetails}>
                                <View>
                                    <Text style={[styles.positionLabel, { color: theme.textSub }]}>Shares</Text>
                                    <Text style={[styles.positionDetailValue, { color: theme.text }]}>{ownedShares}</Text>
                                </View>
                                <View>
                                    <Text style={[styles.positionLabel, { color: theme.textSub }]}>Avg. Cost</Text>
                                    <Text style={[styles.positionDetailValue, { color: theme.text }]}>£{averageCost.toFixed(2)}</Text>
                                </View>
                                <View>
                                    <Text style={[styles.positionLabel, { color: theme.textSub }]}>Return</Text>
                                    <Text style={[styles.positionDetailValue, { color: stock.price >= averageCost ? theme.positive : theme.negative }]}>
                                        {stock.price >= averageCost ? '+' : ''}{((stock.price - averageCost) / averageCost * 100).toFixed(2)}%
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                )}

                {/* About Section */}
                <View style={styles.aboutSection}>
                    <View style={styles.aboutHeader}>
                        <Info size={16} color={theme.textSub} />
                        <Text style={[styles.aboutTitle, { color: theme.text }]}>About {stock.name}</Text>
                    </View>
                    <Text style={[styles.description, { color: theme.textSub }]}>{stock.description}</Text>
                    <View style={[styles.educationalCard, { backgroundColor: theme.primary + '10', borderLeftColor: theme.primary }]}>
                        <Text style={[styles.educationalTitle, { color: theme.primary }]}>Sector: {stock.sector}</Text>
                        <Text style={[styles.educationalText, { color: theme.text }]}>
                            This stock belongs to the {stock.sector} sector. Keep an eye on industry trends!
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Trade Button */}
            <View style={[styles.footer, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
                <TouchableOpacity
                    style={styles.tradeButton}
                    onPress={() => { setShowModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                >
                    <LinearGradient
                        colors={[theme.primary, theme.primary + 'CC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.tradeGradient}
                    >
                        <Text style={styles.tradeButtonText}>TRADE</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <TradeModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                tradeType="BUY" // Default to BUY, user can toggle in modal
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontFamily: FONTS.semibold,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        marginBottom: SPACING.lg,
    },
    content: {
        flex: 1,
    },
    titleSection: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        gap: SPACING.md,
    },
    placeholderLogo: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 24,
        fontFamily: FONTS.bold,
    },
    symbol: {
        fontSize: 24,
        fontFamily: FONTS.bold,
    },
    name: {
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    priceContainer: {
        alignItems: 'center',
    },
    price: {
        fontSize: 36,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.sm,
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
    },
    changeText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    chartCard: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        borderWidth: 1,
    },
    chartBackground: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    statItem: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    statValue: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    positionCard: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        borderWidth: 1,
    },
    positionGradient: {
        padding: SPACING.lg,
    },
    positionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    positionTitle: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    positionValue: {
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    positionDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    positionLabel: {
        fontSize: 10,
        fontFamily: FONTS.medium,
        marginBottom: 2,
    },
    positionDetailValue: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    aboutSection: {
        padding: SPACING.xl,
        marginBottom: 80, // Space for footer
    },
    aboutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.md,
    },
    aboutTitle: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    description: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        lineHeight: 22,
        marginBottom: SPACING.lg,
    },
    educationalCard: {
        padding: SPACING.lg,
        borderRadius: RADIUS.md,
        borderLeftWidth: 4,
    },
    educationalTitle: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.sm,
    },
    educationalText: {
        fontSize: 13,
        fontFamily: FONTS.regular,
        lineHeight: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.lg,
        borderTopWidth: 1,
    },
    tradeButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    tradeGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    tradeButtonText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#FFF',
        letterSpacing: 1,
    },
});
