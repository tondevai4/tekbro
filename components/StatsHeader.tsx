import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

interface Props {
    xp: number;
    level: number;
    loginStreak: number;
}

export function StatsHeader({ xp, level, loginStreak }: Props) {
    const nextLevelXp = useMemo(() => level * 1000, [level]);
    const progress = useMemo(() => (xp / nextLevelXp) * 100, [xp, nextLevelXp]);

    return (
        <View style={styles.container}>
            {/* Level Badge */}
            <View style={styles.levelBadge}>
                <Text style={styles.levelLabel}>LVL</Text>
                <Text style={styles.levelValue}>{level}</Text>
            </View>

            {/* XP Progress */}
            <View style={styles.xpContainer}>
                <View style={styles.xpHeader}>
                    <Text style={styles.xpLabel}>EXPERIENCE</Text>
                    <Text style={styles.xpText}>
                        {xp.toLocaleString()} / {nextLevelXp.toLocaleString()}
                    </Text>
                </View>
                <View style={styles.xpBarContainer}>
                    <View style={styles.xpBarBg}>
                        <View style={[styles.xpBarFill, { width: `${Math.min(100, progress)}%` }]} />
                    </View>
                </View>
            </View>

            {/* Streak Badge */}
            {loginStreak > 0 && (
                <View style={styles.streakBadge}>
                    <Text style={styles.streakIcon}>🔥</Text>
                    <Text style={styles.streakValue}>{loginStreak}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        gap: SPACING.lg,
    },
    levelBadge: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    levelLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: COLORS.background,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    levelValue: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.background,
        fontFamily: FONTS.bold,
    },
    xpContainer: {
        flex: 1,
        gap: SPACING.sm,
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    xpLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textTertiary,
        fontFamily: FONTS.bold,
        letterSpacing: 1,
    },
    xpText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        fontFamily: FONTS.semibold,
    },
    xpBarContainer: {
        height: 6,
    },
    xpBarBg: {
        height: '100%',
        backgroundColor: COLORS.borderLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    xpBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.warningDim,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 8,
        gap: 6,
        borderWidth: 1,
        borderColor: COLORS.warning + '40',
    },
    streakIcon: {
        fontSize: 18,
    },
    streakValue: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.warning,
        fontFamily: FONTS.bold,
    },
});
