import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, TrendingUp, TrendingDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { GlassCard } from '../../components/GlassCard';
import { MiniChart } from '../../components/MiniChart';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { GRADIENTS, getStockEmoji } from '../../constants/gradients';
import { useMarketEngine } from '../../hooks/useMarketEngine';

type SectorFilter = 'All' | 'Tech' | 'Finance' | 'Healthcare' | 'Energy' | 'Crypto';

export default function MarketScreen() {
    useMarketEngine();
    const router = useRouter();
    const { stocks } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [sectorFilter, setSectorFilter] = useState<SectorFilter>('All');

    const sectors: SectorFilter[] = ['All', 'Tech', 'Finance', 'Healthcare', 'Energy', 'Crypto'];

    const filteredStocks = useMemo(() => {
        let result = stocks;

        // Filter by sector
        if (sectorFilter !== 'All') {
            result = result.filter(s => s.sector === sectorFilter);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.symbol.toLowerCase().includes(query) ||
                s.name.toLowerCase().includes(query)
            );
        }

        return result;
    }, [stocks, searchQuery, sectorFilter]);

    const handleSectorFilter = (sector: SectorFilter) => {
        setSectorFilter(sector);
        Haptics.selectionAsync();
    };

    const handleStockPress = (symbol: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/stock/${symbol}`);
    };

    const renderStockCard = ({ item }: any) => {
        const priceChange = item.history.length >= 2
            ? item.price - item.history[item.history.length - 2].value
            : 0;
        const priceChangePercent = item.history.length >= 2
            ? (priceChange / item.history[item.history.length - 2].value) * 100
            : 0;
        const isPositive = priceChange >= 0;
        const emoji = getStockEmoji(item.symbol);

        return (
            <TouchableOpacity
                onPress={() => handleStockPress(item.symbol)}
                activeOpacity={0.8}
            >
                <GlassCard style={styles.stockCard}>
                    <View style={styles.stockHeader}>
                        {/* Emoji Icon */}
                        <View style={styles.emojiContainer}>
                            <Text style={styles.emoji}>{emoji}</Text>
                        </View>

                        {/* Stock Info */}
                        <View style={styles.stockInfo}>
                            <Text style={styles.stockSymbol}>{item.symbol}</Text>
                            <Text style={styles.stockName} numberOfLines={1}>{item.name}</Text>
                        </View>

                        {/* Mini Chart */}
                        <View style={styles.chartContainer}>
                            <MiniChart
                                data={item.history}
                                color={isPositive ? COLORS.positive : COLORS.negative}
                                width={80}
                                height={40}
                            />
                        </View>
                    </View>

                    {/* Price & Buy Button */}
                    <View style={styles.stockFooter}>
                        <View style={styles.priceSection}>
                            <Text style={styles.price}>£{item.price.toFixed(2)}</Text>
                            <View style={[styles.changeBadge, { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                                {isPositive ? (
                                    <TrendingUp size={12} color={COLORS.positive} strokeWidth={3} />
                                ) : (
                                    <TrendingDown size={12} color={COLORS.negative} strokeWidth={3} />
                                )}
                                <Text style={[styles.changeText, { color: isPositive ? COLORS.positive : COLORS.negative }]}>
                                    {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => handleStockPress(item.symbol)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={GRADIENTS.buy}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buyButton}
                            >
                                <Text style={styles.buyButtonText}>Buy</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </GlassCard>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Market</Text>

                {/* Search Bar */}
                <LinearGradient
                    colors={['rgba(6, 182, 212, 0.2)', 'rgba(6, 182, 212, 0.05)']}
                    style={styles.searchContainer}
                >
                    <Search size={20} color={COLORS.textSub} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search stocks..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </LinearGradient>

                {/* Sector Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersScroll}
                    contentContainerStyle={styles.filtersContainer}
                >
                    {sectors.map(sector => (
                        <TouchableOpacity
                            key={sector}
                            onPress={() => handleSectorFilter(sector)}
                            activeOpacity={0.7}
                        >
                            {sectorFilter === sector ? (
                                <LinearGradient
                                    colors={GRADIENTS.portfolio}
                                    style={styles.filterChip}
                                >
                                    <Text style={styles.filterChipTextActive}>{sector}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.filterChipInactive}>
                                    <Text style={styles.filterChipText}>{sector}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Stock List */}
            <FlatList
                data={filteredStocks}
                keyExtractor={item => item.symbol}
                renderItem={renderStockCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
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
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.lg,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(6, 182, 212, 0.3)',
        marginBottom: SPACING.lg,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: 16,
        color: COLORS.text,
        fontFamily: FONTS.regular,
    },
    filtersScroll: {
        marginBottom: SPACING.md,
    },
    filtersContainer: {
        gap: SPACING.sm,
    },
    filterChip: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
    },
    filterChipInactive: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.bgSubtle,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterChipTextActive: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        fontFamily: FONTS.semibold,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSub,
        fontFamily: FONTS.semibold,
    },
    listContent: {
        padding: SPACING.xl,
        gap: SPACING.md,
    },
    stockCard: {
        padding: SPACING.lg,
    },
    stockHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    emojiContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    emoji: {
        fontSize: 24,
    },
    stockInfo: {
        flex: 1,
    },
    stockSymbol: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    stockName: {
        fontSize: 13,
        color: COLORS.textSub,
        fontFamily: FONTS.regular,
    },
    chartContainer: {
        marginLeft: SPACING.sm,
    },
    stockFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceSection: {
        flex: 1,
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.xs,
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: FONTS.semibold,
    },
    buyButton: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
    },
    buyButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        fontFamily: FONTS.bold,
    },
});
