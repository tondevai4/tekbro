import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Zap, TrendingUp, TrendingDown, AlertTriangle, Target, BarChart3, Activity } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

interface FearGreedModalProps {
    visible: boolean;
    onClose: () => void;
    fearGreedIndex: number;
    getMoodColor: () => string;
    getMoodLabel: () => string;
    marketCyclePhase: string;
}

export function FearGreedModal({ visible, onClose, fearGreedIndex, getMoodColor, getMoodLabel, marketCyclePhase }: FearGreedModalProps) {
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

    const getImpact = () => {
        if (fearGreedIndex >= 75) return {
            mood: 'Extreme Greed',
            description: 'Markets are euphoric. Prices rallying hard',
            effect: '+2% daily bias',
            icon: TrendingUp,
            color: '#00FF88'
        };
        if (fearGreedIndex >= 55) return {
            mood: 'Greed',
            description: 'Bullish sentiment. Investors buying the dip',
            effect: '+1% daily bias',
            icon: TrendingUp,
            color: '#00CC66'
        };
        if (fearGreedIndex >= 45) return {
            mood: 'Neutral',
            description: 'Balanced market emotions',
            effect: 'No bias',
            icon: Activity,
            color: '#888'
        };
        if (fearGreedIndex >= 25) return {
            mood: 'Fear',
            description: 'Bearish sentiment. Investors selling',
            effect: '-1% daily bias',
            icon: TrendingDown,
            color: '#FF8844'
        };
        return {
            mood: 'Extreme Fear',
            description: 'Panic selling. Capitulation in progress',
            effect: '-2% daily bias',
            icon: AlertTriangle,
            color: '#FF4444'
        };
    };

    const impact = getImpact();
    const ImpactIcon = impact.icon;

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
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <Zap size={28} color={getMoodColor()} fill={getMoodColor()} />
                                <Text style={styles.title}>Fear & Greed Index</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Current Reading */}
                            {renderGlassCard(
                                <View style={styles.currentCard}>
                                    <View style={styles.currentHeader}>
                                        <Text style={styles.currentLabel}>CURRENT READING</Text>
                                        <View style={[styles.badge, { backgroundColor: `${getMoodColor()}22`, borderColor: getMoodColor() }]}>
                                            <Text style={[styles.badgeText, { color: getMoodColor() }]}>
                                                {getMoodLabel().toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.indexValue, { color: getMoodColor() }]}>
                                        {Math.round(fearGreedIndex)}
                                    </Text>
                                    <View style={styles.impactRow}>
                                        <ImpactIcon size={20} color={impact.color} />
                                        <Text style={[styles.impactText, { color: impact.color }]}>
                                            {impact.mood}
                                        </Text>
                                    </View>
                                    <Text style={styles.impactDesc}>{impact.description}</Text>
                                </View>,
                                { marginBottom: SPACING.lg }
                            )}

                            {/* What Is It */}
                            <Text style={styles.sectionTitle}>WHAT IS IT?</Text>
                            {renderGlassCard(
                                <View style={styles.contentCard}>
                                    <Text style={styles.contentText}>
                                        The Fear & Greed Index measures market emotions on a scale from 0 (Extreme Fear) to 100 (Extreme Greed).
                                        {'\n\n'}
                                        <Text style={styles.highlightText}>It's calculated from 7 market factors:</Text>
                                        {'\n\n'}• Price Momentum (Stocks above 50-day MA){'\n'}
                                        • Market Strength (New 52-week highs vs lows){'\n'}
                                        • Trading Volume (Rising vs falling){'\n'}
                                        • Volatility Index (VIX level){'\n'}
                                        • Safe Haven Demand (Bonds vs stocks){'\n'}
                                        • Junk Bond Demand (Risk appetite){'\n'}
                                        • Market Breadth (Up vs down issues)
                                    </Text>
                                </View>,
                                { marginBottom: SPACING.lg }
                            )}

                            {/* Market Impact */}
                            <Text style={styles.sectionTitle}>MARKET IMPACT</Text>
                            {renderGlassCard(
                                <View style={styles.contentCard}>
                                    <View style={styles.impactItem}>
                                        <BarChart3 size={20} color="#00D9FF" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.impactItemTitle}>Stock Prices</Text>
                                            <Text style={styles.impactItemText}>
                                                Sentiment creates {impact.effect} on daily price movements
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.impactItem}>
                                        <Zap size={20} color="#8E2DE2" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.impactItemTitle}>Crypto (2x Amplified)</Text>
                                            <Text style={styles.impactItemText}>
                                                Crypto markets react 2x stronger. Expect extreme pumps during greed, brutal dumps during fear
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.impactItem}>
                                        <Activity size={20} color="#FFD700" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.impactItemTitle}>Market Cycles</Text>
                                            <Text style={styles.impactItemText}>
                                                Current cycle: <Text style={styles.cycleHighlight}>{marketCyclePhase.toUpperCase()}</Text>
                                                {'\n'}Different sectors perform better in different cycle phases
                                            </Text>
                                        </View>
                                    </View>
                                </View>,
                                { marginBottom: SPACING.lg }
                            )}

                            {/* Pro Tip */}
                            {renderGlassCard(
                                <View style={styles.tipCard}>
                                    <Target size={20} color="#00FF88" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.tipTitle}>PRO TIP</Text>
                                        <Text style={styles.tipText}>
                                            Fear & Greed is a <Text style={styles.highlightText}>contrarian indicator</Text>.
                                            When everyone's greedy, it might be time to sell. When everyone's fearful, look for buying opportunities!
                                        </Text>
                                    </View>
                                </View>,
                                { marginBottom: SPACING.xl }
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
    header: {
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
    title: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    closeButton: {
        padding: SPACING.sm,
    },
    glassCard: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: SPACING.lg,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    currentCard: {
        alignItems: 'center',
        gap: SPACING.sm,
    },
    currentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.sm,
    },
    currentLabel: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
    },
    badge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    indexValue: {
        fontSize: 72,
        fontFamily: FONTS.bold,
        letterSpacing: -2,
    },
    impactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    impactText: {
        fontSize: 20,
        fontFamily: FONTS.bold,
    },
    impactDesc: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1.5,
        marginBottom: SPACING.md,
    },
    contentCard: {
        gap: SPACING.md,
    },
    contentText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 22,
    },
    highlightText: {
        color: '#FFF',
        fontFamily: FONTS.bold,
    },
    impactItem: {
        flexDirection: 'row',
        gap: SPACING.md,
        alignItems: 'flex-start',
    },
    impactItemTitle: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#FFF',
        marginBottom: 4,
    },
    impactItemText: {
        fontSize: 13,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 19,
    },
    cycleHighlight: {
        color: '#00FF88',
        fontFamily: FONTS.bold,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    tipCard: {
        flexDirection: 'row',
        gap: SPACING.md,
        alignItems: 'flex-start',
    },
    tipTitle: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: '#00FF88',
        marginBottom: 6,
        letterSpacing: 1,
    },
    tipText: {
        fontSize: 13,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 19,
    },
});
