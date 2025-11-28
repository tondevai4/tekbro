import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

interface AppBackgroundProps {
    children: React.ReactNode;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ children }) => {
    const { currentTheme, theme } = useTheme();

    const getGradientColors = (): [string, string, string] => {
        switch (currentTheme) {
            case 'ocean':
                return ['#020617', '#0F172A', '#1E293B'];
            case 'sunset':
                return ['#180818', '#240A24', '#301030'];
            case 'forest':
                return ['#020A05', '#05140A', '#0A2112'];
            case 'midnight':
            default:
                return ['#000000', '#050A14', '#0A1525'];
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <LinearGradient
                colors={getGradientColors()}
                locations={[0, 0.6, 1]}
                style={styles.background}
            />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    }
});
