import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, CheckCircle2, Lock, Trophy } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

interface Props {
    visible: boolean;
    onClose: () => void;
    level: number;
    xp: number;
}

export const LevelDetailModal = ({ visible, onClose, level, xp }: Props) => {
    const nextLevelXp = Math.floor(1000 * Math.pow(level, 1.5));
    const prevLevelXp = Math.floor(1000 * Math.pow(level - 1, 1.5));
    const currentLevelProgress = xp - prevLevelXp;
    const levelRange = nextLevelXp - prevLevelXp;
    const progressPercent = Math.min(100, Math.max(0, (currentLevelProgress / levelRange) * 100));

    const benefits = [
        { level: 1, text: 'Basic Trading Access', unlocked: true },
        { level: 2, text: 'Limit Orders', unlocked: level >= 2 },
        { level: 5, text: 'Crypto Trading', unlocked: level >= 5 },
        { level: 10, text: 'Options Trading (Coming Soon)', unlocked: level >= 10 },
        { level: 20, text: 'Margin Accounts (Coming Soon)', unlocked: level >= 20 },
    ];

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
                        colors={['#1A1A2E', '#16213E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.content}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>LEVEL {level}</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Main Icon */}
                        <View style={styles.mainIcon}>
                            <Trophy size={64} color={COLORS.accent} />
                        </View>

                        <Text style={styles.title}>Level {level} Trader</Text>
                        <Text style={styles.subtitle}>Keep trading to unlock more features!</Text>

                        {/* XP Progress */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressLabels}>
                                <Text style={styles.xpText}>{Math.floor(currentLevelProgress)} XP</Text>
                                <Text style={styles.xpText}>{Math.floor(levelRange)} XP</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <LinearGradient
                                    colors={[COLORS.accent, '#4F46E5']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                                />
                            </View>
                        </View>

                        {/* Benefits List */}
                        <ScrollView style={styles.benefitsList} showsVerticalScrollIndicator={false}>
                            <Text style={styles.sectionTitle}>Level Benefits</Text>
                            {benefits.map((benefit, index) => (
                                <View key={index} style={[styles.benefitItem, !benefit.unlocked && styles.benefitLocked]}>
                                    {benefit.unlocked ? (
                                        <CheckCircle2 size={20} color={COLORS.positive} />
                                    ) : (
                                        <Lock size={20} color={COLORS.textMuted} />
                                    )}
                                    <Text style={[styles.benefitText, !benefit.unlocked && styles.benefitTextLocked]}>
                                        {benefit.text}
                                    </Text>
                                    {!benefit.unlocked && (
                                        <View style={styles.lockBadge}>
                                            <Text style={styles.lockText}>Lvl {benefit.level}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
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
        maxWidth: 400,
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
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    levelBadge: {
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(6, 182, 212, 0.4)',
    },
    levelText: {
        color: COLORS.accent,
        fontFamily: FONTS.bold,
        fontSize: 14,
        letterSpacing: 1,
    },
    closeButton: {
        padding: 4,
    },
    mainIcon: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
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
    },
    progressContainer: {
        marginBottom: SPACING.xl,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    xpText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    benefitsList: {
        maxHeight: 200,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.md,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    benefitLocked: {
        opacity: 0.5,
    },
    benefitText: {
        flex: 1,
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.text,
    },
    benefitTextLocked: {
        color: COLORS.textMuted,
    },
    lockBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    lockText: {
        fontSize: 10,
        color: COLORS.textMuted,
        fontFamily: FONTS.bold,
    },
});
