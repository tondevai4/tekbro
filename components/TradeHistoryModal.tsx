import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, TrendingUp, TrendingDown, Filter, Calendar, DollarSign, Activity } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { Trade } from '../types';
import { useStore } from '../store/useStore';
import { useCryptoStore } from '../store/useCryptoStore';

interface Props {
    visible: boolean;
    onClose: () => void;
    initialTradeId?: string; // If provided, opens details for this trade immediately
}

type FilterType = 'ALL' | 'STOCK' | 'CRYPTO' | 'PROFIT' | 'LOSS';

export function TradeHistoryModal({ visible, onClose, initialTradeId }: Props) {
    const { trades: stockTrades } = useStore();
    const { cryptoTrades } = useCryptoStore();
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

    // Combine and sort trades
    const allTrades = useMemo(() => {
        const stocks = stockTrades.map(t => ({ ...t, assetType: 'STOCK' }));
        const cryptos = cryptoTrades.map(t => ({ ...t, assetType: 'CRYPTO' }));
        return [...stocks, ...cryptos].sort((a, b) => b.timestamp - a.timestamp);
    }, [stockTrades, cryptoTrades]);

    // Handle initial trade selection
    React.useEffect(() => {
        if (initialTradeId && visible) {
            const trade = allTrades.find(t => t.id === initialTradeId);
            if (trade) setSelectedTrade(trade);
        }
    }, [initialTradeId, visible, allTrades]);

    const filteredTrades = useMemo(() => {
        return allTrades.filter(t => {
            if (filter === 'ALL') return true;
            if (filter === 'STOCK') return t.assetType === 'STOCK';
            if (filter === 'CRYPTO') return t.assetType === 'CRYPTO';
            if (filter === 'PROFIT') return (t.pnl || 0) > 0;
            if (filter === 'LOSS') return (t.pnl || 0) < 0;
            return true;
        });
    }, [allTrades, filter]);

    const renderTradeItem = ({ item }: { item: any }) => {
        const isProfit = (item.pnl || 0) >= 0;
        const isSell = item.type === 'SELL';

        return (
            <TouchableOpacity
                style={styles.tradeItem}
                onPress={() => setSelectedTrade(item)}
            >
                <View style={styles.tradeLeft}>
                    <View style={[styles.iconBox, {
                        backgroundColor: isProfit ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 68, 68, 0.1)'
                    }]}>
                        {isProfit ?
                            <TrendingUp size={20} color={COLORS.success} /> :
                            <TrendingDown size={20} color={COLORS.negative} />
                        }
                    </View>
                    <View>
                        <Text style={styles.symbol}>{item.symbol}</Text>
                        <Text style={styles.type}>{item.assetType} • {item.type}</Text>
                    </View>
                </View>
                <View style={styles.tradeRight}>
                    <Text style={[styles.amount, { color: isProfit ? COLORS.success : COLORS.negative }]}>
                        {isProfit ? '+' : ''}£{Math.abs(item.pnl || 0).toFixed(2)}
                    </Text>
                    <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderDetailModal = () => {
        if (!selectedTrade) return null;
        const isProfit = (selectedTrade.pnl || 0) >= 0;
        const color = isProfit ? COLORS.success : COLORS.negative;

        return (
            <Modal
                transparent
                visible={!!selectedTrade}
                animationType="fade"
                onRequestClose={() => setSelectedTrade(null)}
            >
                <BlurView intensity={20} style={styles.detailOverlay}>
                    <View style={styles.detailCard}>
                        <View style={[styles.detailHeader, { borderBottomColor: color }]}>
                            <Text style={styles.detailTitle}>Trade Details</Text>
                            <TouchableOpacity onPress={() => setSelectedTrade(null)}>
                                <X size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.detailContent}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Asset</Text>
                                <Text style={styles.detailValue}>{selectedTrade.symbol}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Type</Text>
                                <Text style={[styles.detailValue, { color: selectedTrade.type === 'BUY' ? COLORS.success : COLORS.negative }]}>
                                    {selectedTrade.type}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Price</Text>
                                <Text style={styles.detailValue}>£{selectedTrade.price.toFixed(2)}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Quantity</Text>
                                <Text style={styles.detailValue}>{selectedTrade.quantity}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Total Value</Text>
                                <Text style={styles.detailValue}>£{(selectedTrade.price * selectedTrade.quantity).toFixed(2)}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Date</Text>
                                <Text style={styles.detailValue}>{new Date(selectedTrade.timestamp).toLocaleString()}</Text>
                            </View>

                            {selectedTrade.pnl !== undefined && (
                                <View style={[styles.pnlBox, { backgroundColor: color + '20', borderColor: color }]}>
                                    <Text style={[styles.pnlLabel, { color }]}>P&L</Text>
                                    <Text style={[styles.pnlAmount, { color }]}>
                                        {selectedTrade.pnl >= 0 ? '+' : ''}£{selectedTrade.pnl.toFixed(2)}
                                    </Text>
                                    <Text style={[styles.pnlPercent, { color }]}>
                                        {((selectedTrade.pnl / (selectedTrade.price * selectedTrade.quantity)) * 100).toFixed(2)}%
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </BlurView>
            </Modal>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Trade History</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.filters}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {(['ALL', 'STOCK', 'CRYPTO', 'PROFIT', 'LOSS'] as FilterType[]).map((f) => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterChip, filter === f && styles.filterChipActive]}
                                onPress={() => setFilter(f)}
                            >
                                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <FlatList
                    data={filteredTrades}
                    renderItem={renderTradeItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Activity size={48} color={COLORS.textTertiary} />
                            <Text style={styles.emptyText}>No trades found</Text>
                        </View>
                    }
                />

                {renderDetailModal()}
            </View>
        </Modal>
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
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    closeButton: {
        padding: 4,
    },
    filters: {
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    filterChip: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.card,
        marginHorizontal: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
    },
    filterTextActive: {
        color: '#FFF',
    },
    list: {
        padding: SPACING.lg,
    },
    tradeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.md,
    },
    tradeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    symbol: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    type: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
    },
    tradeRight: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    date: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
    },
    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        gap: SPACING.md,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
    },
    detailOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: SPACING.xl,
    },
    detailCard: {
        width: '100%',
        backgroundColor: COLORS.bgElevated,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 2,
    },
    detailTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    detailContent: {
        padding: SPACING.lg,
        gap: SPACING.md,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    pnlBox: {
        marginTop: SPACING.md,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        borderWidth: 1,
    },
    pnlLabel: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    pnlAmount: {
        fontSize: 24,
        fontFamily: FONTS.bold,
    },
    pnlPercent: {
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
});
