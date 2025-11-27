import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, TrendingUp, TrendingDown, Activity, Zap, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useCryptoStore } from '../../store/useCryptoStore';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { MiniChart } from '../../components/MiniChart';
import { CryptoDetailModal } from '../../components/CryptoDetailModal';
import { CryptoTooltip } from '../../components/CryptoTooltip';

export default function CryptoDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { cryptos, cryptoHoldings } = useCryptoStore();
    const [showModal, setShowModal] = useState(false);

    const crypto = cryptos.find(c => c.symbol === id);

    if (!crypto) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Crypto not found</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const holding = cryptoHoldings[crypto.symbol];
    const ownedQuantity = holding?.quantity || 0;
    const ownedValue = ownedQuantity * crypto.price;

    // Calculate price change from SESSION OPEN (must match CryptoCard!)
    const priceChange = crypto.price - crypto.openPrice;
    const changePercent = (priceChange / crypto.openPrice) * 100;

    const isPositive = priceChange >= 0;

    const getGradientColors = () => {
        if (isPositive) {
            return ['rgba(74, 0, 224, 0.1)', 'rgba(142, 45, 226, 0.05)'] as const;
        } else {
            return ['rgba(224, 0, 74, 0.1)', 'rgba(226, 45, 100, 0.05)'] as const;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{crypto.name}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <View style={styles.iconRow}>
                        {crypto.logo ? (
                            <Image source={crypto.logo} style={styles.logo} resizeMode="contain" />
                        ) : (
                            <View style={styles.placeholderLogo}>
                                <Text style={styles.placeholderText}>{crypto.symbol[0]}</Text>
                            </View>
                        )}
                        <View>
                            <Text style={styles.symbol}>{crypto.symbol}</Text>
                            <Text style={styles.name}>{crypto.name}</Text>
                        </View>
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>£{crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                        <View style={[styles.changeBadge, { backgroundColor: isPositive ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)' }]}>
                            {isPositive ? <TrendingUp size={16} color="#00FF00" /> : <TrendingDown size={16} color="#FF4444" />}
                            <Text style={[styles.changeText, { color: isPositive ? '#00FF00' : '#FF4444' }]}>
                                {changePercent.toFixed(2)}%
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Chart */}
                <View style={styles.chartCard}>
                    <LinearGradient
                        colors={getGradientColors()}
                        style={styles.chartBackground}
                    >
                        <MiniChart
                            data={crypto.history}
                            width={320}
                            height={160}
                            color={isPositive ? '#8E2DE2' : '#FF4444'}
                        />
                    </LinearGradient>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                            <Zap size={18} color="#FFD700" />
                        </View>
                        <View style={styles.statLabelRow}>
                            <Text style={styles.statLabel}>Volatility</Text>
                            <CryptoTooltip
                                title="Volatility"
                                content="A measure of how much the price fluctuates. High volatility means higher risk but potential for higher returns."
                                size={12}
                            />
                        </View>
                        <Text style={[styles.statValue, { color: '#FFD700' }]}>
                            {(crypto.volatility * 100).toFixed(0)}%
                        </Text>
                    </View>

                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
                            <Activity size={18} color="#06B6D4" />
                        </View>
                        <View style={styles.statLabelRow}>
                            <Text style={styles.statLabel}>Volume (24h)</Text>
                            <CryptoTooltip
                                title="24h Volume"
                                content="The total value of all trades for this cryptocurrency in the last 24 hours. High volume indicates high liquidity."
                                size={12}
                            />
                        </View>
                        <Text style={styles.statValue}>£{(Math.random() * 1000000).toFixed(0)}</Text>
                    </View>
                </View>

                {/* Position Card */}
                {ownedQuantity > 0 && (
                    <View style={styles.positionCard}>
                        <LinearGradient
                            colors={['rgba(74, 0, 224, 0.2)', 'rgba(142, 45, 226, 0.1)']}
                            style={styles.positionGradient}
                        >
                            <View style={styles.positionHeader}>
                                <Text style={styles.positionTitle}>Your Position</Text>
                                <Text style={styles.positionValue}>£{ownedValue.toFixed(2)}</Text>
                            </View>
                            <View style={styles.positionDetails}>
                                <View>
                                    <Text style={styles.positionLabel}>Quantity</Text>
                                    <Text style={styles.positionDetailValue}>{ownedQuantity.toFixed(4)} {crypto.symbol}</Text>
                                </View>
                                <View>
                                    <Text style={styles.positionLabel}>Avg. Cost</Text>
                                    <Text style={styles.positionDetailValue}>£{holding.averageCost.toFixed(2)}</Text>
                                </View>
                                <View>
                                    <Text style={styles.positionLabel}>Leverage</Text>
                                    <Text style={[styles.positionDetailValue, { color: COLORS.accent }]}>{holding.leverage}x</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                )}

                {/* About Section */}
                <View style={styles.aboutSection}>
                    <View style={styles.aboutHeader}>
                        <Info size={16} color={COLORS.textSub} />
                        <Text style={styles.aboutTitle}>About {crypto.name}</Text>
                    </View>
                    <Text style={styles.description}>{crypto.description}</Text>
                    <View style={styles.educationalCard}>
                        <Text style={styles.educationalTitle}>Did you know?</Text>
                        <Text style={styles.educationalText}>{crypto.educational}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Trade Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.tradeButton}
                    onPress={() => { setShowModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                >
                    <LinearGradient
                        colors={['#4A00E0', '#8E2DE2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.tradeGradient}
                    >
                        <Text style={styles.tradeButtonText}>TRADE</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <CryptoDetailModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                crypto={crypto}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        padding: 8,
        backgroundColor: COLORS.bgElevated,
        borderRadius: RADIUS.full,
    },
    backButtonText: {
        color: COLORS.accent,
        fontSize: 16,
        fontFamily: FONTS.semibold,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    content: {
        flex: 1,
    },
    titleSection: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        gap: SPACING.md,
    },
    logo: {
        width: 48,
        height: 48,
    },
    placeholderLogo: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.bgElevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    symbol: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    name: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.textSub,
    },
    priceContainer: {
        alignItems: 'center',
    },
    price: {
        fontSize: 36,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
    },
    changeText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    chartCard: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chartBackground: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    statItem: {
        flex: 1,
        backgroundColor: COLORS.bgElevated,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: COLORS.textSub,
    },
    statLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    positionCard: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(142, 45, 226, 0.3)',
    },
    positionGradient: {
        padding: SPACING.lg,
    },
    positionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    positionTitle: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    positionValue: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.white,
    },
    positionDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    positionLabel: {
        fontSize: 10,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 2,
    },
    positionDetailValue: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: COLORS.white,
    },
    aboutSection: {
        padding: SPACING.xl,
        marginBottom: 80, // Space for footer
    },
    aboutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.md,
    },
    aboutTitle: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    description: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.textSub,
        lineHeight: 22,
        marginBottom: SPACING.lg,
    },
    educationalCard: {
        backgroundColor: 'rgba(74, 0, 224, 0.05)',
        padding: SPACING.lg,
        borderRadius: RADIUS.md,
        borderLeftWidth: 4,
        borderLeftColor: '#4A00E0',
    },
    educationalTitle: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#4A00E0',
        marginBottom: SPACING.sm,
    },
    educationalText: {
        fontSize: 13,
        fontFamily: FONTS.regular,
        color: COLORS.text,
        lineHeight: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.lg,
        backgroundColor: COLORS.bg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    tradeButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    tradeGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    tradeButtonText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#FFF',
        letterSpacing: 1,
    },
});
