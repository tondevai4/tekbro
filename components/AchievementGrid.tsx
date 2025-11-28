import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Achievement } from '../types';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 150;
const CARD_GAP = SPACING.md;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

interface Props {
    achievements: Achievement[];
    onAchievementPress?: (achievement: Achievement) => void;
}

export function AchievementGrid({ achievements, onAchievementPress }: Props) {
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'gold': return '#FFD700';
            case 'silver': return '#C0C0C0';
            case 'bronze': return '#CD7F32';
            default: return COLORS.textMuted;
        }
    };

    const handlePress = (achievement: Achievement) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onAchievementPress) {
            onAchievementPress(achievement);
        }
    };

    const renderItem = ({ item, index }: { item: Achievement; index: number }) => {
        const isUnlocked = item.unlocked;
        const tierColor = getTierColor(item.tier || 'bronze');

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.card, !isUnlocked && styles.cardLocked]}
                onPress={() => handlePress(item)}
                activeOpacity={0.8}
            >
                {/* Background Gradient */}
                <LinearGradient
                    colors={isUnlocked
                        ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']
                        : ['rgba(255,255,255,0.03)', 'rgba(0,0,0,0.2)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Glow Effect for Unlocked */}
                {isUnlocked && (
                    <LinearGradient
                        colors={[tierColor, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[StyleSheet.absoluteFillObject, { opacity: 0.15 }]}
                    />
                )}

                {/* Tier Indicator Dot */}
                <View style={[styles.tierDot, { backgroundColor: tierColor, shadowColor: tierColor }]} />

                {/* Icon */}
                <View style={[
                    styles.iconContainer,
                    !isUnlocked && styles.iconLocked,
                    isUnlocked && { backgroundColor: `${tierColor}20`, borderColor: `${tierColor}40`, borderWidth: 1 }
                ]}>
                    <Text style={styles.icon}>{item.icon}</Text>
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    <Text style={[styles.title, !isUnlocked && styles.textLocked]} numberOfLines={1}>
                        {item.title}
                    </Text>

                    <Text style={[styles.description, !isUnlocked && styles.textLocked]} numberOfLines={2}>
                        {item.description}
                    </Text>

                    {/* Footer: Progress or Reward */}
                    <View style={styles.footer}>
                        {!isUnlocked ? (
                            <View style={styles.progressWrapper}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${Math.min(100, ((item.progress ?? 0) / (item.target ?? 1)) * 100)}%`,
                                                backgroundColor: tierColor
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    {(item.progress ?? 0).toFixed(0)}/{item.target ?? 0}
                                </Text>
                            </View>
                        ) : (
                            <View style={[styles.rewardBadge, { borderColor: `${tierColor}40`, backgroundColor: `${tierColor}10` }]}>
                                <Text style={[styles.rewardText, { color: tierColor }]}>
                                    +{item.xpReward ?? 0} XP
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={achievements}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.grid}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.xl,
    },
    grid: {
        paddingHorizontal: SPACING.lg,
    },
    card: {
        width: CARD_WIDTH,
        height: 180,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        justifyContent: 'space-between',
    },
    cardLocked: {
        borderColor: 'rgba(255,255,255,0.05)',
    },
    tierDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 6,
        height: 6,
        borderRadius: 3,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    iconLocked: {
        opacity: 0.4,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    icon: {
        fontSize: 22,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    description: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
        lineHeight: 15,
        opacity: 0.8,
    },
    textLocked: {
        opacity: 0.5,
    },
    footer: {
        marginTop: 'auto',
        paddingTop: SPACING.sm,
    },
    progressWrapper: {
        gap: 4,
    },
    progressBar: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 1.5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 1.5,
    },
    progressText: {
        fontSize: 10,
        color: COLORS.textMuted,
        fontFamily: FONTS.medium,
        textAlign: 'right',
    },
    rewardBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: RADIUS.sm,
        alignSelf: 'flex-start',
        borderWidth: 1,
    },
    rewardText: {
        fontSize: 10,
        fontWeight: '700',
        fontFamily: FONTS.bold,
    },
});
