import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { StockCard } from '../../components/StockCard';
import { SearchBar } from '../../components/SearchBar';
import { Header } from '../../components/Header';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useMarketEngine } from '../../hooks/useMarketEngine';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type SortOption = 'price_high' | 'price_low' | 'change_high' | 'change_low' | 'name_asc' | 'volatility';
type SectorFilter = 'All' | 'Tech' | 'Finance' | 'Healthcare' | 'Consumer' | 'Crypto' | 'Energy' | 'Meme' | 'Luxury' | 'Index';

export default function MarketScreen() {
    useMarketEngine();
    const { stocks, watchlist } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'watchlist'>('all');
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('name_asc');
    const [sectorFilter, setSectorFilter] = useState<SectorFilter>('All');

    const sectors: SectorFilter[] = ['All', 'Tech', 'Finance', 'Healthcare', 'Consumer', 'Crypto', 'Energy', 'Meme', 'Luxury', 'Index'];

    const filteredStocks = useMemo(() => {
        let result = stocks;

        // Filter by Tab
        if (activeTab === 'watchlist') {
            result = result.filter(s => watchlist.includes(s.symbol));
        }

        // Filter by Sector
        if (sectorFilter !== 'All') {
            result = result.filter(s => s.sector === sectorFilter);
        }

        // Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.symbol.toLowerCase().includes(query) ||
                s.name.toLowerCase().includes(query)
            );
        }

        // Sort
        return result.sort((a, b) => {
            switch (sortBy) {
                case 'price_high':
                    return b.price - a.price;
                case 'price_low':
                    return a.price - b.price;
                case 'change_high': {
                    const changeA = a.history.length >= 2 ? (a.price - a.history[a.history.length - 2].value) / a.history[a.history.length - 2].value : 0;
                    const changeB = b.history.length >= 2 ? (b.price - b.history[b.history.length - 2].value) / b.history[b.history.length - 2].value : 0;
                    return changeB - changeA;
                }
                case 'change_low': {
                    const changeA = a.history.length >= 2 ? (a.price - a.history[a.history.length - 2].value) / a.history[a.history.length - 2].value : 0;
                    const changeB = b.history.length >= 2 ? (b.price - b.history[b.history.length - 2].value) / b.history[b.history.length - 2].value : 0;
                    return changeA - changeB;
                }
                case 'name_asc':
                    return a.symbol.localeCompare(b.symbol);
                case 'volatility':
                    return b.volatility - a.volatility;
                default:
                    return 0;
            }
        });
    }, [stocks, watchlist, searchQuery, activeTab, sortBy, sectorFilter]);

    const handleSort = (option: SortOption) => {
        setSortBy(option);
        setSortModalVisible(false);
        Haptics.selectionAsync();
    };

    const handleSectorFilter = (sector: SectorFilter) => {
        setSectorFilter(sector);
        Haptics.selectionAsync();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Market"
                rightComponent={
                    <TouchableOpacity onPress={() => setSortModalVisible(true)}>
                        <SlidersHorizontal size={24} color={COLORS.text} />
                    </TouchableOpacity>
                }
            />

            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search stocks..."
                />
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => {
                        setActiveTab('all');
                        Haptics.selectionAsync();
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All Stocks</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'watchlist' && styles.activeTab]}
                    onPress={() => {
                        setActiveTab('watchlist');
                        Haptics.selectionAsync();
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 'watchlist' && styles.activeTabText]}>Watchlist</Text>
                </TouchableOpacity>
            </View>

            {/* Sector Filter Carousel */}
            <View style={styles.sectorFilterContainer}>
                <Text style={styles.filterLabel}>Sectors</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sectorScroll}
                >
                    {sectors.map((sector) => (
                        <TouchableOpacity
                            key={sector}
                            style={[
                                styles.sectorPill,
                                sectorFilter === sector && styles.activeSectorPill
                            ]}
                            onPress={() => handleSectorFilter(sector)}
                        >
                            <Text style={[
                                styles.sectorText,
                                sectorFilter === sector && styles.activeSectorText
                            ]}>
                                {sector}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Results Label */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsLabel}>
                    {filteredStocks.length} {filteredStocks.length === 1 ? 'stock' : 'stocks'}
                </Text>
            </View>

            <FlatList
                data={filteredStocks}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <StockCard stock={item} />}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                // Performance optimizations
                getItemLayout={(data, index) => ({
                    length: 84, // Approximate height of StockCard (padding + content)
                    offset: 84 * index,
                    index,
                })}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                windowSize={10}
                initialNumToRender={10}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No stocks found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                    </View>
                }
            />

            <Modal
                visible={sortModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSortModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSortModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sort By</Text>

                        <TouchableOpacity style={styles.sortOption} onPress={() => handleSort('name_asc')}>
                            <Text style={[styles.sortText, sortBy === 'name_asc' && styles.activeSortText]}>Name (A-Z)</Text>
                            {sortBy === 'name_asc' && <ArrowUpDown size={16} color={COLORS.accent} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sortOption} onPress={() => handleSort('price_high')}>
                            <Text style={[styles.sortText, sortBy === 'price_high' && styles.activeSortText]}>Price (High to Low)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sortOption} onPress={() => handleSort('price_low')}>
                            <Text style={[styles.sortText, sortBy === 'price_low' && styles.activeSortText]}>Price (Low to High)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sortOption} onPress={() => handleSort('change_high')}>
                            <Text style={[styles.sortText, sortBy === 'change_high' && styles.activeSortText]}>Top Gainers</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sortOption} onPress={() => handleSort('change_low')}>
                            <Text style={[styles.sortText, sortBy === 'change_low' && styles.activeSortText]}>Top Losers</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sortOption} onPress={() => handleSort('volatility')}>
                            <Text style={[styles.sortText, sortBy === 'volatility' && styles.activeSortText]}>Most Volatile</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    searchContainer: {
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.md,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
        gap: SPACING.md,
    },
    tab: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.bgElevated,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    activeTab: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    tabText: {
        color: COLORS.textSub,
        fontSize: FONTS.sizes.sm,
        fontFamily: FONTS.semibold,
    },
    activeTabText: {
        color: '#000',
        fontFamily: FONTS.bold,
    },
    sectorFilterContainer: {
        marginBottom: SPACING.md,
    },
    filterLabel: {
        color: COLORS.textSub,
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.medium,
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.sm,
    },
    sectorScroll: {
        paddingHorizontal: SPACING.xl,
        gap: SPACING.sm,
    },
    sectorPill: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.bgSubtle,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: SPACING.sm,
    },
    activeSectorPill: {
        backgroundColor: COLORS.accentSubtle,
        borderColor: COLORS.accent,
    },
    sectorText: {
        color: COLORS.textSub,
        fontSize: FONTS.sizes.sm,
        fontFamily: FONTS.medium,
    },
    activeSectorText: {
        color: COLORS.accent,
        fontFamily: FONTS.bold,
    },
    resultsHeader: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    resultsLabel: {
        color: COLORS.textMuted,
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.medium,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    list: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xl,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: SPACING.xxl,
        padding: SPACING.xl,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: FONTS.sizes.md,
        fontFamily: FONTS.semibold,
        marginBottom: SPACING.xs,
    },
    emptySubtext: {
        color: COLORS.textSub,
        fontSize: FONTS.sizes.sm,
        fontFamily: FONTS.regular,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: COLORS.bgElevated,
        borderRadius: RADIUS.lg,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: FONTS.sizes.lg,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    sortText: {
        color: COLORS.textSub,
        fontSize: FONTS.sizes.md,
        fontFamily: FONTS.medium,
    },
    activeSortText: {
        color: COLORS.accent,
        fontFamily: FONTS.bold,
    }
});
