import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, SPACING } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface Props {
    title: string;
    rightComponent?: React.ReactNode;
}

export function Header({ title, rightComponent }: Props) {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
            {rightComponent && <View style={styles.right}>{rightComponent}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
    },
    title: {
        flex: 1,
        fontSize: 28,
        fontWeight: '800',
        fontFamily: FONTS.bold,
        letterSpacing: -0.5,
        marginRight: SPACING.md,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
});
