import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, Clock, X } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { NewsEvent } from '../types';
import { HapticPatterns } from '../utils/haptics';

interface NewsCardProps {
    news: NewsEvent;
    onDismiss: () => void;
    onPress?: () => void;
    onQuickTrade?: (action: 'BUY' | 'SELL') => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onDismiss, onPress }) => {
    const getImpactColor = () => {
        if (news.impact > 0) return COLORS.positive;
        if (news.impact < 0) return COLORS.negative;
        return COLORS.textSub;
    };

    const getSeverityColor = () => {
        switch (news.severity) {
            case 'HIGH': return COLORS.warning;
            case 'MEDIUM': return COLORS.accent;
            case 'LOW': return COLORS.textSub;
            default: return COLORS.accent;
        }
    };

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    HapticPatterns.light();
                    onPress?.();
                }}
                activeOpacity={0.9}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {news.symbol && (
                            <View style={[styles.symbolBadge, { borderColor: getSeverityColor() }]}>
                                <Text style={styles.symbolText}>{news.symbol}</Text>
                            </View>
                        )}
                        <View style={styles.timeContainer}>
                            <Clock size={12} color={COLORS.textMuted} />
                            <Text style={styles.timeText}>{formatTimeAgo(news.timestamp)}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            HapticPatterns.light();
                            onDismiss();
                        }}
                        style={styles.closeButton}
                    >
                        <X size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Headline */}
                <Text style={styles.headline} numberOfLines={3}>
                    {news.headline}
                </Text>

                {/* Impact Indicator */}
                <View style={styles.footer}>
                    <View style={[styles.impactBadge, { backgroundColor: `${getImpactColor()}20` }]}>
                        {news.impact > 0 ? (
                            <TrendingUp size={16} color={getImpactColor()} strokeWidth={2.5} />
                        ) : (
                            <TrendingDown size={16} color={getImpactColor()} strokeWidth={2.5} />
                        )}
                        <Text style={[styles.impactText, { color: getImpactColor() }]}>
                            {news.impact > 0 ? '+' : ''}{(news.impact * 100).toFixed(1)}%
                        </Text>
                    </View>

                    {news.suggestion && (
                        <View style={[styles.suggestionBadge, {
                            backgroundColor: news.suggestion === 'BUY' ? `${COLORS.positive}20` :
                                news.suggestion === 'SELL' ? `${COLORS.negative}20` :
                                    `${COLORS.textSub}20`
                        }]}>
                            <Text style={[styles.suggestionText, {
                                color: news.suggestion === 'BUY' ? COLORS.positive :
                                    news.suggestion === 'SELL' ? COLORS.negative :
                                        COLORS.textSub
                            }]}>
                                {news.suggestion}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    card: {
        padding: SPACING.lg,
        backgroundColor: COLORS.bgElevated,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    symbolBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
        borderWidth: 1.5,
    },
    symbolText: {
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.bold,
        color: COLORS.accent,
        letterSpacing: 0.5,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.regular,
        color: COLORS.textMuted,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    headline: {
        fontSize: FONTS.sizes.md,
        fontFamily: FONTS.semibold,
        color: COLORS.text,
        lineHeight: 22,
        marginBottom: SPACING.md,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    impactBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
    },
    impactText: {
        fontSize: FONTS.sizes.sm,
        fontFamily: FONTS.bold,
    },
    suggestionBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
    },
    suggestionText: {
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
});
