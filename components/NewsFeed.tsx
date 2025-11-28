import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { NewsCard } from './NewsCard';
import { BreakingNewsAlert } from './BreakingNewsAlert';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { NewsEvent } from '../types';
import { HapticPatterns } from '../utils/haptics';
import { useStore } from '../store/useStore';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface NewsFeedProps {
    news: NewsEvent[];
    onDismissNews: (newsId: string) => void;
    onRefresh?: () => void;
    refreshing?: boolean;
}

export const NewsFeed: React.FC<NewsFeedProps & { disableScroll?: boolean }> = ({
    news,
    onDismissNews,
    onRefresh,
    refreshing = false,
    disableScroll = false
}) => {
    const scrollY = useSharedValue(0);
    const [breakingNews, setBreakingNews] = useState<NewsEvent | null>(null);
    const { buyStock, sellStock, stocks } = useStore();

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const handleQuickTrade = useCallback((newsEvent: NewsEvent, action: 'BUY' | 'SELL') => {
        if (!newsEvent.symbol) return;

        const stock = stocks.find(s => s.symbol === newsEvent.symbol);
        if (!stock) return;

        const quantity = 1; // Quick trade 1 share

        if (action === 'BUY') {
            buyStock(newsEvent.symbol, quantity, stock.price);
        } else {
            sellStock(newsEvent.symbol, quantity, stock.price);
        }

        HapticPatterns.tradeExecuted();
    }, [stocks, buyStock, sellStock]);

    const handleNewsPress = useCallback((newsEvent: NewsEvent) => {
        // Show breaking news alert for HIGH severity
        if (newsEvent.severity === 'HIGH') {
            setBreakingNews(newsEvent);
        }
        // TODO: Navigate to news detail modal
    }, []);

    const handleRefresh = useCallback(() => {
        HapticPatterns.light();
        onRefresh?.();
    }, [onRefresh]);

    const renderNewsCard = useCallback(({ item, index }: { item: NewsEvent; index: number }) => {
        return (
            <Animated.View style={{ paddingHorizontal: SPACING.lg }} key={item.id}>
                <NewsCard
                    news={item}
                    onDismiss={() => onDismissNews(item.id)}
                    onPress={() => handleNewsPress(item)}
                    onQuickTrade={(action) => handleQuickTrade(item, action)}
                />
            </Animated.View>
        );
    }, [onDismissNews, handleNewsPress, handleQuickTrade]);

    const headerStyle = useAnimatedStyle(() => {
        if (disableScroll) return { opacity: 1 };

        const opacity = interpolate(
            scrollY.value,
            [0, 50],
            [1, 0],
            Extrapolate.CLAMP
        );

        return { opacity };
    });

    const renderContent = () => {
        if (disableScroll) {
            return (
                <View style={styles.listContent}>
                    {news.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📭</Text>
                            <Text style={styles.emptyText}>No news yet</Text>
                        </View>
                    ) : (
                        news.map((item, index) => renderNewsCard({ item, index }))
                    )}
                </View>
            );
        }

        return (
            <AnimatedFlatList
                data={news}
                renderItem={renderNewsCard as any}
                keyExtractor={(item: any) => item.id}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyText}>No news yet</Text>
                        <Text style={styles.emptySubtext}>
                            Pull down to refresh
                        </Text>
                    </View>
                }
            />
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <Animated.View style={[styles.header, headerStyle]}>
                <Text style={styles.headerTitle}>📰 News Feed</Text>
                <Text style={styles.headerSubtitle}>
                    {news.length} {news.length === 1 ? 'story' : 'stories'}
                </Text>
            </Animated.View>

            {/* News List */}
            {renderContent()}

            {/* Breaking News Alert */}
            <BreakingNewsAlert
                news={breakingNews}
                onDismiss={() => setBreakingNews(null)}
                onTrade={(action) => {
                    if (breakingNews) {
                        handleQuickTrade(breakingNews, action);
                        setBreakingNews(null);
                    }
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg,
    },
    headerTitle: {
        fontSize: FONTS.sizes.xl,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    headerSubtitle: {
        fontSize: FONTS.sizes.sm,
        fontFamily: FONTS.regular,
        color: COLORS.textSub,
    },
    listContent: {
        paddingBottom: SPACING.xxl,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxxl * 2,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: SPACING.lg,
    },
    emptyText: {
        fontSize: FONTS.sizes.lg,
        fontFamily: FONTS.semibold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    emptySubtext: {
        fontSize: FONTS.sizes.sm,
        fontFamily: FONTS.regular,
        color: COLORS.textSub,
    },
});
