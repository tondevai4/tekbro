import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SectionList, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Achievement } from '../types';
import { AchievementGrid } from './AchievementGrid';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { X, Trophy, ChevronRight } from 'lucide-react-native';
import { AchievementCardSkeleton } from './LoadingSkeleton';
import { AchievementDetailModal } from './AchievementDetailModal';
import * as Haptics from 'expo-haptics';

interface Props {
    achievements: Achievement[];
}

const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
};

export const AchievementsSection = React.memo(function AchievementsSection({ achievements }: Props) {
    const [viewAllVisible, setViewAllVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Wealth', 'Trading', 'Mastery', 'Risk', 'Secret'];

    const filteredAchievements = React.useMemo(() => {
        if (selectedCategory === 'All') return achievements;
        return achievements.filter(a => a.category === selectedCategory);
    }, [achievements, selectedCategory]);

    const handleAchievementPress = useCallback((achievement: Achievement) => {
        setSelectedAchievement(achievement);
        setDetailModalVisible(true);
    }, []);

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;

    // Group by Tier
    const sections = React.useMemo(() => [
        {
            title: 'Gold Tier 🏆',
            data: filteredAchievements.filter(a => a.tier === 'gold'),
            color: '#FFD700'
        },
        {
            title: 'Silver Tier 🥈',
            data: filteredAchievements.filter(a => a.tier === 'silver'),
            color: '#C0C0C0'
        },
        {
            title: 'Bronze Tier 🥉',
            data: filteredAchievements.filter(a => a.tier === 'bronze'),
            color: '#CD7F32'
        }
    ], [filteredAchievements]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>Achievements</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unlockedCount}/{totalCount}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => setViewAllVisible(true)}
                    style={styles.seeAllButton}
                >
                    <Text style={styles.seeAll}>View All</Text>
                    <ChevronRight size={16} color={COLORS.accent} />
                </TouchableOpacity>
            </View>

            {/* Grid Preview */}
            {achievements.length === 0 ? (
                <View style={{ flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.lg }}>
                    <AchievementCardSkeleton />
                    <AchievementCardSkeleton />
                    <AchievementCardSkeleton />
                </View>
            ) : (
                <AchievementGrid
                    achievements={achievements}
                    onAchievementPress={handleAchievementPress}
                />
            )}

            {/* View All Modal */}
            <Modal
                visible={viewAllVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setViewAllVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.headerTop}>
                            <View style={styles.modalTitleContainer}>
                                <View style={styles.trophyIcon}>
                                    <Trophy size={24} color="#FFD700" />
                                </View>
                                <View>
                                    <Text style={styles.modalTitle}>Achievements</Text>
                                    <Text style={styles.modalSubtitle}>
                                        {unlockedCount} of {totalCount} unlocked
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setViewAllVisible(false)}
                                style={styles.closeButton}
                            >
                                <X size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.totalProgressContainer}>
                            <View style={styles.totalProgressBar}>
                                <LinearGradient
                                    colors={[COLORS.accent, '#4F46E5']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        styles.totalProgressFill,
                                        { width: `${(unlockedCount / totalCount) * 100}%` }
                                    ]}
                                />
                            </View>
                        </View>

                        {/* Category Filters */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterContainer}
                            style={styles.filterScroll}
                        >
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setSelectedCategory(cat);
                                    }}
                                    style={[
                                        styles.filterPill,
                                        selectedCategory === cat && styles.filterPillActive
                                    ]}
                                >
                                    {selectedCategory === cat && (
                                        <LinearGradient
                                            colors={[COLORS.accent, '#4F46E5']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={StyleSheet.absoluteFillObject}
                                        />
                                    )}
                                    <Text style={[
                                        styles.filterText,
                                        selectedCategory === cat && styles.filterTextActive
                                    ]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        stickySectionHeadersEnabled={false}
                        renderSectionHeader={({ section: { title, color, data } }) => (
                            data.length > 0 ? (
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionHeaderText, { color }]}>{title}</Text>
                                </View>
                            ) : null
                        )}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.card, !item.unlocked && styles.cardLocked]}
                                onPress={() => handleAchievementPress(item)}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={item.unlocked
                                        ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']
                                        : ['rgba(255,255,255,0.02)', 'transparent']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={StyleSheet.absoluteFillObject}
                                />

                                <View style={[styles.iconContainer, !item.unlocked && styles.iconLocked]}>
                                    <Text style={styles.icon}>{item.icon}</Text>
                                </View>

                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeaderRow}>
                                        <Text style={[styles.cardTitle, !item.unlocked && styles.textLocked]}>
                                            {item.title}
                                        </Text>
                                        {item.unlocked && (
                                            <View style={styles.xpBadge}>
                                                <Text style={styles.xpText}>+{item.xpReward} XP</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={[styles.cardDesc, !item.unlocked && styles.textLocked]}>
                                        {item.description}
                                    </Text>

                                    {!item.unlocked && (
                                        <View style={styles.progressContainer}>
                                            <View style={styles.progressBar}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        { width: `${Math.min(100, ((item.progress ?? 0) / (item.target ?? 1)) * 100)}%` }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.progressText}>
                                                {formatNumber(item.progress ?? 0)} / {formatNumber(item.target ?? 0)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>

            <AchievementDetailModal
                visible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                achievement={selectedAchievement}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        fontFamily: FONTS.semibold,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.accent,
        fontFamily: FONTS.semibold,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#0F172A', // Deep dark blue/slate
    },
    modalHeader: {
        padding: SPACING.lg,
        paddingTop: SPACING.xl,
        backgroundColor: 'rgba(30, 41, 59, 0.8)', // Semi-transparent slate
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    trophyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
    },
    closeButton: {
        padding: SPACING.sm,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    totalProgressContainer: {
        marginTop: SPACING.xs,
        marginBottom: SPACING.lg,
    },
    totalProgressBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    totalProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 40,
        gap: SPACING.md,
    },
    sectionHeader: {
        paddingVertical: SPACING.md,
        marginTop: SPACING.sm,
    },
    sectionHeaderText: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: SPACING.md,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
    },
    cardLocked: {
        opacity: 0.8,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLocked: {
        opacity: 0.3,
    },
    icon: {
        fontSize: 24,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        fontFamily: FONTS.semibold,
    },
    textLocked: {
        color: COLORS.textMuted,
    },
    cardDesc: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        marginBottom: 8,
        lineHeight: 18,
    },
    xpBadge: {
        backgroundColor: 'rgba(79, 70, 229, 0.2)', // Indigo tint
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.4)',
    },
    xpText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#818CF8', // Indigo-400
        fontFamily: FONTS.bold,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.textMuted,
    },
    progressText: {
        fontSize: 11,
        color: COLORS.textMuted,
        fontFamily: FONTS.medium,
        minWidth: 60,
        textAlign: 'right',
    },
    filterScroll: {
        marginBottom: SPACING.xs,
    },
    filterContainer: {
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    filterPillActive: {
        borderColor: COLORS.accent,
    },
    filterText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
    },
    filterTextActive: {
        color: '#FFF',
        fontWeight: '700',
        fontFamily: FONTS.bold,
    },
});
