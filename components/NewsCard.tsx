import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { TrendingUp, TrendingDown, Clock, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { NewsEvent } from '../types';
import { HapticPatterns } from '../utils/haptics';

interface NewsCardProps {
    news: NewsEvent;
    onDismiss: () => void;
    onPress?: () => void;
    onQuickTrade?: (action: 'BUY' | 'SELL') => void;
}

// Background images for different news types
const NEWS_BACKGROUNDS = {
    chart: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80', // Stock chart
    tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', // Tech/AI
    phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', // Phone/Android
    market: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80', // Bull market
    finance: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80', // Finance
};

const NewsCardComponent: React.FC<NewsCardProps> = ({ news, onDismiss, onPress }) => {
    const getImpactColor = () => {
        if (news.impact > 0) return COLORS.positive;
        if (news.impact < 0) return COLORS.negative;
        return COLORS.textSub;
    };

    const getSuggestionColor = (suggestion: string) => {
        switch (suggestion) {
            case 'BUY': return COLORS.positive;
            case 'SELL': return COLORS.negative;
            case 'HOLD': return COLORS.warning;
            default: return COLORS.textSub;
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

    // Select background based on news content
    const getBackgroundImage = () => {
        if (news.symbol === 'NVDA' || news.headline.includes('AI') || news.headline.includes('chip')) {
            return NEWS_BACKGROUNDS.tech;
        }
        if (news.headline.includes('Android') || news.headline.includes('phone')) {
            return NEWS_BACKGROUNDS.phone;
        }
        if (news.headline.includes('market') || news.headline.includes('S&P')) {
            return NEWS_BACKGROUNDS.market;
        }
        if (news.headline.includes('Inflation') || news.type === 'ECONOMIC') {
            return NEWS_BACKGROUNDS.chart;
        }
        return NEWS_BACKGROUNDS.finance;
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                HapticPatterns.light();
                onPress?.();
            }}
            activeOpacity={0.9}
        >
            <ImageBackground
                source={{ uri: getBackgroundImage() }}
                style={styles.backgroundImage}
                imageStyle={styles.backgroundImageStyle}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                >
                    {/* Header Row */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            {news.symbol && (
                                <View style={styles.symbolBadge}>
                                    <Text style={styles.symbolText}>{news.symbol}</Text>
                                </View>
                            )}
                            <View style={styles.timeContainer}>
                                <Clock size={12} color={COLORS.textMuted} />
                                <Text style={styles.timeText}>{formatTimeAgo(news.timestamp)}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                HapticPatterns.light();
                                onDismiss();
                            }}
                            style={styles.closeButton}
                        >
                            <X size={18} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Headline */}
                    <Text style={styles.headline} numberOfLines={3}>
                        {news.headline}
                    </Text>

                    {/* Footer Row */}
                    <View style={styles.footer}>
                        <View style={[styles.impactBadge, { backgroundColor: `${getImpactColor()}30` }]}>
                            {news.impact > 0 ? (
                                <TrendingUp size={14} color={getImpactColor()} strokeWidth={2.5} />
                            ) : (
                                <TrendingDown size={14} color={getImpactColor()} strokeWidth={2.5} />
                            )}
                            <Text style={[styles.impactText, { color: getImpactColor() }]}>
                                {news.impact > 0 ? '+' : ''}{(news.impact * 100).toFixed(1)}%
                            </Text>
                        </View>

                        {news.suggestion && (
                            <View style={[styles.suggestionBadge, {
                                backgroundColor: `${getSuggestionColor(news.suggestion)}30`,
                                borderColor: getSuggestionColor(news.suggestion),
                            }]}>
                                <Text style={[styles.suggestionText, {
                                    color: getSuggestionColor(news.suggestion)
                                }]}>
                                    {news.suggestion}
                                </Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
};

// Memoize with custom comparison to prevent image reloads
export const NewsCard = memo(NewsCardComponent, (prevProps, nextProps) => {
    return (
        prevProps.news.id === nextProps.news.id &&
        prevProps.news.headline === nextProps.news.headline &&
        prevProps.news.timestamp === nextProps.news.timestamp
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
        marginHorizontal: SPACING.lg,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        height: 160,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    backgroundImageStyle: {
        borderRadius: RADIUS.xl,
    },
    gradient: {
        flex: 1,
        padding: SPACING.md,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    symbolBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
        backgroundColor: `${COLORS.accent}40`,
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    symbolText: {
        fontSize: 11,
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
        fontSize: 11,
        fontFamily: FONTS.regular,
        color: COLORS.textMuted,
    },
    closeButton: {
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: RADIUS.sm,
    },
    headline: {
        fontSize: 16,
        fontFamily: FONTS.semibold,
        color: COLORS.text,
        lineHeight: 22,
        flex: 1,
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
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    impactText: {
        fontSize: 13,
        fontFamily: FONTS.bold,
    },
    suggestionBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
    },
    suggestionText: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
});
