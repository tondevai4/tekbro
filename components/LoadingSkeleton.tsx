import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = RADIUS.sm,
    style
}) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const StockCardSkeleton: React.FC = () => {
    return (
        <View style={styles.stockCard}>
            <View style={styles.stockCardLeft}>
                <Skeleton width={48} height={48} borderRadius={RADIUS.md} />
                <View style={styles.stockCardInfo}>
                    <Skeleton width={60} height={16} />
                    <Skeleton width={100} height={12} style={{ marginTop: 6 }} />
                </View>
            </View>
            <View style={styles.stockCardRight}>
                <Skeleton width={70} height={16} />
                <Skeleton width={50} height={12} style={{ marginTop: 6 }} />
            </View>
        </View>
    );
};

export const StatsHeaderSkeleton: React.FC = () => {
    return (
        <View style={styles.statsHeader}>
            <Skeleton width={56} height={56} borderRadius={12} />
            <View style={styles.statsHeaderContent}>
                <View style={styles.statsHeaderRow}>
                    <Skeleton width={80} height={10} />
                    <Skeleton width={100} height={12} />
                </View>
                <Skeleton width="100%" height={6} borderRadius={3} style={{ marginTop: 8 }} />
            </View>
            <Skeleton width={60} height={40} borderRadius={8} />
        </View>
    );
};

export const AchievementCardSkeleton: React.FC = () => {
    return (
        <View style={styles.achievementCard}>
            <Skeleton width={40} height={40} borderRadius={RADIUS.md} />
            <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
            <Skeleton width="80%" height={10} style={{ marginTop: 4 }} />
            <Skeleton width="100%" height={6} borderRadius={3} style={{ marginTop: 8 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: COLORS.border,
    },
    stockCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    stockCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    stockCardInfo: {
        marginLeft: SPACING.md,
    },
    stockCardRight: {
        alignItems: 'flex-end',
    },
    statsHeader: {
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
    statsHeaderContent: {
        flex: 1,
    },
    statsHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    achievementCard: {
        backgroundColor: COLORS.card,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
});
