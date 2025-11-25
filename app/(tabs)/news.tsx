import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '../../components/Header';
import { NewsFeed } from '../../components/NewsFeed';
import { COLORS } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { generateNewsEvent } from '../../utils/NewsEngine';
import { NewsEvent } from '../../types';

const NEWS_REFRESH_INTERVAL = 3 * 60 * 1000; // 3 minutes
const NEWS_BATCH_SIZE = 4; // Generate 4 news items per refresh

export default function NewsScreen() {
    const { stocks } = useStore();
    const [newsHistory, setNewsHistory] = useState<NewsEvent[]>([]);

    const generateNewsBatch = useCallback(() => {
        const newNews: NewsEvent[] = [];

        for (let i = 0; i < NEWS_BATCH_SIZE; i++) {
            const news = generateNewsEvent(stocks);
            if (news) {
                newNews.push(news);
            }
        }

        // Replace old news with new batch (don't accumulate)
        setNewsHistory(newNews);
    }, [stocks]);

    // Auto-refresh every 3 minutes
    useEffect(() => {
        // Generate initial batch
        generateNewsBatch();

        // Set up interval for auto-refresh
        const interval = setInterval(() => {
            generateNewsBatch();
        }, NEWS_REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [generateNewsBatch]);

    const handleDismissNews = useCallback((newsId: string) => {
        setNewsHistory(prev => prev.filter(n => n.id !== newsId));
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="light" />

            <Header
                title="News Feed"
                rightComponent={null}
            />

            <View style={styles.content}>
                <NewsFeed
                    news={newsHistory}
                    onDismissNews={handleDismissNews}
                    refreshing={false}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    content: {
        flex: 1,
    },
});
