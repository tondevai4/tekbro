import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../../store/useStore';
import { GlassCard } from '../../components/GlassCard';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { GRADIENTS } from '../../constants/gradients';
import { LeaderboardEntry } from '../../types';

// Mock Data Generator
const generateMockLeaderboard = (userEquity: number, username: string, userLevel: number, userAchievements: number): LeaderboardEntry[] => {
    const bots = [
        { id: '1', username: 'Warren B.', equity: 1500000000, level: 99, achievementsUnlocked: 48 },
        { id: '2', username: 'Elon M.', equity: 850000000, level: 85, achievementsUnlocked: 42 },
        { id: '3', username: 'Nancy P.', equity: 520000000, level: 78, achievementsUnlocked: 39 },
        { id: '4', username: 'RoaringKitty', equity: 280000000, level: 65, achievementsUnlocked: 30 },
        { id: '5', username: 'Satoshi', equity: 150000000, level: 60, achievementsUnlocked: 25 },
        { id: '6', username: 'WolfOfWallSt', equity: 95000000, level: 55, achievementsUnlocked: 20 },
        { id: '7', username: 'DiamondHands', equity: 75000000, level: 45, achievementsUnlocked: 15 },
        { id: '8', username: 'ApeStrong', equity: 60000000, level: 35, achievementsUnlocked: 10 },
        { id: '9', username: 'PaperHands', equity: 1200000, level: 5, achievementsUnlocked: 1 },
    ];

    const userEntry: LeaderboardEntry = {
        id: 'user',
        username: username || 'You',
        equity: userEquity,
        level: userLevel,
        achievementsUnlocked: userAchievements,
        isUser: true,
    };

    const allEntries = [...bots, userEntry].sort((a, b) => b.equity - a.equity);

    return allEntries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
    }));
};

export default function LeaderboardScreen() {
    const { cash, holdings, stocks, username, level, achievements } = useStore();
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const calculateTotalEquity = () => {
        const portfolioValue = Object.values(holdings).reduce((total, item) => {
            const stock = stocks.find(s => s.symbol === item.symbol);
            if (!stock || !stock.price) return total;
            return total + (item.quantity * stock.price);
        }, 0);
        return cash + portfolioValue;
    };

    const loadData = () => {
        const equity = calculateTotalEquity();
        const unlockedCount = achievements.filter(a => a.unlocked).length;
        const data = generateMockLeaderboard(equity, username, level, unlockedCount);
        setLeaderboardData(data);
    };

    useEffect(() => {
        loadData();
    }, [cash, holdings, stocks]);

    const onRefresh = () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => {
            loadData();
            setRefreshing(false);
        }, 1000);
    };

    const userRank = leaderboardData.find(e => e.isUser);

    const getRankGradient = (rank: number) => {
        if (rank === 1) return GRADIENTS.gold;
        if (rank === 2) return GRADIENTS.silver;
        if (rank === 3) return GRADIENTS.bronze;
        return GRADIENTS.glass;
    };

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '👑';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '🏅';
    };

    const renderItem = ({ item }: { item: LeaderboardEntry }) => {
        const isTop3 = item.rank && item.rank <= 3;
        const gradient = getRankGradient(item.rank || 0);
        const emoji = getRankEmoji(item.rank || 0);

        return (
            <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.rankCard, item.isUser && styles.userCard]}
            >
                {/* Rank Badge */}
                <View style={styles.rankBadge}>
                    <Text style={styles.rankEmoji}>{emoji}</Text>
                    <Text style={[styles.rankNumber, isTop3 ? styles.rankNumberTop3 : undefined]}>#{item.rank}</Text>
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                    <Text style={[styles.username, isTop3 ? styles.usernameTop3 : undefined]} numberOfLines={1}>
                        {item.username} {item.isUser && '(You)'}
                    </Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.statText}>Lvl {item.level}</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.statText}>{item.achievementsUnlocked} 🏆</Text>
                    </View>
                </View>

                {/* Equity */}
                <View style={styles.equitySection}>
                    <Text style={[styles.equity, isTop3 ? styles.equityTop3 : undefined]}>
                        £{item.equity.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                    </Text>
                </View>
            </LinearGradient>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <Trophy size={28} color={COLORS.warning} />
            </View>

            {/* User Rank Highlight */}
            {userRank && (
                <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.userRankCard}
                >
                    <Text style={styles.userRankLabel}>Your Rank</Text>
                    <View style={styles.userRankRow}>
                        <Text style={styles.userRankEmoji}>🏆</Text>
                        <Text style={styles.userRankNumber}>#{userRank.rank}</Text>
                        <View style={{ flex: 1 }} />
                        <Text style={styles.userRankEquity}>
                            £{userRank.equity.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                        </Text>
                    </View>
                </LinearGradient>
            )}

            {/* Leaderboard List */}
            <FlatList
                data={leaderboardData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.accent}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    userRankCard: {
        marginHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
    },
    userRankLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(0,0,0,0.7)',
        fontFamily: FONTS.semibold,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
    },
    userRankRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userRankEmoji: {
        fontSize: 32,
        marginRight: SPACING.sm,
    },
    userRankNumber: {
        fontSize: 32,
        fontWeight: '800',
        color: '#000',
        fontFamily: FONTS.bold,
    },
    userRankEquity: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        fontFamily: FONTS.bold,
    },
    listContent: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xxl,
        gap: SPACING.md,
    },
    rankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    userCard: {
        borderColor: COLORS.accent,
        borderWidth: 2,
    },
    rankBadge: {
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    rankEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    rankNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSub,
        fontFamily: FONTS.bold,
    },
    rankNumberTop3: {
        color: '#000',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        fontFamily: FONTS.semibold,
        marginBottom: 4,
    },
    usernameTop3: {
        color: '#000',
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 12,
        color: COLORS.textSub,
        fontFamily: FONTS.regular,
    },
    dot: {
        fontSize: 12,
        color: COLORS.textSub,
        marginHorizontal: 4,
    },
    equitySection: {
        alignItems: 'flex-end',
    },
    equity: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    equityTop3: {
        color: '#000',
        fontSize: 20,
    },
});
