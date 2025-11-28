import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { X, Flame, Calendar, Info } from 'lucide-react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    streak: number;
    lastLoginDate: string;
}

export const StreakDetailModal = ({ visible, onClose, streak, lastLoginDate }: Props) => {
    const nextMilestone = streak < 3 ? 3 : streak < 7 ? 7 : streak < 14 ? 14 : streak < 30 ? 30 : streak + 10;
    const daysToNext = nextMilestone - streak;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={20} style={styles.overlay}>
                <View style={styles.container}>
                    <LinearGradient
                        colors={[COLORS.card, '#1e293b']}
                        style={styles.content}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.streakBadge}>
                                <Flame size={14} color="#F59E0B" fill="#F59E0B" />
                                <Text style={styles.streakBadgeText}>{streak} DAY STREAK</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.mainIcon}>
                            <Flame size={80} color="#F59E0B" fill={streak > 0 ? "#F59E0B" : "transparent"} />
                        </View>

                        <Text style={styles.title}>Login Streak</Text>
                        <Text style={styles.subtitle}>
                            Open the app daily to build your streak and earn XP multipliers.
                        </Text>

                        {/* Status Card */}
                        <View style={styles.statusCard}>
                            <View style={styles.statusRow}>
                                <View style={styles.statusIcon}>
                                    <Calendar size={20} color={COLORS.accent} />
                                </View>
                                <View style={styles.statusInfo}>
                                    <Text style={styles.statusLabel}>Last Login</Text>
                                    <Text style={styles.statusValue}>{lastLoginDate || 'Today'}</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.statusRow}>
                                <View style={styles.statusIcon}>
                                    <Info size={20} color={COLORS.positive} />
                                </View>
                                <View style={styles.statusInfo}>
                                    <Text style={styles.statusLabel}>Next Milestone</Text>
                                    <Text style={styles.statusValue}>{nextMilestone} Days (+{nextMilestone * 10} XP)</Text>
                                </View>
                            </View>
                        </View>

                        {/* Tip */}
                        <View style={styles.tipContainer}>
                            <Text style={styles.tipText}>
                                <Text style={{ fontWeight: 'bold', color: '#F59E0B' }}>Tip: </Text>
                                Don't break the chain! If you miss a day, your streak resets to 0.
                            </Text>
                        </View>

                    </LinearGradient>
                </View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    container: {
        width: '100%',
        maxWidth: 360,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    content: {
        padding: SPACING.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    streakBadgeText: {
        color: '#F59E0B',
        fontFamily: FONTS.bold,
        fontSize: 12,
        letterSpacing: 0.5,
    },
    closeButton: {
        padding: 4,
    },
    mainIcon: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 20,
    },
    statusCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.xl,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusInfo: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
        marginBottom: 2,
    },
    statusValue: {
        fontSize: 16,
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: SPACING.md,
    },
    tipContainer: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    tipText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        lineHeight: 18,
    },
});
