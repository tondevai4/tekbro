import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useStore } from '../../store/useStore';
import { StockCard } from '../../components/StockCard';
import { StatsHeader } from '../../components/StatsHeader';
import { Header } from '../../components/Header';
import { MetricCard } from '../../components/MetricCard';
import { AchievementsSection } from '../../components/AchievementsSection';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme';

export default function PortfolioScreen() {
    const { stocks, cash, holdings, xp, level, loginStreak, achievements, watchlist, reset } = useStore();
    const [refreshing, setRefreshing] = useState(false);

    // Calculate total equity
    const stockValue = stocks.reduce((sum, stock) => {
        const quantity = holdings[stock.symbol]?.quantity || 0;
        return sum + (stock.price * quantity);
    }, 0);
    const totalEquity = cash + stockValue;

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    // Filter stocks: Owned OR Watched
    const userStocks = stocks.filter(stock => {
        const isOwned = holdings[stock.symbol]?.quantity > 0;
        const isWatched = watchlist.includes(stock.symbol);
        return isOwned || isWatched;
    }).sort((a, b) => {
        // Sort owned first, then watched
        const aOwned = holdings[a.symbol]?.quantity > 0;
        const bOwned = holdings[b.symbol]?.quantity > 0;
        if (aOwned && !bOwned) return -1;
        if (!aOwned && bOwned) return 1;
        return 0;
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="light" />

            <Header
                title="Portfolio"
                rightComponent={null}
            />

            <View style={styles.content}>
                <FlatList
                    ListHeaderComponent={
                        <View style={styles.headerContent}>
                            <StatsHeader
                                xp={xp}
                                level={level}
                                loginStreak={loginStreak}
                            />

                            <View style={styles.statsRow}>
                                <MetricCard
                                    label="Buying Power"
                                    value={`£${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                />
                                <View style={{ width: SPACING.md }} />
                                <MetricCard
                                    label="Net Worth"
                                    value={`£${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    variant={totalEquity >= 10000 ? 'positive' : 'default'}
                                />
                            </View>

                            <AchievementsSection achievements={achievements} />

                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Your Assets</Text>
                                <Text style={styles.sectionSubtitle}>
                                    {Object.keys(holdings).length} Owned • {watchlist.length} Watched
                                </Text>
                            </View>
                        </View>
                    }
                    data={userStocks}
                    keyExtractor={(item) => item.symbol}
                    renderItem={({ item }) => <StockCard stock={item} />}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.accent}
                            colors={[COLORS.accent]}
                        />
                    }
                    initialNumToRender={8}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No stocks owned or watched yet.</Text>
                            <Text style={styles.emptySubtext}>Visit the Market tab to start trading!</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
    },
    headerContent: {
        marginBottom: SPACING.md,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.xs,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
        paddingTop: 8,
    },
    emptyState: {
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.xl,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONTS.medium,
        marginBottom: 8,
    },
    emptySubtext: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    debugButton: {
        margin: SPACING.xl,
        padding: SPACING.md,
        backgroundColor: COLORS.bgElevated,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    debugText: {
        color: COLORS.warning,
        fontFamily: FONTS.bold,
        fontSize: 14,
    }
});
