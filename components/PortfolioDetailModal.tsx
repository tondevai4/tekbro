import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    X, TrendingUp, TrendingDown, PieChart, BarChart3, Target,
    Cpu, Building2, Heart, ShoppingBag, Zap as Lightning, Home,
    Wallet, Briefcase, Activity, ArrowUpRight, ArrowDownRight, Award, Sparkles
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
            colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.glassCard, style]}
        >
            {children}
        </LinearGradient>
    );

    // Circular Progress Component
    const CircularProgress = ({ percentage, size = 60, color = '#00D9FF' }: any) => {
        const radius = size / 2 - 4;
        const circumference = 2 * Math.PI * radius;
        const progress = (percentage / 100) * circumference;

        return (
            <View style={[styles.circularProgress, { width: size, height: size }]}>
                <View style={styles.circleBackground} />
                <Text style={[styles.percentageText, { fontSize: size * 0.3 }]}>{Math.round(percentage)}%</Text>
            </View>
        );
    };

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
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onClose();
                    }}
                />

                <View style={styles.modalContent}>
                    <LinearGradient
                        colors={type === 'stocks' ? ['#0A0A1F', '#1A0F2E', '#0A0A1F'] : ['#1A0A2E', '#2E0A2E', '#1A0A2E']}
                        style={styles.modalGradient}
                    >
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.headerLeft}>
                                <LinearGradient
                                    colors={type === 'stocks' ? ['#00D9FF', '#0099FF'] : ['#8E2DE2', '#4A00E0']}
                                    style={styles.iconBg}
                                >
                                    {type === 'stocks' ? (
                                        <Briefcase size={26} color="#FFF" />
                                    ) : (
                                        <Wallet size={26} color="#FFF" />
                                    )}
                                </LinearGradient>
                                <View>
                                    <Text style={styles.modalTitle}>
                                        {type === 'stocks' ? 'Stock Portfolio' : 'Crypto Wallet'}
                                    </Text>
                                    <Text style={styles.modalSubtitle}>Complete Analytics</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                                onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                            >
                                <X size={24} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.scrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Hero Value Card with Gradient */}
                            <LinearGradient
                                colors={type === 'stocks'
                                    ? ['rgba(0, 217, 255, 0.2)', 'rgba(0, 153, 255, 0.1)']
                                    : ['rgba(142, 45, 226, 0.2)', 'rgba(74, 0, 224, 0.1)']}
                                style={styles.heroCard}
                            >
                                <View style={styles.heroContent}>
                                    <Sparkles size={20} color={type === 'stocks' ? '#00D9FF' : '#8E2DE2'} />
                                    <Text style={styles.valueLabel}>TOTAL VALUE</Text>
                                </View>
                                <Text style={styles.valueAmount}>
                                    £{analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Text>
                                <View style={styles.pnlRow}>
                                    {analytics.totalPnL >= 0 ? (
                                        <ArrowUpRight size={22} color="#00FF88" />
                                    ) : (
                                        <ArrowDownRight size={22} color="#FF4444" />
                                    )}
                                    <Text style={[styles.pnlText, { color: analytics.totalPnL >= 0 ? '#00FF88' : '#FF4444' }]}>
                                        {analytics.totalPnL >= 0 ? '+' : ''}£{Math.abs(analytics.totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Text>
                                    <Text style={[styles.pnlPercent, { color: analytics.totalPnL >= 0 ? '#00FF88' : '#FF4444' }]}>
                                        ({analytics.totalPnL >= 0 ? '+' : ''}{analytics.totalPnLPercent.toFixed(2)}%)
                                    </Text>
                                </View>
                            </LinearGradient>

                            {/* Stats Grid with Visual Indicators */}
                            <View style={styles.statsGrid}>
                                {renderGlassCard(
                                    <View style={styles.statCard}>
                                        <View style={styles.statHeader}>
                                            <PieChart size={18} color="#00D9FF" />
                                            <Text style={styles.statLabel}>Positions</Text>
                                        </View>
                                        <Text style={styles.statValue}>{analytics.positionCount}</Text>
                                        <View style={styles.progressBar}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    { width: `${Math.min(100, (analytics.positionCount / 10) * 100)}%`, backgroundColor: '#00D9FF' }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                )}
                                {renderGlassCard(
                                    <View style={styles.statCard}>
                                        <View style={styles.statHeader}>
                                            <Target size={18} color="#00FF88" />
                                            <Text style={styles.statLabel}>Diversified</Text>
                                        </View>
                                        <Text style={styles.statValue}>{Math.round(analytics.diversificationScore)}%</Text>
                                        <View style={styles.progressBar}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    { width: `${analytics.diversificationScore}%`, backgroundColor: '#00FF88' }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                )}
                                {renderGlassCard(
                                    <View style={styles.statCard}>
                                        <View style={styles.statHeader}>
                                            <Wallet size={18} color="#FFD700" />
                                            <Text style={styles.statLabel}>Cash</Text>
                                        </View>
                                        <Text style={styles.statValue}>{analytics.cashPercent.toFixed(0)}%</Text>
                                        <View style={styles.progressBar}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    { width: `${analytics.cashPercent}%`, backgroundColor: '#FFD700' }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                )}
                                {type === 'crypto' && (
                                    renderGlassCard(
                                        <View style={styles.statCard}>
                                            <View style={styles.statHeader}>
                                                <Activity size={18} color="#FF6B9D" />
                                                <Text style={styles.statLabel}>Avg Leverage</Text>
                                            </View>
                                            <Text style={styles.statValue}>{analytics.averageLeverage.toFixed(1)}x</Text>
                                            <View style={styles.progressBar}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        { width: `${Math.min(100, (analytics.averageLeverage / 10) * 100)}%`, backgroundColor: '#FF6B9D' }
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                    )
                                )}
                            </View>

                            {/* Sector Breakdown (Stocks only) - Now with better visuals */}
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
                                                                <SectorIcon size={18} color="#FFF" />
                                                            </LinearGradient>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={styles.sectorName}>{sector.sector}</Text>
                                                                <View style={styles.sectorProgressBar}>
                                                                    <LinearGradient
                                                                        colors={sectorColors}
                                                                        style={[styles.sectorProgressFill, { width: `${sector.percentage}%` }]}
                                                                    />
                                                                </View>
                                                            </View>
                                                        </View>
                                                        <View style={styles.sectorRight}>
                                                            <Text style={styles.sectorPercent}>{sector.percentage.toFixed(1)}%</Text>
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
                                    <View style={styles.sectionHeader}>
                                        <Award size={16} color="#00FF88" />
                                        <Text style={styles.sectionTitle}>TOP GAINERS</Text>
                                    </View>
                                    {renderGlassCard(
                                        <View style={styles.moversList}>
                                            {analytics.topGainers.map((item: any, index: number) => (
                                                <LinearGradient
                                                    key={item.symbol}
                                                    colors={['rgba(0, 255, 136, 0.1)', 'rgba(0, 255, 136, 0.05)']}
                                                    style={styles.moverItem}
                                                >
                                                    <View style={styles.moverLeft}>
                                                        <View style={[styles.moverRankBadge, { backgroundColor: '#00FF88' }]}>
                                                            <Text style={styles.moverRankText}>#{index + 1}</Text>
                                                        </View>
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
                                                </LinearGradient>
                                            ))}
                                        </View>,
                                        { marginBottom: SPACING.md }
                                    )}
                                </>
                            )}

                            {/* Top Losers */}
                            {analytics.topLosers.length > 0 && (
                                <>
                                    <View style={styles.sectionHeader}>
                                        <TrendingDown size={16} color="#FF4444" />
                                        <Text style={styles.sectionTitle}>TOP LOSERS</Text>
                                    </View>
                                    {renderGlassCard(
                                        <View style={styles.moversList}>
                                            {analytics.topLosers.map((item: any, index: number) => (
                                                <LinearGradient
                                                    key={item.symbol}
                                                    colors={['rgba(255, 68, 68, 0.1)', 'rgba(255, 68, 68, 0.05)']}
                                                    style={styles.moverItem}
                                                >
                                                    <View style={styles.moverLeft}>
                                                        <View style={[styles.moverRankBadge, { backgroundColor: '#FF4444' }]}>
                                                            <Text style={styles.moverRankText}>#{index + 1}</Text>
                                                        </View>
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
                                                </LinearGradient>
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
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        height: '90%',
        borderTopLeftRadius: RADIUS.xl * 2,
        borderTopRightRadius: RADIUS.xl * 2,
        overflow: 'hidden',
    },
    modalGradient: {
        flex: 1,
        padding: SPACING.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    iconBg: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00D9FF',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    modalTitle: {
        fontSize: 26,
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
    heroCard: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.lg,
        shadowColor: '#00D9FF',
        shadowOpacity: 0.2,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 6 },
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    valueLabel: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1.5,
    },
    valueAmount: {
        fontSize: 42,
        fontFamily: FONTS.bold,
        color: '#FFF',
        letterSpacing: -2,
        marginBottom: 8,
    },
    pnlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pnlText: {
        fontSize: 20,
        fontFamily: FONTS.bold,
    },
    pnlPercent: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        opacity: 0.8,
    },
    glassCard: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: SPACING.lg,
        backgroundColor: 'rgba(255,255,255,0.03)',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
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
        gap: SPACING.sm,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    statLabel: {
        fontSize: 11,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.5)',
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    circularProgress: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    circleBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 999,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    percentageText: {
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1.5,
    },
    sectorList: {
        gap: SPACING.md,
    },
    sectorItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: SPACING.md,
    },
    sectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        flex: 1,
    },
    sectorIcon: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectorName: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#FFF',
        marginBottom: 4,
    },
    sectorProgressBar: {
        width: '100%',
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    sectorProgressFill: {
        height: '100%',
        borderRadius: 2,
    },
    sectorRight: {
        alignItems: 'flex-end',
        minWidth: 60,
    },
    sectorPercent: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    sectorPnL: {
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    moversList: {
        gap: SPACING.sm,
    },
    moverItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    moverLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        flex: 1,
    },
    moverRankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moverRankText: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        color: '#000',
    },
    moverSymbol: {
        fontSize: 15,
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
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    moverValue: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.5)',
    },
});
