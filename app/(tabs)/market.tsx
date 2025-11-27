import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Search, Cpu, Building2, Heart, ShoppingBag, Zap as Lightning,
    Home, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, Briefcase
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { useMarketMoodStore } from '../../store/useMarketMoodStore';
import { StockCard } from '../../components/StockCard';
import { PortfolioDetailModal } from '../../components/PortfolioDetailModal';
import { FearGreedModal } from '../../components/FearGreedModal';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useMarketEngine } from '../../hooks/useMarketEngine';

type SectorFilter = 'All' | 'Tech' | 'Finance' | 'Healthcare' | 'Consumer' | 'Energy' | 'Real Estate';

// Premium sector icon mapping
const SECTOR_ICONS = {
    Tech: Cpu,
    Finance: Building2,
    Healthcare: Heart,
    Consumer: ShoppingBag,
    Energy: Lightning,
    'Real Estate': Home,
};

const SECTOR_COLORS = {
    Tech: ['#00D9FF', '#0099FF'],
    Finance: ['#FFD700', '#FFA500'],
    Healthcare: ['#FF6B9D', '#C44569'],
    Consumer: ['#00FF88', '#00CC66'],
    Energy: ['#FFD93D', '#FF8C00'],
    'Real Estate': ['#A855F7', '#7C3AED'],
};

export default function MarketScreen() {
    useMarketEngine();
    const router = useRouter();
    const { stocks, holdings, cash } = useStore();
    const { fearGreedIndex, getMoodLabel, getMoodColor, marketCyclePhase } = useMarketMoodStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [sectorFilter, setSectorFilter] = useState<SectorFilter>('All');
    const [portfolioModalVisible, setPortfolioModalVisible] = useState(false);
    const [fearGreedModalVisible, setFearGreedModalVisible] = useState(false);

    const sectors: SectorFilter[] = ['All', 'Tech', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Real Estate'];

    // Calculate portfolio metrics
    const portfolioValue = useMemo(() => {
        const holdingsValue = Object.values(holdings).reduce((total, holding) => {
            const stock = stocks.find(s => s.symbol === holding.symbol);
            return total + (stock ? holding.quantity * stock.price : 0);
        }, 0);
        return holdingsValue + cash;
    }, [holdings, stocks, cash]);

    const portfolioPnL = useMemo(() => {
        return Object.values(holdings).reduce((total, holding) => {
            const stock = stocks.find(s => s.symbol === holding.symbol);
            if (!stock) return total;
            const currentValue = holding.quantity * stock.price;
            const costBasis = holding.quantity * holding.averageCost;
            return total + (currentValue - costBasis);
        }, 0);
    }, [holdings, stocks]);

    const portfolioPnLPercent = useMemo(() => {
        const invested = portfolioValue - portfolioPnL;
        return invested > 0 ? (portfolioPnL / invested) * 100 : 0;
    }, [portfolioValue, portfolioPnL]);

    const filteredStocks = useMemo(() => {
        let result = stocks;

        if (sectorFilter !== 'All') {
            result = result.filter(s => s.sector === sectorFilter);
        }

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

    const getCyclePhaseColor = () => {
        switch (marketCyclePhase) {
            case 'early': return '#00FF88';
            case 'mid': return '#00CCFF';
            case 'late': return '#FFD700';
            case 'recession': return '#FF4444';
            default: return '#888';
        }
    };

    const getCyclePhaseLabel = () => {
        switch (marketCyclePhase) {
            case 'early': return 'Early Cycle';
            case 'mid': return 'Mid Cycle';
            case 'late': return 'Late Cycle';
            case 'recession': return 'Recession';
            default: return 'Unknown';
        }
    };

    const renderGlassCard = (children: React.ReactNode, style?: any) => (
        <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.glassCard, style]}
        >
            {children}
        </LinearGradient>
    );

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Title + Market Indicators */}
            <View style={styles.topBar}>
                <View>
                    <Text style={styles.headerTitle}>Market</Text>
                    <Text style={styles.headerSubtitle}>Stock Exchange</Text>
                </View>

                <View style={styles.indicators}>
                    {/* Cycle Phase Badge */}
                    <LinearGradient
                        colors={[`${getCyclePhaseColor()}22`, `${getCyclePhaseColor()}11`]}
                        style={styles.cycleBadge}
                    >
                        <Activity size={10} color={getCyclePhaseColor()} />
                        <Text style={[styles.cycleText, { color: getCyclePhaseColor() }]}>
                            {getCyclePhaseLabel().toUpperCase()}
                        </Text>
                    </LinearGradient>

                    {/* Fear &  Greed */}
                    <TouchableOpacity onPress={() => setFearGreedModalVisible(true)}>
                        <LinearGradient
                            colors={[`${getMoodColor()}33`, `${getMoodColor()}11`]}
                            style={styles.moodBadge}
                        >
                            <Lightning size={12} color={getMoodColor()} fill={getMoodColor()} />
                            <Text style={[styles.moodValue, { color: getMoodColor() }]}>
                                {Math.round(fearGreedIndex)}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Portfolio Glass Card */}
            <TouchableOpacity onPress={() => {
                setPortfolioModalVisible(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}>
                {renderGlassCard(
                    <View style={styles.portfolioContent}>
                        <View style={styles.portfolioHeader}>
                            <View style={styles.briefcaseIconContainer}>
                                <LinearGradient
                                    colors={['#00D9FF', '#0099FF']}
                                    style={styles.briefcaseIconBg}
                                >
                                    <Briefcase size={20} color="#FFF" />
                                </LinearGradient>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.portfolioLabel}>TOTAL PORTFOLIO</Text>
                                <Text style={styles.portfolioValue}>
                                    £{portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.pnlContainer}>
                            <View style={styles.pnlRow}>
                                {portfolioPnL >= 0 ? (
                                    <ArrowUpRight size={16} color="#00FF88" />
                                ) : (
                                    <ArrowDownRight size={16} color="#FF4444" />
                                )}
                                <Text style={[styles.pnlText, { color: portfolioPnL >= 0 ? '#00FF88' : '#FF4444' }]}>
                                    {portfolioPnL >= 0 ? '+' : ''}£{Math.abs(portfolioPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Text>
                                <Text style={[styles.pnlPercent, { color: portfolioPnL >= 0 ? '#00FF88' : '#FF4444' }]}>
                                    ({portfolioPnL >= 0 ? '+' : ''}{portfolioPnLPercent.toFixed(2)}%)
                                </Text>
                            </View>
                        </View>
                    </View>,
                    { marginBottom: SPACING.lg }
                )}
            </TouchableOpacity>

            {/* Holdings Carousel */}
            {Object.keys(holdings).length > 0 && (
                <View style={styles.holdingsSection}>
                    <Text style={styles.sectionTitle}>YOUR POSITIONS</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.holdingsList}
                    >
                        {stocks
                            .filter(s => holdings[s.symbol]?.quantity > 0)
                            .map(stock => {
                                const holding = holdings[stock.symbol];
                                const pnl = (stock.price - holding.averageCost) * holding.quantity;
                                const pnlPercent = ((stock.price - holding.averageCost) / holding.averageCost) * 100;
                                const SectorIcon = SECTOR_ICONS[stock.sector as keyof typeof SECTOR_ICONS] || Cpu;
                                const sectorColors = SECTOR_COLORS[stock.sector as keyof typeof SECTOR_COLORS] || ['#888', '#666'];

                                return (
                                    <TouchableOpacity
                                        key={stock.symbol}
                                        onPress={() => router.push(`/stock/${stock.symbol}`)}
                                    >
                                        {renderGlassCard(
                                            <View style={styles.holdingCard}>
                                                <View style={styles.holdingHeader}>
                                                    <LinearGradient
                                                        colors={sectorColors}
                                                        style={styles.sectorIconBg}
                                                    >
                                                        <SectorIcon size={14} color="#FFF" />
                                                    </LinearGradient>
                                                    <Text style={styles.holdingSymbol}>{stock.symbol}</Text>
                                                </View>
                                                <Text style={styles.holdingValue}>
                                                    £{(holding.quantity * stock.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Text>
                                                <View style={styles.holdingPnl}>
                                                    {pnl >= 0 ? (
                                                        <TrendingUp size={12} color="#00FF88" />
                                                    ) : (
                                                        <TrendingDown size={12} color="#FF4444" />
                                                    )}
                                                    <Text style={[styles.holdingPnlText, { color: pnl >= 0 ? '#00FF88' : '#FF4444' }]}>
                                                        {pnlPercent.toFixed(1)}%
                                                    </Text>
                                                </View>
                                            </View>,
                                            { marginRight: SPACING.md, width: 140 }
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </ScrollView>
                </View>
            )}

            {/* Sector Filter Pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sectorFilters}
            >
                {sectors.map(sector => {
                    const isActive = sector === sectorFilter;
                    const SectorIcon = sector === 'All' ? Activity : SECTOR_ICONS[sector as keyof typeof SECTOR_ICONS];
                    const sectorColors = sector === 'All' ? ['#666', '#444'] : SECTOR_COLORS[sector as keyof typeof SECTOR_COLORS];

                    return (
                        <TouchableOpacity
                            key={sector}
                            onPress={() => handleSectorFilter(sector)}
                        >
                            <LinearGradient
                                colors={isActive ? sectorColors : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                                style={[
                                    styles.sectorPill,
                                    isActive && { borderColor: sectorColors[0] }
                                ]}
                            >
                                {SectorIcon && <SectorIcon size={14} color={isActive ? '#FFF' : 'rgba(255,255,255,0.5)'} />}
                                <Text style={[styles.sectorPillText, { color: isActive ? '#FFF' : 'rgba(255,255,255,0.5)' }]}>
                                    {sector}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Search Bar */}
            {renderGlassCard(
                <View style={styles.searchContent}>
                    <Search size={18} color="rgba(255,255,255,0.5)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search stocks..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>,
                { marginBottom: SPACING.lg }
            )}

            <Text style={styles.sectionTitle}>
                {sectorFilter === 'All' ? 'ALL STOCKS' : `${sectorFilter.toUpperCase()} SECTOR`}
            </Text>
        </View>
    );

    const FlashListAny = FlashList as any;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Animated Background */}
            <LinearGradient
                colors={['#0F0A1A', '#1A0F2E', '#0F0A1A']}
                style={StyleSheet.absoluteFill}
            />

            <FlashListAny
                data={filteredStocks}
                keyExtractor={(item: any) => item.symbol}
                renderItem={({ item }: { item: any }) => <StockCard stock={item} />}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                estimatedItemSize={140}
            />

            <PortfolioDetailModal
                visible={portfolioModalVisible}
                onClose={() => setPortfolioModalVisible(false)}
                type="stocks"
            />

            <FearGreedModal
                visible={fearGreedModalVisible}
                onClose={() => setFearGreedModalVisible(false)}
                fearGreedIndex={fearGreedIndex}
                getMoodColor={getMoodColor}
                getMoodLabel={getMoodLabel}
                marketCyclePhase={marketCyclePhase}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    headerContainer: {
        marginBottom: SPACING.md,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.xl,
    },
    headerTitle: {
        fontSize: 36,
        fontFamily: FONTS.bold,
        color: '#FFF',
        letterSpacing: -1,
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    indicators: {
        gap: SPACING.sm,
        alignItems: 'flex-end',
    },
    cycleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cycleText: {
        fontSize: 9,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    moodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    moodLabel: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        color: 'rgba(255,255,255,0.6)',
    },
    moodValue: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    glassCard: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: SPACING.lg,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    portfolioContent: {
        gap: SPACING.md,
    },
    portfolioHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    briefcaseIconContainer: {
        width: 48,
        height: 48,
    },
    briefcaseIconBg: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    portfolioLabel: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
    },
    portfolioValue: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        color: '#FFF',
        letterSpacing: -1,
    },
    pnlContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: SPACING.md,
    },
    pnlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pnlText: {
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    pnlPercent: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        opacity: 0.8,
    },
    holdingsSection: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: SPACING.md,
    },
    holdingsList: {
        paddingRight: SPACING.md,
    },
    holdingCard: {
        gap: 8,
    },
    holdingHeader: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    sectorIconBg: {
        width: 24,
        height: 24,
        borderRadius: RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    holdingSymbol: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    holdingValue: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    holdingPnl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    holdingPnlText: {
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    sectorFilters: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
        paddingRight: SPACING.md,
    },
    sectorPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    sectorPillText: {
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    searchContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: '#FFF',
        paddingVertical: 0,
    },
});
