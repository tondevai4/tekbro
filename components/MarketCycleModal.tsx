import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, X, Percent, TrendingUp, BarChart3, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const CYCLES = {
    accumulation: {
        label: 'Accumulation',
        color: '#00FF88',
        description: 'Smart money is buying. Prices are low, sentiment is bearish, but volume is picking up. Best time to enter.',
        strategy: 'Value Investing & DCA',
        sectors: ['Tech', 'Finance', 'Consumer']
    },
    markup: {
        label: 'Markup',
        color: '#00CCFF',
        description: 'The Bull Run. Prices are rising, sentiment is improving. Trend following works best here.',
        strategy: 'Trend Following & Growth',
        sectors: ['Tech', 'Consumer', 'Energy']
    },
    distribution: {
        label: 'Distribution',
        color: '#FFD700',
        description: 'Smart money is selling. Prices are high, sentiment is euphoric, but volume is dropping. Prepare for a reversal.',
        strategy: 'Profit Taking & Hedging',
        sectors: ['Healthcare', 'Utilities', 'Staples']
    },
    markdown: {
        label: 'Markdown',
        color: '#FF4444',
        description: 'The Bear Market. Prices are falling, panic is setting in. Cash is king. Look for capitulation to re-enter.',
        strategy: 'Short Selling & Cash',
        sectors: ['Cash', 'Gold', 'Bonds']
    }
};

interface MarketCycleModalProps {
    visible: boolean;
    onClose: () => void;
    phase: keyof typeof CYCLES;
    type: 'stocks' | 'crypto';
    interestRate?: number;
    gdpGrowth?: number;
    inflation?: number;
    cryptoDominance?: number;
    cryptoVolatility?: number;
}

export const MarketCycleModal = ({
    visible,
    onClose,
    phase,
    type,
    interestRate = 0,
    gdpGrowth = 0,
    inflation = 0,
    cryptoDominance = 0,
    cryptoVolatility = 0
}: MarketCycleModalProps) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const cycle = CYCLES[phase] || CYCLES.accumulation;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    damping: 15,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            scaleAnim.setValue(0.9);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    const renderMetric = (label: string, value: string, icon: React.ReactNode, trend?: 'up' | 'down' | 'neutral') => (
        <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
                {icon}
                <Text style={styles.metricLabel}>{label}</Text>
            </View>
            <Text style={styles.metricValue}>{value}</Text>
        </View>
    );

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={40} tint="dark" style={styles.container}>
                <Animated.View style={[
                    styles.content,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim
                    }
                ]}>
                    <LinearGradient
                        colors={['#1A1A24', '#0F0F14']}
                        style={styles.card}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.titleContainer}>
                                <Activity size={24} color={cycle.color} />
                                <Text style={styles.title}>{type === 'crypto' ? 'Crypto Cycle Analysis' : 'Market Cycle Analysis'}</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                            {/* Current Phase Banner */}
                            <LinearGradient
                                colors={[`${cycle.color}22`, `${cycle.color}05`]}
                                style={[styles.phaseBanner, { borderColor: `${cycle.color}44` }]}
                            >
                                <Text style={[styles.phaseLabel, { color: cycle.color }]}>{cycle.label.toUpperCase()}</Text>
                                <Text style={styles.phaseDesc}>{cycle.description}</Text>
                            </LinearGradient>

                            {/* Macro Metrics */}
                            <Text style={styles.sectionTitle}>{type === 'crypto' ? 'ON-CHAIN METRICS' : 'MACRO ECONOMICS'}</Text>
                            <View style={styles.metricsGrid}>
                                {type === 'crypto' ? (
                                    <>
                                        {renderMetric(
                                            'Dominance',
                                            `${cryptoDominance.toFixed(1)}%`,
                                            <Percent size={14} color="#F59E0B" />
                                        )}
                                        {renderMetric(
                                            'Volatility',
                                            `${(cryptoVolatility).toFixed(0)}`,
                                            <Activity size={14} color={cryptoVolatility > 50 ? '#FF4444' : '#00FF88'} />
                                        )}
                                        {renderMetric(
                                            'Momentum',
                                            cycle.label === 'Markup' ? 'High' : 'Low',
                                            <TrendingUp size={14} color={cycle.color} />
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {renderMetric(
                                            'Interest Rate',
                                            `${interestRate.toFixed(2)}%`,
                                            <Percent size={14} color="#A855F7" />
                                        )}
                                        {renderMetric(
                                            'GDP Growth',
                                            `${gdpGrowth.toFixed(2)}%`,
                                            <BarChart3 size={14} color={gdpGrowth > 0 ? '#00FF88' : '#FF4444'} />
                                        )}
                                        {renderMetric(
                                            'Inflation',
                                            `${inflation.toFixed(2)}%`,
                                            <TrendingUp size={14} color={inflation > 3 ? '#FF4444' : '#00CCFF'} />
                                        )}
                                    </>
                                )}
                            </View>

                            {/* Strategy Section */}
                            <Text style={styles.sectionTitle}>STRATEGY GUIDE</Text>
                            <View style={styles.strategyCard}>
                                <View style={styles.strategyRow}>
                                    <Info size={16} color="#FFF" />
                                    <Text style={styles.strategyLabel}>Recommended Strategy:</Text>
                                </View>
                                <Text style={[styles.strategyValue, { color: cycle.color }]}>{cycle.strategy}</Text>

                                <View style={styles.divider} />

                                <Text style={styles.sectorsLabel}>{type === 'crypto' ? 'Top Narratives:' : 'Top Performing Sectors:'}</Text>
                                <View style={styles.sectorPills}>
                                    {(type === 'crypto' ? ['L1s', 'DeFi', 'Gaming'] : cycle.sectors).map(sector => (
                                        <View key={sector} style={[styles.sectorPill, { borderColor: `${cycle.color}44`, backgroundColor: `${cycle.color}11` }]}>
                                            <Text style={[styles.sectorText, { color: cycle.color }]}>{sector}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                        </ScrollView>
                    </LinearGradient>
                </Animated.View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    content: {
        width: '100%',
        maxHeight: '80%',
    },
    card: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    title: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: RADIUS.full,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    phaseBanner: {
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        marginBottom: SPACING.xl,
    },
    phaseLabel: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.xs,
        letterSpacing: 1,
    },
    phaseDesc: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1.5,
        marginBottom: SPACING.md,
    },
    metricsGrid: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    metricCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 10,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.5)',
    },
    metricValue: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    strategyCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    strategyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    strategyLabel: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.6)',
    },
    strategyValue: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.md,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: SPACING.md,
    },
    sectorsLabel: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: SPACING.sm,
    },
    sectorPills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    sectorPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
        borderWidth: 1,
    },
    sectorText: {
        fontSize: 11,
        fontFamily: FONTS.bold,
    },
});
