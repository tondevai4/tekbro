import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DailyChallenge } from '../types';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import * as Haptics from 'expo-haptics';
import { Zap } from 'lucide-react-native';

interface Props {
    challenge: DailyChallenge | null;
}

export function DailyChallengeCard({ challenge }: Props) {
    if (!challenge) return null;

    const progress = Math.min(100, (challenge.progress / challenge.target) * 100);
    const isComplete = challenge.completed;

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.9}
            style={{ marginBottom: SPACING.xl }}
        >
            <LinearGradient
                colors={isComplete ? [COLORS.success, '#059669'] : [COLORS.warning, '#d97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradientBorder, { opacity: isComplete ? 1 : 0.7 }]}
            >
                <View style={styles.innerContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.labelContainer}>
                            <Zap size={14} color={isComplete ? COLORS.success : COLORS.warning} fill={isComplete ? COLORS.success : COLORS.warning} />
                            <Text style={[styles.label, { color: isComplete ? COLORS.success : COLORS.warning }]}>
                                {isComplete ? 'CHALLENGE COMPLETE' : 'DAILY CHALLENGE'}
                            </Text>
                        </View>
                        {isComplete && (
                            <View style={styles.checkBadge}>
                                <Text style={styles.checkText}>✓</Text>
                            </View>
                        )}
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{challenge.title}</Text>
                    <Text style={styles.description}>{challenge.description}</Text>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <LinearGradient
                                colors={isComplete ? [COLORS.success, '#34d399'] : [COLORS.warning, '#fbbf24']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    styles.progressFill,
                                    { width: `${progress}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {challenge.progress.toFixed(0)} / {challenge.target}
                        </Text>
                    </View>

                    {/* Rewards */}
                    <View style={styles.rewardContainer}>
                        <Text style={styles.rewardLabel}>REWARD</Text>
                        <Text style={[styles.rewardText, { color: isComplete ? COLORS.success : COLORS.warning }]}>
                            +{challenge.reward.xp} XP{challenge.reward.cash && ` · +$${challenge.reward.cash}`}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    gradientBorder: {
        borderRadius: 16,
        padding: 1.5, // Thickness of the gradient border
    },
    innerContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 15, // Slightly less than border radius
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        fontFamily: FONTS.bold,
        letterSpacing: 1.5,
    },
    checkBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        marginBottom: SPACING.lg,
        lineHeight: 20,
    },
    progressContainer: {
        marginBottom: SPACING.lg,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: COLORS.textTertiary,
        fontFamily: FONTS.medium,
        textAlign: 'right',
    },
    rewardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    rewardLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textTertiary,
        fontFamily: FONTS.bold,
        letterSpacing: 1,
    },
    rewardText: {
        fontSize: 16,
        fontWeight: '800',
        fontFamily: FONTS.bold,
    },
});
