import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Animated } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, TrendingUp, TrendingDown, Zap, ArrowUpRight, ArrowDownRight, Activity, Wallet } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCryptoStore } from '../../store/useCryptoStore';
import { useMarketMoodStore } from '../../store/useMarketMoodStore';
import { CryptoCard } from '../../components/CryptoCard';
import { PortfolioDetailModal } from '../../components/PortfolioDetailModal';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useCryptoEngine } from '../../hooks/useCryptoEngine';
import { TransferModal } from '../../components/TransferModal';
import { CryptoOnboardingModal } from '../../components/CryptoOnboardingModal';
import { useStore } from '../../store/useStore';

export default function CryptoScreen() {
    // Ensure engine is running
    useCryptoEngine();

    const router = useRouter();
    const { cryptos, cryptoHoldings, cryptoWallet } = useCryptoStore();
    const { cryptoOnboardingCompleted, setCryptoOnboardingCompleted } = useStore();
    const { fearGreedIndex, getMoodLabel, getMoodColor, marketCyclePhase } = useMarketMoodStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [transferModalVisible, setTransferModalVisible] = useState(false);
    const [transferType, setTransferType] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
    const [onboardingVisible, setOnboardingVisible] = useState(false);
    const [portfolioModalVisible, setPortfolioModalVisible] = useState(false);

    // Trigger onboarding
    React.useEffect(() => {
        if (!cryptoOnboardingCompleted) {
            const timer = setTimeout(() => setOnboardingVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, [cryptoOnboardingCompleted]);

    // Calculate portfolio metrics
    const portfolioValue = useMemo(() => {
        return Object.values(cryptoHoldings).reduce((total, holding) => {
            const crypto = cryptos.find(c => c.symbol === holding.symbol);
            return total + (crypto ? holding.quantity * crypto.price : 0);
        }, 0) + cryptoWallet;
    }, [cryptoHoldings, cryptos, cryptoWallet]);

    const portfolioPnL = useMemo(() => {
        return Object.values(cryptoHoldings).reduce((total, holding) => {
            const crypto = cryptos.find(c => c.symbol === holding.symbol);
            if (!crypto) return total;
            const currentValue = holding.quantity * crypto.price;
            const costBasis = holding.quantity * holding.averageCost;
            return total + (currentValue - costBasis) * holding.leverage;
        }, 0);
    }, [cryptoHoldings, cryptos]);

    const portfolioPnLPercent = useMemo(() => {
        const invested = portfolioValue - portfolioPnL;
        return invested > 0 ? (portfolioPnL / invested) * 100 : 0;
    }, [portfolioValue, portfolioPnL]);

    const filteredCryptos = useMemo(() => {
        if (!searchQuery) return cryptos;
        const query = searchQuery.toLowerCase();
        return cryptos.filter(c =>
            c.symbol.toLowerCase().includes(query) ||
            c.name.toLowerCase().includes(query)
        );
    }, [cryptos, searchQuery]);

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
                    <Text style={styles.headerTitle}>Crypto</Text>
                    <Text style={styles.headerSubtitle}>Market Exchange</Text>
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

                    {/* Fear & Greed */}
                    <LinearGradient
                        colors={[`${getMoodColor()}33`, `${getMoodColor()}11`]}
                        style={styles.moodBadge}
                    >
                        <Zap size={12} color={getMoodColor()} fill={getMoodColor()} />
                        <Text style={[styles.moodValue, { color: getMoodColor() }]}>
                            {Math.round(fearGreedIndex)}
                        </Text>
                    </LinearGradient>
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
                            <View style={styles.walletIconContainer}>
                                <LinearGradient
                                    colors={['#8E2DE2', '#4A00E0']}
                                    style={styles.walletIconBg}
                                >
                                    <Wallet size={20} color="#FFF" />
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

                        {/* Quick Actions */}
                        <View style={styles.quickActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    setTransferType('DEPOSIT');
                                    setTransferModalVisible(true);
                                }}
                            >
                                <LinearGradient
                                    colors={['#00FF88', '#00CC66']}
                                    style={styles.actionGradient}
                                >
                                    <TrendingUp size={16} color="#000" />
                                    <Text style={styles.actionText}>Deposit</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    setTransferType('WITHDRAW');
                                    setTransferModalVisible(true);
                                }}
                            >
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                                    style={styles.actionGradient}
                                >
                                    <TrendingDown size={16} color="#FFF" />
                                    <Text style={[styles.actionText, { color: '#FFF' }]}>Withdraw</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>,
                    { marginBottom: SPACING.lg }
                )}
            </TouchableOpacity>

            {/* Holdings Carousel */}
            {Object.keys(cryptoHoldings).length > 0 && (
                <View style={styles.holdingsSection}>
                    <Text style={styles.sectionTitle}>YOUR POSITIONS</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.holdingsList}
                    >
                        {cryptos
                            .filter(c => cryptoHoldings[c.symbol]?.quantity > 0)
                            .map(crypto => {
                                const holding = cryptoHoldings[crypto.symbol];
                                const pnl = (crypto.price - holding.averageCost) * holding.quantity * holding.leverage;
                                const pnlPercent = ((crypto.price - holding.averageCost) / holding.averageCost) * 100 * holding.leverage;

                                return (
                                    <TouchableOpacity
                                        key={crypto.symbol}
                                        onPress={() => router.push(`/crypto/${crypto.symbol}`)}
                                    >
                                        {renderGlassCard(
                                            <View style={styles.holdingCard}>
                                                <View style={styles.holdingHeader}>
                                                    <Text style={styles.holdingSymbol}>{crypto.symbol}</Text>
                                                    {holding.leverage > 1 && (
                                                        <View style={styles.leverageBadge}>
                                                            <Text style={styles.leverageText}>{holding.leverage}x</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.holdingValue}>
                                                    £{(holding.quantity * crypto.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

            {/* Search Bar */}
            {renderGlassCard(
                <View style={styles.searchContent}>
                    <Search size={18} color="rgba(255,255,255,0.5)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search crypto..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>,
                { marginBottom: SPACING.lg }
            )}

            <Text style={styles.sectionTitle}>ALL MARKETS</Text>
        </View>
    );

    const FlashListAny = FlashList as any;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Animated Background */}
            <LinearGradient
                colors={['#0A0A0F', '#1A0A2E', '#0A0A0F']}
                style={StyleSheet.absoluteFill}
            />

            <FlashListAny
                data={filteredCryptos}
                keyExtractor={(item: any) => item.symbol}
                renderItem={({ item }: { item: any }) => <CryptoCard crypto={item} />}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                estimatedItemSize={140}
            />

            <TransferModal
                visible={transferModalVisible}
                onClose={() => setTransferModalVisible(false)}
                type={transferType}
            />

            <CryptoOnboardingModal
                visible={onboardingVisible}
                onClose={() => {
                    setOnboardingVisible(false);
                    setCryptoOnboardingCompleted(true);
                }}
            />

            <PortfolioDetailModal
                visible={portfolioModalVisible}
                onClose={() => setPortfolioModalVisible(false)}
                type="crypto"
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
    walletIconContainer: {
        width: 48,
        height: 48,
    },
    walletIconBg: {
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
    quickActions: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    actionButton: {
        flex: 1,
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
    },
    actionText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#000',
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
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    holdingSymbol: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    leverageBadge: {
        backgroundColor: 'rgba(255,215,0,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    leverageText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        color: '#FFD700',
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
