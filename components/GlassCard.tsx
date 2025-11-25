import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RADIUS, SPACING } from '../constants/theme';

interface GlassCardProps {
    children: ReactNode;
    style?: ViewStyle;
    gradient?: readonly string[];
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    gradient = ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
}) => {
    return (
        <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.glassCard, style]}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    glassCard: {
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});
