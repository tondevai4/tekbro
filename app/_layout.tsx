import { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMarketEngine } from '../hooks/useMarketEngine';
import { useStore } from '../store/useStore';
import { NewsToast } from '../components/NewsToast';
import { LevelUpModal } from '../components/LevelUpModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { COLORS } from '../constants/theme';
import { analytics } from '../utils/analytics';

export default function RootLayout() {
    const router = useRouter();
    const segments = useSegments();
    const [isReady, setIsReady] = useState(false);

    // Run market engine globally
    useMarketEngine();

    const { activeNews, setActiveNews, checkLoginStreak, syncAchievements, level } = useStore();
    const [showLevelUp, setShowLevelUp] = useState(false);
    const prevLevelRef = useRef(level);

    useEffect(() => {
        if (level > prevLevelRef.current) {
            setShowLevelUp(true);
        }
        prevLevelRef.current = level;
    }, [level]);

    useEffect(() => {
        async function checkOnboarding() {
            try {
                // Initialize analytics
                analytics.init();
                analytics.trackAppOpened();

                // Initialize gamification
                checkLoginStreak();
                syncAchievements();

                const completed = await AsyncStorage.getItem('onboarding_completed');

                if (!completed && segments[0] !== 'onboarding') {
                    router.replace('/onboarding');
                }
            } catch (error) {
                console.error('Error checking onboarding:', error);
                analytics.trackError(error as Error, { context: 'onboarding_check' });
            } finally {
                setIsReady(true);
            }
        }

        checkOnboarding();
    }, []);

    if (!isReady) {
        return null;
    }

    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <StatusBar style="light" backgroundColor={COLORS.bg} />
                <View style={{ flex: 1 }}>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: COLORS.bg },
                            animation: 'slide_from_right',
                        }}
                    >
                        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen
                            name="stock/[id]"
                            options={{
                                presentation: 'modal',
                                headerShown: false
                            }}
                        />
                    </Stack>
                    {activeNews && (
                        <NewsToast
                            news={activeNews}
                            onDismiss={() => setActiveNews(null)}
                        />
                    )}
                    <LevelUpModal
                        visible={showLevelUp}
                        level={level}
                        onClose={() => setShowLevelUp(false)}
                    />
                </View>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}
