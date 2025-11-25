import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { NewsEvent } from '../types';
import { TrendingUp, TrendingDown, X } from 'lucide-react-native';

interface NewsToastProps {
    news: NewsEvent;
    onDismiss: () => void;
    onPress?: () => void;
}

export const NewsToast: React.FC<NewsToastProps> = ({ news, onDismiss, onPress }) => {
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Slide in
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            })
        ]).start();

        // Auto dismiss after 8 seconds
        const timer = setTimeout(() => {
            dismissToast();
        }, 8000);

        return () => clearTimeout(timer);
    }, []);

    const dismissToast = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            })
        ]).start(() => onDismiss());
    };

    const getSeverityColor = () => {
        switch (news.severity) {
            case 'HIGH': return COLORS.warning;
            case 'MEDIUM': return COLORS.accent;
            case 'LOW': return COLORS.textSub;
            default: return COLORS.accent;
        }
    };

    const getSuggestionText = () => {
        if (!news.suggestion) return null;
        const color = news.suggestion === 'BUY' ? COLORS.positive :
            news.suggestion === 'SELL' ? COLORS.negative :
                COLORS.textSub;
        return (
            <Text style={[styles.suggestion, { color }]}>
                {news.suggestion === 'BUY' && '📈 Consider buying'}
                {news.suggestion === 'SELL' && '📉 Consider selling'}
                {news.suggestion === 'HOLD' && '⏸️ Monitor closely'}
            </Text>
        );
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    top: Math.max(insets.top, 20) + 10,
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim
                }
            ]}
        >
            <TouchableOpacity
                style={[styles.content, { borderLeftColor: getSeverityColor() }]}
                onPress={onPress}
                activeOpacity={0.9}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        {news.impact > 0 ? (
                            <TrendingUp size={20} color={COLORS.positive} />
                        ) : (
                            <TrendingDown size={20} color={COLORS.negative} />
                        )}
                    </View>
                    <View style={styles.textContainer}>
                        {news.symbol && (
                            <Text style={styles.symbol}>{news.symbol}</Text>
                        )}
                        <Text style={styles.headline} numberOfLines={2}>{news.headline}</Text>
                        {getSuggestionText()}
                    </View>
                    <TouchableOpacity onPress={dismissToast} style={styles.closeButton}>
                        <X size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: SPACING.md,
        right: SPACING.md,
        zIndex: 99999,
        elevation: 100,
    },
    content: {
        backgroundColor: COLORS.bgElevated,
        borderRadius: RADIUS.lg,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: SPACING.md,
        gap: SPACING.sm,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.bgSubtle,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    symbol: {
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.bold,
        color: COLORS.accent,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headline: {
        fontSize: FONTS.sizes.sm,
        fontFamily: FONTS.medium,
        color: COLORS.text,
        lineHeight: 18,
        marginBottom: 4,
    },
    suggestion: {
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.semibold,
        marginTop: 2,
    },
    closeButton: {
        padding: SPACING.xs,
    }
});
