import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Zap, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { Crypto } from '../types';
import { useCryptoStore } from '../store/useCryptoStore';
import { HapticPatterns } from '../utils/haptics';
import { MiniChart } from './MiniChart';

interface CryptoCardProps {
    crypto: Crypto;
}

const CryptoCardComponent: React.FC<CryptoCardProps> = ({ crypto }) => {
    const router = useRouter();
    // OPTIMIZATION: Select only what we need
    // Note: We might want a separate watchlist for crypto later, or use the same one
    // For now, let's assume we might add crypto watchlist support later
    const isWatchlisted = false;

    // Animation for press effect
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Calculate price change from SESSION OPEN (not basePrice!)
    const priceChange = crypto.price - crypto.openPrice;
    const changePercent = (priceChange / crypto.openPrice) * 100;

    const isPositive = priceChange >= 0;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            tension: 400,
            friction: 15,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 400,
            friction: 15,
            useNativeDriver: true,
        }).start();
    };

    const getGradientColors = (): [string, string] => {
        // Crypto Style: Deep Purple/Indigo/Violet
        if (isPositive) {
            return ['rgba(74, 0, 224, 0.8)', 'rgba(142, 45, 226, 0.4)']; // Purple/Violet
        } else {
            return ['rgba(224, 0, 74, 0.8)', 'rgba(226, 45, 100, 0.4)']; // Pink/Red
        }
    };

    const getBorderColor = () => {
        if (isPositive) return '#8E2DE2'; // Violet
        return '#FF4444'; // Red
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                onPress={() => router.push(`/crypto/${crypto.symbol}`)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <LinearGradient
                    colors={getGradientColors()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, { borderColor: getBorderColor() }]}
                >
                    <View style={styles.cardContent}>
                        {/* Left: Logo & Rank */}
                        <View style={styles.leftSection}>
                            <View style={[styles.iconContainer, { shadowColor: getBorderColor() }]}>
                                {crypto.logo ? (
                                    <Image source={crypto.logo} style={styles.logo} resizeMode="contain" />
                                ) : (
                                    <Text style={styles.iconText}>{crypto.symbol[0]}</Text>
                                )}
                            </View>
                            {/* Volatility Badge */}
                            {Math.abs(changePercent) > 5 && (
                                <View style={styles.badge}>
                                    <Zap size={10} color="#000" fill="#000" />
                                    <Text style={styles.badgeText}>VOLATILE</Text>
                                </View>
                            )}
                        </View>

                        {/* Center: Info & Chart */}
                        <View style={styles.centerSection}>
                            <View style={styles.nameRow}>
                                <Text style={styles.symbol}>{crypto.symbol}</Text>
                            </View>
                            <Text style={styles.companyName} numberOfLines={1}>
                                {crypto.name}
                            </Text>
                            <View style={styles.trendContainer}>
                                {isPositive ? (
                                    <>
                                        <TrendingUp size={14} color="#00FF00" />
                                        <Text style={[styles.trendText, { color: '#00FF00' }]}>Trending Up</Text>
                                    </>
                                ) : (
                                    <>
                                        <TrendingDown size={14} color="#FF4444" />
                                        <Text style={[styles.trendText, { color: '#FF4444' }]}>Trending Down</Text>
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Right: Price & Action */}
                        <View style={styles.rightSection}>
                            <Text style={styles.price}>
                                £{crypto.price.toLocaleString(undefined, {
                                    minimumFractionDigits: crypto.price < 1 ? 4 : 2,
                                    maximumFractionDigits: crypto.price < 1 ? 4 : 2
                                })}
                            </Text>
                            <View style={[styles.changeBadge, { backgroundColor: isPositive ? 'rgba(0,255,255,0.1)' : 'rgba(255,0,0,0.1)' }]}>
                                {isPositive ? <TrendingUp size={12} color="#00FF00" /> : <TrendingDown size={12} color="#FF4444" />}
                                <Text style={[styles.changeText, { color: isPositive ? '#00FF00' : '#FF4444' }]}>
                                    {changePercent.toFixed(2)}%
                                </Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Memoize
export const CryptoCard = memo(CryptoCardComponent, (prevProps, nextProps) => {
    return (
        prevProps.crypto.symbol === nextProps.crypto.symbol &&
        prevProps.crypto.price === nextProps.crypto.price &&
        prevProps.crypto.history.length === nextProps.crypto.history.length
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    card: {
        borderRadius: RADIUS.xl,
        borderWidth: 1.5,
        padding: 0,
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    leftSection: {
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    logo: {
        width: 32,
        height: 32,
    },
    iconText: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: COLORS.white,
    },
    badge: {
        position: 'absolute',
        bottom: -6,
        backgroundColor: '#FFD700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    badgeText: {
        fontSize: 8,
        fontFamily: FONTS.bold,
        color: '#000',
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    symbol: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#FFF',
        letterSpacing: 0.5,
    },
    companyName: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 4,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    trendText: {
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    price: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#FFF',
        marginBottom: 4,
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.md,
        gap: 4,
    },
    changeText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
});
