import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, TrendingUp, TrendingDown, DollarSign, PieChart, Wallet, Bitcoin } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    visible: boolean;
    onClose: () => void;
    netWorth: number;
    cash: number;
    stockValue: number;
    cryptoValue: number;
    totalChange: number;
    totalChangePercent: number;
}

export function NetWorthModal({ visible, onClose, netWorth, cash, stockValue, cryptoValue, totalChange, totalChangePercent }: Props) {
    const isProfit = totalChange >= 0;

    const BreakdownItem = ({ icon: Icon, label, value, color, percent }: any) => (
        <View style={styles.item}>
            <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                <Icon size={24} color={color} />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemLabel}>{label}</Text>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBar, { width: `${percent}%`, backgroundColor: color }]} />
                </View>
            </View>
            <View style={styles.itemRight}>
                <Text style={styles.itemValue}>£{value.toLocaleString()}</Text>
                <Text style={styles.itemPercent}>{percent.toFixed(1)}%</Text>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <BlurView intensity={20} style={styles.container}>
                <View style={styles.content}>
                    <LinearGradient
                        colors={[COLORS.card, COLORS.bg]}
                        style={styles.card}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>Net Worth Breakdown</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.mainValue}>
                            <Text style={styles.label}>Total Balance</Text>
                            <Text style={styles.value}>£{netWorth.toLocaleString()}</Text>
                            <View style={[styles.badge, { backgroundColor: isProfit ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)' }]}>
                                {isProfit ? <TrendingUp size={16} color={COLORS.success} /> : <TrendingDown size={16} color={COLORS.negative} />}
                                <Text style={[styles.badgeText, { color: isProfit ? COLORS.success : COLORS.negative }]}>
                                    {isProfit ? '+' : ''}£{Math.abs(totalChange).toLocaleString()} ({totalChangePercent.toFixed(2)}%)
                                </Text>
                            </View>
                        </View>

                        <View style={styles.breakdown}>
                            <BreakdownItem
                                icon={Wallet}
                                label="Cash Balance"
                                value={cash}
                                color="#3B82F6"
                                percent={(cash / netWorth) * 100}
                            />
                            <BreakdownItem
                                icon={PieChart}
                                label="Stock Portfolio"
                                value={stockValue}
                                color="#10B981"
                                percent={(stockValue / netWorth) * 100}
                            />
                            <BreakdownItem
                                icon={Bitcoin}
                                label="Crypto Assets"
                                value={cryptoValue}
                                color="#F59E0B"
                                percent={(cryptoValue / netWorth) * 100}
                            />
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Your net worth is calculated from your available cash plus the current market value of all your stock and crypto holdings.
                            </Text>
                        </View>
                    </LinearGradient>
                </View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    content: {
        height: '60%',
        backgroundColor: COLORS.bg,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    card: {
        flex: 1,
        padding: SPACING.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    closeButton: {
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: RADIUS.full,
    },
    mainValue: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    label: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    value: {
        fontSize: 40,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
        gap: 6,
    },
    badgeText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    breakdown: {
        gap: SPACING.lg,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    itemContent: {
        flex: 1,
        marginRight: SPACING.md,
    },
    itemLabel: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginBottom: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: RADIUS.full,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: RADIUS.full,
    },
    itemRight: {
        alignItems: 'flex-end',
    },
    itemValue: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginBottom: 2,
    },
    itemPercent: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
    },
    footer: {
        marginTop: 'auto',
        paddingTop: SPACING.xl,
    },
    footerText: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        textAlign: 'center',
        lineHeight: 18,
    },
});
