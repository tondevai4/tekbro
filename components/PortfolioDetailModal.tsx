import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    X, TrendingUp, TrendingDown, PieChart, BarChart3, Target,
    Cpu, Building2, Heart, ShoppingBag, Zap as Lightning, Home,
    Wallet, Briefcase, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { useCryptoStore } from '../store/useCryptoStore';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

interface PortfolioDetailModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'stocks' | 'crypto';
}

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

export function PortfolioDetailModal({ visible, onClose, type }: PortfolioDetailModalProps) {
    const { stocks, holdings, cash } = useStore();
    const { cryptos, cryptoHoldings, cryptoWallet } = useCryptoStore();

    // Calculate metrics based on type
    const analytics = useMemo(() => {
        if (type === 'stocks') {
            // Stock portfolio analytics
            const holdingsArray = Object.entries(holdings).map(([symbol, holding]) => {
                const stock = stocks.find(s => s.symbol === symbol);
                if (!stock) return null;

                const value = holding.quantity * stock.price;
                const costBasis = holding.quantity * holding.averageCost;
                const pnl = value - costBasis;
                const pnlPercent = (pnl / costBasis) * 100;

                return {
                    symbol,
                    name: stock.name,
                    sector: stock.sector,
                    value,
                    pnl,
                    pnlPercent,
                    quantity: holding.quantity,
                    price: stock.price,
                };
            }).filter(Boolean) as any[];

            const totalValue = holdingsArray.reduce((sum, h) => sum + h.value, 0) + cash;
            const totalPnL = holdingsArray.reduce((sum, h) => sum + h.pnl, 0);
            const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

            // Sector breakdown
            const sectorBreakdown = holdingsArray.reduce((acc, h) => {
                if (!acc[h.sector]) acc[h.sector] = { value: 0, pnl: 0 };
                acc[h.sector].value += h.value;
                acc[h.sector].pnl += h.pnl;
                return acc;
            }, {} as Record<string, { value: number; pnl: number }>);

            const sectors = Object.entries(sectorBreakdown)
                .map(([sector, data]) => ({
                    sector,
                    value: data.value,
                    percentage: (data.value / totalValue) * 100,
                    pnl: data.pnl,
                    pnlPercent: data.value > 0 ? (data.pnl / (data.value - data.pnl)) * 100 : 0,
                }))
                .sort((a, b) => b.value - a.value);

            // Top gainers/losers
            const sortedByPnL = [...holdingsArray].sort((a, b) => b.pnlPercent - a.pnlPercent);
            const topGainers = sortedByPnL.filter(h => h.pnl > 0).slice(0, 3);
            const topLosers = sortedByPnL.filter(h => h.pnl < 0).slice(-3).reverse();

            // Diversification score (0-100, higher = more diversified)
            const diversificationScore = Math.min(
                100,
                (sectors.length / 6) * 50 + // Sector diversity (max 6 sectors)
                (holdingsArray.length / 10) * 50 // Position count (max 10)
            );

            return {
                totalValue,
                totalPnL,
                totalPnLPercent,
                cashPercent: (cash / totalValue) * 100,
                sectors,
                topGainers,
                topLosers,
                diversificationScore,
                positionCount: holdingsArray.length,
            };
        } else {
            // Crypto portfolio analytics
            const holdingsArray = Object.entries(cryptoHoldings).map(([symbol, holding]) => {
                const crypto = cryptos.find(c => c.symbol === symbol);
                if (!crypto) return null;

                const value = holding.quantity * crypto.price;
                const costBasis = holding.quantity * holding.averageCost;
                const pnl = (value - costBasis) * holding.leverage;
                const pnlPercent = ((crypto.price - holding.averageCost) / holding.averageCost) * 100 * holding.leverage;

                return {
                    symbol,
                    name: crypto.name,
                    value,
                    pnl,
                    pnlPercent,
                    quantity: holding.quantity,
                    price: crypto.price,
                    leverage: holding.leverage,
                };
            }).filter(Boolean) as any[];

            const totalValue = holdingsArray.reduce((sum, h) => sum + h.value, 0) + cryptoWallet;
            const totalPnL = holdingsArray.reduce((sum, h) => sum + h.pnl, 0);
            const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

            // Top gainers/losers
            const sortedByPnL = [...holdingsArray].sort((a, b) => b.pnlPercent - a.pnlPercent);
            const topGainers = sortedByPnL.filter(h => h.pnl > 0).slice(0, 3);
            const topLosers = sortedByPnL.filter(h => h.pnl < 0).slice(-3).reverse();

            // Leverage exposure
            const averageLeverage = holdingsArray.reduce((sum, h) => sum + h.leverage, 0) / holdingsArray.length || 1;
            const leveragedPositions = holdingsArray.filter(h => h.leverage > 1).length;

            return {
                totalValue,
                totalPnL,
                totalPnLPercent,
                cashPercent: (cryptoWallet / totalValue) * 100,
                topGainers,
                topLosers,
                diversificationScore: Math.min(100, (holdingsArray.length / 8) * 100),
                positionCount: holdingsArray.length,
                averageLeverage,
                leveragedPositions,
            };
        }
    }, [type, stocks, holdings, cash, cryptos, cryptoHoldings, cryptoWallet]);

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

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={styles.modalContent}>
                    <LinearGradient
                        colors={['#0A0A0F', '#1A0A2E']}
                        style={styles.modalGradient}
                    >
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.headerLeft}>
                                {type === 'stocks' ? (
                                    <Briefcase size={24} color="#00D9FF" />
                                ) : (
                                    <Wallet size={24} color="#8E2DE2" />
                                )}
                                <View>
                                    <Text style={styles.modalTitle}>
                                        {type === 'stocks' ? 'Stock Portfolio' : 'Crypto Wallet'}
                                    </Text>
                                    <Text style={styles.modalSubtitle}>Analytics & Insights</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.scrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Total Value Card */}
                            {renderGlassCard(
                                <View style={styles.valueCard}>
                                    <Text style={styles.valueLabel}>TOTAL VALUE</Text>
                                    <Text style={styles.valueAmount}>
                                        £{analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Text>
                                    <View style={styles.pnlRow}>
                                        {analytics.totalPnL >= 0 ? (
                                            <ArrowUpRight size={20} color="#00FF88" />
                                        ) : (
                                            <ArrowDownRight size={20} color="#FF4444" />
                                        )}
                                        <Text style={[styles.pnlText, { color: analytics.totalPnL >= 0 ? '#00FF88' : '#FF4444' }]}>
                                            {analytics.totalPnL >= 0 ? '+' : ''}£{Math.abs(analytics.totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Text>
                                        <Text style={[styles.pnlPercent, { color: analytics.totalPnL >= 0 ? '#00FF88' : '#FF4444' }]}>
                                            ({analytics.totalPnL >= 0 ? '+' : ''}{analytics.totalPnLPercent.toFixed(2)}%)
                                        </Text>
                                    </View>
                                </View>,
                                { marginBottom: SPACING.md }
                            )}

                            {/* Quick Stats Grid */}
                            <View style={styles.statsGrid}>
                                {renderGlassCard(
                                    <View style={styles.statCard}>
                                        <PieChart size={20} color="#00D9FF" />
                                        <Text style={styles.statValue}>{analytics.positionCount}</Text>
                                        <Text style={styles.statLabel}>Positions</Text>
                                    </View>
                                )}
                                {renderGlassCard(
                                    <View style={styles.statCard}>
                                        <Target size={20} color="#00FF88" />
                                        <Text style={styles.statValue}>{Math.round(analytics.diversificationScore)}%</Text>
                                        <Text style={styles.statLabel}>Diversified</Text>
                                    </View>
                                )}
                                {renderGlassCard(
                                    <View style={styles.statCard}>
                                        <Wallet size={20} color="#FFD700" />
                                        <Text style={styles.statValue}>{analytics.cashPercent.toFixed(0)}%</Text>
                                        <Text style={styles.statLabel}>Cash</Text>
                                    </View>
                                )}
                                {type === 'crypto' && (
                                    renderGlassCard(
                                        <View style={styles.statCard}>
                                            <Activity size={20} color="#FF6B9D" />
                                            <Text style={styles.statValue}>{analytics.averageLeverage.toFixed(1)}x</Text>
                                            <Text style={styles.statLabel}>Avg Leverage</Text>
                                        </View>
                                    )
                                )}
                            </View>

                            {/* Sector Breakdown (Stocks only) */}
                            {type === 'stocks' && analytics.sectors && analytics.sectors.length > 0 && (
                                <>
                                    <Text style={styles.sectionTitle}>SECTOR ALLOCATION</Text>
                                    {renderGlassCard(
                                        <View style={styles.sectorList}>
                                            {analytics.sectors.map((sector: any) => {
                                                const SectorIcon = SECTOR_ICONS[sector.sector as keyof typeof SECTOR_ICONS] || Cpu;
                                                const sectorColors = SECTOR_COLORS[sector.sector as keyof typeof SECTOR_COLORS] || ['#888', '#666'];

                                                return (
                                                    <View key={sector.sector} style={styles.sectorItem}>
                                                        <View style={styles.sectorLeft}>
                                                            <LinearGradient
                                                                colors={sectorColors}
                                                                style={styles.sectorIcon}
                                                            >
                                                                <SectorIcon size={16} color="#FFF" />
                                                            </LinearGradient>
                                                            <View>
                                                                <Text style={styles.sectorName}>{sector.sector}</Text>
                                                                <Text style={styles.sectorPercent}>{sector.percentage.toFixed(1)}%</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.sectorRight}>
                                                            <Text style={styles.sectorValue}>
                                                                £{sector.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </Text>
                                                            <Text style={[
                                                                styles.sectorPnL,
                                                                { color: sector.pnl >= 0 ? '#00FF88' : '#FF4444' }
                                                            ]}>
                                                                {sector.pnl >= 0 ? '+' : ''}{sector.pnlPercent.toFixed(1)}%
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>,
                                        { marginBottom: SPACING.md }
                                    )}
                                </>
                            )}

                            {/* Top Gainers */}
                            {analytics.topGainers.length > 0 && (
                                <>
                                    <Text style={styles.sectionTitle}>TOP GAINERS</Text>
                                    {renderGlassCard(
                                        <View style={styles.moversList}>
                                            {analytics.topGainers.map((item: any, index: number) => (
                                                <View key={item.symbol} style={styles.moverItem}>
                                                    <View style={styles.moverLeft}>
                                                        <Text style={styles.moverRank}>#{index + 1}</Text>
                                                        <View>
                                                            <Text style={styles.moverSymbol}>{item.symbol}</Text>
                                                            <Text style={styles.moverName}>{item.name}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.moverRight}>
                                                        <Text style={[styles.moverPnL, { color: '#00FF88' }]}>
                                                            +{item.pnlPercent.toFixed(1)}%
                                                        </Text>
                                                        <Text style={styles.moverValue}>
                                                            £{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>,
                                        { marginBottom: SPACING.md }
                                    )}
                                </>
                            )}

                            {/* Top Losers */}
                            {analytics.topLosers.length > 0 && (
                                <>
                                    <Text style={styles.sectionTitle}>TOP LOSERS</Text>
                                    {renderGlassCard(
                                        <View style={styles.moversList}>
                                            {analytics.topLosers.map((item: any, index: number) => (
                                                <View key={item.symbol} style={styles.moverItem}>
                                                    <View style={styles.moverLeft}>
                                                        <Text style={styles.moverRank}>#{index + 1}</Text>
                                                        <View>
                                                            <Text style={styles.moverSymbol}>{item.symbol}</Text>
                                                            <Text style={styles.moverName}>{item.name}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.moverRight}>
                                                        <Text style={[styles.moverPnL, { color: '#FF4444' }]}>
                                                            {item.pnlPercent.toFixed(1)}%
                                                        </Text>
                                                        <Text style={styles.moverValue}>
                                                            £{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>,
                                        { marginBottom: SPACING.xl }
                                    )}
                                </>
                            )}
                        </ScrollView>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
        height: '85%',
        borderTopLeftRadius: RADIUS.xl * 2,
        borderTopRightRadius: RADIUS.xl * 2,
        overflow: 'hidden',
    },
    modalGradient: {
        flex: 1,
        padding: SPACING.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    modalSubtitle: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.5)',
    },
    closeButton: {
        padding: SPACING.sm,
    },
    scrollView: {
        flex: 1,
    },
    glassCard: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: SPACING.lg,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    valueCard: {
        alignItems: 'center',
        gap: SPACING.sm,
    },
    valueLabel: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
    },
    valueAmount: {
        fontSize: 36,
        fontFamily: FONTS.bold,
        color: '#FFF',
        letterSpacing: -1,
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    statValue: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    statLabel: {
        fontSize: 11,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.5)',
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1.5,
        marginBottom: SPACING.md,
    },
    sectorList: {
        gap: SPACING.md,
    },
    sectorItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    sectorIcon: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectorName: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    sectorPercent: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.5)',
    },
    sectorRight: {
        alignItems: 'flex-end',
    },
    sectorValue: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    sectorPnL: {
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    moversList: {
        gap: SPACING.md,
    },
    moverItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    moverLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    moverRank: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: 'rgba(255,255,255,0.3)',
        width: 32,
    },
    moverSymbol: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    moverName: {
        fontSize: 11,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.5)',
    },
    moverRight: {
        alignItems: 'flex-end',
    },
    moverPnL: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    moverValue: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.5)',
    },
});
