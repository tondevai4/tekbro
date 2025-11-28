import { Tabs } from 'expo-router';
import { Home, TrendingUp, Settings, Trophy, Zap, Clock } from 'lucide-react-native';
import { View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export default function TabLayout() {
    const { theme } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textSecondary,
                tabBarShowLabel: false, // Remove labels
                tabBarStyle: {
                    backgroundColor: theme.card,
                    borderTopColor: theme.border,
                    height: 80, // Taller for better centering
                    paddingTop: 10,
                },
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarBackground: () => (
                    <View style={{ flex: 1, backgroundColor: theme.card }} />
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Portfolio',
                    tabBarIcon: ({ color, focused }) => (
                        <Home
                            size={24}
                            color={color}
                            style={focused ? { shadowColor: theme.primary, shadowRadius: 10, shadowOpacity: 0.5 } : {}}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="market"
                options={{
                    title: 'Market',
                    tabBarIcon: ({ color, focused }) => (
                        <TrendingUp
                            size={24}
                            color={color}
                            style={focused ? { shadowColor: theme.primary, shadowRadius: 10, shadowOpacity: 0.5 } : {}}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="crypto"
                options={{
                    title: 'Crypto',
                    tabBarIcon: ({ color, focused }) => (
                        <Zap
                            size={24}
                            color={color}
                            style={focused ? { shadowColor: theme.primary, shadowRadius: 10, shadowOpacity: 0.5 } : {}}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="leaderboard"
                options={{
                    title: 'Leaderboard',
                    tabBarIcon: ({ color, focused }) => (
                        <Trophy
                            size={24}
                            color={color}
                            style={focused ? { shadowColor: theme.primary, shadowRadius: 10, shadowOpacity: 0.5 } : {}}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, focused }) => (
                        <Clock
                            size={24}
                            color={color}
                            style={focused ? { shadowColor: theme.primary, shadowRadius: 10, shadowOpacity: 0.5 } : {}}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, focused }) => (
                        <Settings
                            size={24}
                            color={color}
                            style={focused ? { shadowColor: theme.primary, shadowRadius: 10, shadowOpacity: 0.5 } : {}}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
