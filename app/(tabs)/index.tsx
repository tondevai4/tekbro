import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { useCryptoStore } from '../../store/useCryptoStore';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { TrendingUp, TrendingDown, Activity, Trophy, Flame, Search, LogOut } from 'lucide-react-native';
import { AppBackground } from '../../components/AppBackground';
import { AssetList } from '../../components/AssetList';
import { AchievementsSection } from '../../components/AchievementsSection';
import { DailyChallengeCard } from '../../components/DailyChallengeCard';
import { BestTradesCard } from '../../components/BestTradesCard';
import { TradeHistoryModal } from '../../components/TradeHistoryModal';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { LevelDetailModal } from '../../components/LevelDetailModal';
import { StreakDetailModal } from '../../components/StreakDetailModal';
import { UnifiedSearchModal } from '../../components/UnifiedSearchModal';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { NetWorthModal } from '../../components/NetWorthModal';
import { useTheme } from '../../hooks/useTheme';

// Memoized Header Component
const PortfolioHeader = React.memo(({
    username,
    netWorth,
    cash,
    cryptoValue,
    totalChange,
    totalChangePercent,
    level,
    xp,
    streak,
    tradesCount,
    onLevelPress,
    onStreakPress,
    onReset,
    onSearchPress,
    onNetWorthPress
}: any) => {
    const { theme } = useTheme();

    return (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <View>
                    <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back,</Text>
                    <Text style={[styles.username, { color: theme.text }]}>{username || 'Trader'}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={onSearchPress} style={styles.settingsButton}>
                        <Search size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onReset} style={styles.settingsButton}>
                        <LogOut size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Stats Row */}
            <View style={styles.statsRow}>
                <TouchableOpacity
                    style={[styles.statBadge, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={onLevelPress}
                    activeOpacity={0.7}
                >
                    <Trophy size={14} color={theme.accent} />
                    <AnimatedCounter
                        value={level}
                        prefix="Lvl "
                        style={[styles.statText, { color: theme.text }]}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.statBadge, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={onStreakPress}
                    activeOpacity={0.7}
                >
                    <Flame size={14} color="#F59E0B" />
                    <AnimatedCounter
                        value={streak}
                        suffix=" Day Streak"
                        style={[styles.statText, { color: '#F59E0B' }]}
                    />
                </TouchableOpacity>

                <View style={[styles.statBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Activity size={14} color={theme.positive} />
                    <AnimatedCounter
                        value={tradesCount}
                        suffix=" Trades"
                        style={[styles.statText, { color: theme.positive }]}
                    />
                </View>
            </View>

            {/* Net Worth Card */}
            <TouchableOpacity activeOpacity={0.9} onPress={onNetWorthPress}>
                <LinearGradient
                    colors={theme.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.netWorthCard, { borderColor: 'rgba(255,255,255,0.1)' }]}
                >
                    <View style={styles.netWorthHeader}>
                        <Text style={[styles.netWorthLabel, { color: 'rgba(255,255,255,0.7)' }]}>Total Net Worth</Text>
                        <View style={[styles.changeBadge, { backgroundColor: totalChange >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                            {totalChange >= 0 ? <TrendingUp size={14} color={theme.positive} /> : <TrendingDown size={14} color={theme.negative} />}
                            <Text style={[styles.changeText, { color: totalChange >= 0 ? theme.positive : theme.negative }]}>
                                {totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
                            </Text>
                        </View>
                    </View>

                    <AnimatedCounter
                        value={netWorth}
                        prefix="£"
                        style={[styles.netWorthValue, { color: theme.white }]}
                        formatter={(val) => `£${Math.floor(val).toLocaleString()}`}
                    />

                    <View style={styles.balanceRow}>
                        <View style={styles.balanceItem}>
                            <Text style={[styles.balanceLabel, { color: 'rgba(255,255,255,0.6)' }]}>Cash</Text>
                            <Text style={[styles.balanceText, { color: theme.white }]}>£{cash.toLocaleString()}</Text>
                        </View>
                        <View style={styles.balanceDivider} />
                        <View style={styles.balanceItem}>
                            <Text style={[styles.balanceLabel, { color: 'rgba(255,255,255,0.6)' }]}>Crypto</Text>
                            <Text style={[styles.balanceText, { color: theme.white }]}>£{cryptoValue.toLocaleString()}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
});

export default function PortfolioScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showNetWorthModal, setShowNetWorthModal] = useState(false);
    const [historyVisible, setHistoryVisible] = useState(false);
    const [selectedTradeId, setSelectedTradeId] = useState<string | undefined>(undefined);

    const {
        cash,
        holdings,
        stocks,
        username,
        level,
        xp,
        loginStreak,
        lastLoginDate,
        trades,
        achievements,
        dailyChallenges,
        reset
    } = useStore();

    const { getTotalCryptoValue, cryptos, cryptoHoldings } = useCryptoStore();
    const cryptoValue = getTotalCryptoValue();

    // Calculate Portfolio Value
    const portfolioValue = useMemo(() => {
        return Object.values(holdings).reduce((sum, h) => {
            const stock = stocks.find(s => s.symbol === h.symbol);
            return sum + (h.quantity * (stock?.price || 0));
        }, 0);
    }, [holdings, stocks]);

    const netWorth = cash + portfolioValue + cryptoValue;
    const initialCapital = 1000000;
    const totalChange = netWorth - initialCapital;
    const totalChangePercent = (totalChange / initialCapital) * 100;

    // Combine Stocks and Crypto for Asset List
    const allAssets = useMemo(() => {
        const stockAssets = Object.values(holdings).map(h => {
            const stock = stocks.find(s => s.symbol === h.symbol);
            if (!stock) return null;
            return {
                ...stock,
                type: 'stock' as const
            };
        }).filter(Boolean);

        const cryptoAssets = Object.values(cryptoHoldings).map(h => {
            const crypto = cryptos.find(c => c.symbol === h.symbol);
            if (!crypto) return null;
            return {
                ...crypto,
                type: 'crypto' as const
            };
        }).filter(Boolean);

        const combined = [...stockAssets, ...cryptoAssets];

        return combined.sort((a: any, b: any) => {
            return a.symbol.localeCompare(b.symbol);
        });
    }, [holdings, stocks, cryptoHoldings, cryptos]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const handleReset = () => {
        Alert.alert(
            "Reset Portfolio",
            "Are you sure? This will wipe all progress, trades, and achievements.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset Everything",
                    style: "destructive",
                    onPress: () => {
                        reset();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                }
            ]
        );
    };

    return (
        <AppBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    <PortfolioHeader
                        username={username}
                        netWorth={netWorth}
                        cash={cash}
                        cryptoValue={cryptoValue}
                        totalChange={totalChange}
                        totalChangePercent={totalChangePercent}
                        level={level}
                        xp={xp}
                        streak={loginStreak}
                        lastLoginDate={lastLoginDate}
                        tradesCount={trades.length}
                        onLevelPress={() => {
                            Haptics.selectionAsync();
                            setShowLevelModal(true);
                        }}
                        onStreakPress={() => {
                            Haptics.selectionAsync();
                            setShowStreakModal(true);
                        }}
                        onReset={handleReset}
                        onSearchPress={() => setShowSearchModal(true)}
                        onNetWorthPress={() => {
                            Haptics.selectionAsync();
                            setShowNetWorthModal(true);
                        }}
                    />

                    <View style={[styles.section, { paddingHorizontal: SPACING.lg }]}>
                        <DailyChallengeCard challenge={dailyChallenges?.challenges[0] || null} />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Your Assets</Text>
                            <TouchableOpacity onPress={() => setShowSearchModal(true)}>
                                <Text style={styles.seeAll}>Trade</Text>
                            </TouchableOpacity>
                        </View>
                        <AssetList assets={allAssets} />
                    </View>

                    <AchievementsSection achievements={achievements} />

                    <View style={[styles.section, { marginBottom: 100 }]}>
                        <BestTradesCard
                            trades={trades}
                            onViewAll={() => {
                                setSelectedTradeId(undefined);
                                setHistoryVisible(true);
                            }}
                            onTradePress={(id) => {
                                setSelectedTradeId(id);
                                setHistoryVisible(true);
                            }}
                        />
                    </View>
                </ScrollView>

                <TradeHistoryModal
                    visible={historyVisible}
                    onClose={() => setHistoryVisible(false)}
                    initialTradeId={selectedTradeId}
                />

                <LevelDetailModal
                    visible={showLevelModal}
                    onClose={() => setShowLevelModal(false)}
                    level={level}
                    xp={xp}
                />

                <StreakDetailModal
                    visible={showStreakModal}
                    onClose={() => setShowStreakModal(false)}
                    streak={loginStreak}
                    lastLoginDate={lastLoginDate}
                />

                <UnifiedSearchModal
                    visible={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                />

                <NetWorthModal
                    visible={showNetWorthModal}
                    onClose={() => setShowNetWorthModal(false)}
                    netWorth={netWorth}
                    cash={cash}
                    stockValue={portfolioValue}
                    cryptoValue={cryptoValue}
                    totalChange={totalChange}
                    totalChangePercent={totalChangePercent}
                />
            </SafeAreaView>
        </AppBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    greeting: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
    },
    username: {
        fontSize: 24,
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    settingsButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: RADIUS.full,
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
        gap: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    netWorthCard: {
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    netWorthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    netWorthLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
        gap: 4,
    },
    changeText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
    netWorthValue: {
        fontSize: 36,
        fontFamily: FONTS.bold,
        color: '#FFF',
        marginBottom: SPACING.lg,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
    },
    balanceItem: {
        flex: 1,
        alignItems: 'center',
    },
    balanceDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    balanceLabel: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginBottom: 4,
        fontFamily: FONTS.medium,
    },
    balanceText: {
        fontSize: 16,
        color: '#FFF',
        fontFamily: FONTS.bold,
    },
    section: {
        marginTop: SPACING.xl,
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
    seeAll: {
        fontSize: 14,
        color: COLORS.primary,
        fontFamily: FONTS.bold,
    },
});
