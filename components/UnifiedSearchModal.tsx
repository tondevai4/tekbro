import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Search, TrendingUp, Zap, ChevronRight, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { useCryptoStore } from '../store/useCryptoStore';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../hooks/useTheme';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

interface UnifiedSearchModalProps {
    visible: boolean;
    onClose: () => void;
}

type SearchResult = {
    type: 'STOCK' | 'CRYPTO';
    symbol: string;
    name: string;
    price: number;
    change: number;
    sector?: string;
};

// Memoized SearchBar
const SearchBar = React.memo(({ query, onQueryChange, onClear, onClose, theme }: {
    query: string;
    onQueryChange: (text: string) => void;
    onClear: () => void;
    onClose: () => void;
    theme: any;
}) => {
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        // Focus on mount with a slight delay for animation
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={[styles.searchBar, { backgroundColor: theme.bgElevated }]}>
                <Search size={20} color={theme.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                    ref={inputRef}
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Search stocks & crypto..."
                    placeholderTextColor={theme.textMuted}
                    value={query}
                    onChangeText={onQueryChange}
                    autoCapitalize="none"
                    returnKeyType="search"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <View style={[styles.clearButton, { backgroundColor: theme.bgSubtle }]}>
                            <X size={12} color={theme.text} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={[styles.cancelText, { color: theme.primary }]}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
});

export const UnifiedSearchModal: React.FC<UnifiedSearchModalProps> = ({ visible, onClose }) => {
    const router = useRouter();
    const { theme } = useTheme();
    const [query, setQuery] = useState('');

    const stocks = useStore((state) => state.stocks);
    const cryptos = useCryptoStore((state) => state.cryptos);

    // Reset query when modal opens/closes
    useEffect(() => {
        if (!visible) {
            setQuery('');
        }
    }, [visible]);

    // Calculate Trending (Top 5 Gainers across both markets)
    const trendingItems = useMemo(() => {
        const allStocks = stocks.map(s => ({
            type: 'STOCK' as const,
            symbol: s.symbol,
            name: s.name,
            price: s.price,
            change: s.change || 0,
            sector: s.sector
        }));

        const allCryptos = cryptos.map(c => ({
            type: 'CRYPTO' as const,
            symbol: c.symbol,
            name: c.name,
            price: c.price,
            change: c.change24h || 0
        }));

        return [...allStocks, ...allCryptos]
            .sort((a, b) => b.change - a.change)
            .slice(0, 5);
    }, [stocks, cryptos]); // Re-calc when data updates

    // Filtered Results
    const results = useMemo(() => {
        if (!query.trim()) return [];

        const searchQuery = query.toLowerCase();
        const seenSymbols = new Set<string>();

        const stockResults = stocks
            .filter(s => s.symbol.toLowerCase().includes(searchQuery) || s.name.toLowerCase().includes(searchQuery))
            .map(s => ({
                type: 'STOCK' as const,
                symbol: s.symbol,
                name: s.name,
                price: s.price,
                change: s.change || 0,
                sector: s.sector
            }));

        const cryptoResults = cryptos
            .filter(c => c.symbol.toLowerCase().includes(searchQuery) || c.name.toLowerCase().includes(searchQuery))
            .map(c => ({
                type: 'CRYPTO' as const,
                symbol: c.symbol,
                name: c.name,
                price: c.price,
                change: c.change24h || 0
            }));

        // Combine and Deduplicate
        const combined: SearchResult[] = [];

        [...stockResults, ...cryptoResults].forEach(item => {
            if (!seenSymbols.has(item.symbol)) {
                seenSymbols.add(item.symbol);
                combined.push(item);
            }
        });

        // Sort by relevance
        return combined.sort((a, b) => {
            const aExact = a.symbol.toLowerCase() === searchQuery;
            const bExact = b.symbol.toLowerCase() === searchQuery;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return a.symbol.length - b.symbol.length;
        }).slice(0, 20);

    }, [query, stocks, cryptos]);

    const handleSelect = useCallback((item: SearchResult) => {
        Haptics.selectionAsync();
        // Dismiss keyboard first to avoid stutter
        Keyboard.dismiss();
        onClose();

        // Small delay to allow modal to close smoothly
        setTimeout(() => {
            if (item.type === 'STOCK') {
                router.push({ pathname: '/stock/[id]', params: { id: item.symbol } });
            } else {
                router.push({ pathname: '/crypto/[id]', params: { id: item.symbol } });
            }
        }, 50);
    }, [onClose, router]);

    const renderItem = useCallback(({ item }: { item: SearchResult }) => (
        <TouchableOpacity
            style={[styles.resultItem, { borderBottomColor: theme.border }]}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.bgElevated }]}>
                {item.type === 'STOCK' ? (
                    <TrendingUp size={20} color={theme.positive} />
                ) : (
                    <Zap size={20} color={theme.primary} />
                )}
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.symbol, { color: theme.text }]}>{item.symbol}</Text>
                <Text style={[styles.name, { color: theme.textSub }]} numberOfLines={1}>{item.name}</Text>
            </View>
            <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: theme.text }]}>{formatCurrency(item.price)}</Text>
                <View style={[
                    styles.changeBadge,
                    { backgroundColor: item.change >= 0 ? theme.positive + '20' : theme.negative + '20' }
                ]}>
                    <Text style={[styles.change, { color: item.change >= 0 ? theme.positive : theme.negative }]}>
                        {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </Text>
                </View>
            </View>
            <ChevronRight size={16} color={theme.textMuted} style={{ marginLeft: 10 }} />
        </TouchableOpacity>
    ), [handleSelect, theme]);

    const renderTrendingItem = useCallback(({ item, index }: { item: SearchResult, index: number }) => (
        <TouchableOpacity
            style={[styles.trendingItem, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
            onPress={() => handleSelect(item)}
            activeOpacity={0.8}
        >
            <View style={styles.trendingHeader}>
                <View style={styles.trendingRank}>
                    <Text style={[styles.rankText, { color: theme.primary }]}>#{index + 1}</Text>
                </View>
                {item.type === 'STOCK' ? <TrendingUp size={14} color={theme.textMuted} /> : <Zap size={14} color={theme.textMuted} />}
            </View>
            <Text style={[styles.trendingSymbol, { color: theme.text }]}>{item.symbol}</Text>
            <Text style={[styles.trendingChange, { color: theme.positive }]}>+{item.change.toFixed(2)}%</Text>
        </TouchableOpacity>
    ), [handleSelect, theme]);

    const FlashListAny = FlashList as any;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={95} tint="dark" style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <SearchBar
                        query={query}
                        onQueryChange={setQuery}
                        onClear={() => setQuery('')}
                        onClose={onClose}
                        theme={theme}
                    />

                    {/* Results or Trending */}
                    <View style={styles.contentContainer}>
                        {query.length === 0 ? (
                            <View style={styles.trendingSection}>
                                <View style={styles.sectionHeader}>
                                    <Flame size={16} color={theme.warning} />
                                    <Text style={[styles.sectionTitle, { color: theme.textSub }]}>TRENDING NOW</Text>
                                </View>
                                <View style={styles.trendingGrid}>
                                    {trendingItems.map((item, index) => (
                                        <View key={item.symbol} style={{ width: '48%', marginBottom: 12 }}>
                                            {renderTrendingItem({ item, index })}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <FlashListAny
                                data={results}
                                renderItem={renderItem}
                                estimatedItemSize={70}
                                keyExtractor={(item: any) => `${item.type}-${item.symbol}`}
                                contentContainerStyle={styles.listContent}
                                keyboardShouldPersistTaps="handled"
                                ListEmptyComponent={
                                    <View style={styles.emptyState}>
                                        <Text style={[styles.emptyText, { color: theme.textSub }]}>No results found for "{query}"</Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </KeyboardAvoidingView>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.md,
        height: 44,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
        fontFamily: FONTS.medium,
    },
    clearButton: {
        borderRadius: RADIUS.full,
        padding: 4,
    },
    cancelButton: {
        marginLeft: SPACING.md,
    },
    cancelText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    contentContainer: {
        flex: 1,
    },
    listContent: {
        padding: SPACING.md,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    textContainer: {
        flex: 1,
    },
    symbol: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    name: {
        fontSize: 12,
        marginTop: 2,
        fontFamily: FONTS.medium,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 15,
        fontFamily: FONTS.bold,
    },
    changeBadge: {
        marginTop: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    change: {
        fontSize: 11,
        fontFamily: FONTS.bold,
    },
    trendingSection: {
        padding: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        letterSpacing: 1,
    },
    trendingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    trendingItem: {
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
    },
    trendingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    trendingRank: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    rankText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
    },
    trendingSymbol: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginBottom: 2,
    },
    trendingChange: {
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
});
