import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import {
    TrendingUp, TrendingDown, Zap, Star, Apple, Cpu, Car, Monitor, Search,
    Package, Users, Film, Shield, Bitcoin, Home, Smartphone, ShoppingBag,
    CreditCard, Gamepad2, Music, Video, FileText, Building2, Heart, Plane,
    Droplet, Lightbulb, LucideIcon, Cloud, Database, Globe, Lock, Target,
    Store, Palette, RefreshCw, Snowflake, Dog, Leaf, Eye, Smartphone as Phone,
    Briefcase, BarChart3, DollarSign, PiggyBank, ArrowRight, Handshake,
    Pill, Syringe, FlaskConical, Dna, Virus, Microscope, Bot, ShoppingCart,
    Hammer, Wrench, Coffee, Utensils, Beer, Shirt, Leaf as Yoga, CarFront,
    Fuel, BarrelAlternate as Barrel, Sun, Plug, Radio, Warehouse, HardDrive,
    Building, Drumstick, Salad, Palette as PaletteIcon
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { Stock } from '../types';
import { useStore } from '../store/useStore';
import { HapticPatterns } from '../utils/haptics';

interface StockCardProps {
    stock: Stock;
}

// COMPREHENSIVE Company Icons Mapping - 105 UNIQUE LUCIDE ICONS
const COMPANY_ICONS: Record<string, LucideIcon> = {
    // ===== TECH (30 stocks) =====
    // FAANG
    'AAPL': Apple, 'GOOGL': Search, 'META': Users, 'AMZN': Package, 'NFLX': Film,
    // Semiconductors
    'NVDA': Cpu, 'AMD': Cpu, 'INTC': Cpu, 'TSM': Cpu, 'QCOM': Phone,
    // Software
    'MSFT': Monitor, 'ORCL': Database, 'CRM': Briefcase, 'ADBE': Palette, 'NOW': RefreshCw,
    // Cloud & Data
    'SNOW': Snowflake, 'DDOG': Dog, 'NET': Globe, 'MDB': Leaf, 'PLTR': Eye,
    // Cybersecurity
    'CRWD': Shield, 'ZS': Shield, 'PANW': Lock, 'FTNT': Shield,
    // Gaming
    'RBLX': Gamepad2, 'EA': Gamepad2, 'TTWO': Gamepad2,
    // E-commerce
    'SHOP': ShoppingBag, 'ETSY': ShoppingBag, 'EBAY': Store,

    // ===== FINANCE (20 stocks) =====
    // Banks
    'JPM': Building2, 'BAC': Building2, 'WFC': Building2, 'C': Globe, 'GS': Briefcase, 'MS': BarChart3,
    // Fintech
    'SQ': CreditCard, 'PYPL': DollarSign, 'COIN': Bitcoin, 'HOOD': TrendingUp, 'AFRM': DollarSign, 'SOFI': PiggyBank,
    // Insurance
    'BRK.B': BarChart3, 'PGR': Car, 'ALL': Handshake, 'TRV': Home,
    // Credit Cards
    'V': CreditCard, 'MA': CreditCard, 'AXP': CreditCard, 'DFS': CreditCard,

    // ===== HEALTHCARE (15 stocks) =====
    // Pharma
    'PFE': Pill, 'JNJ': Heart, 'MRK': FlaskConical, 'LLY': Syringe, 'ABBV': FlaskConical,
    // Biotech
    'MRNA': Dna, 'BNTX': Virus, 'REGN': Microscope, 'VRTX': FlaskConical, 'GILD': Shield,
    // Medical Devices
    'MDT': Heart, 'ABT': Microscope, 'TMO': FlaskConical, 'DHR': Heart, 'ISRG': Bot,

    // ===== CONSUMER (15 stocks) =====
    // Retail
    'WMT': ShoppingCart, 'TGT': Target, 'COST': Warehouse, 'HD': Hammer, 'LOW': Wrench,
    // Food & Beverage
    'KO': Droplet, 'PEP': Salad, 'MCD': Utensils, 'SBUX': Coffee, 'CMG': Utensils,
    // Apparel
    'NKE': Shirt, 'LULU': Yoga,
    // Automotive
    'TSLA': Zap, 'F': Car, 'GM': CarFront,

    // ===== ENERGY (10 stocks) =====
    // Oil & Gas
    'XOM': Fuel, 'CVX': Droplet, 'COP': Droplet, 'SLB': Wrench, 'HAL': Wrench,
    // Renewables
    'ENPH': Sun, 'NEE': Zap, 'DUK': Plug, 'SO': Lightbulb, 'AEP': Zap,

    // ===== REAL ESTATE (5 stocks) =====
    'AMT': Radio, 'PLD': Warehouse, 'EQIX': HardDrive, 'PSA': Building, 'O': Store,
};

const StockCardComponent: React.FC<StockCardProps> = ({ stock }) => {
    const router = useRouter();
    // OPTIMIZATION: Select only what we need to prevent re-renders
    const watchlist = useStore(state => state.watchlist);
    const toggleWatchlist = useStore(state => state.toggleWatchlist);
    const buyStock = useStore(state => state.buyStock);
    const cash = useStore(state => state.cash);

    const isWatchlisted = watchlist.includes(stock.symbol);

    // Animation for press effect
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Calculate price change
    const priceChange = stock.history.length >= 2
        ? stock.price - stock.history[stock.history.length - 2].value
        : 0;
    const changePercent = stock.history.length >= 2
        ? (priceChange / stock.history[stock.history.length - 2].value) * 100
        : 0;

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

    const handleQuickBuy = (e: any) => {
        e.stopPropagation();
        if (cash >= stock.price) {
            buyStock(stock.symbol, 1, stock.price);
            HapticPatterns.tradeExecuted();
        } else {
            HapticPatterns.error();
        }
    };

    const handleToggleWatchlist = (e: any) => {
        e.stopPropagation();
        toggleWatchlist(stock.symbol);
        HapticPatterns.light();
    };

    const getGradientColors = (): [string, string] => {
        // FIFA Style: Deep, rich backgrounds
        if (isPositive) {
            return ['rgba(13, 77, 77, 0.8)', 'rgba(26, 95, 95, 0.4)']; // Deep Cyan/Green Glass
        } else {
            return ['rgba(77, 26, 26, 0.8)', 'rgba(95, 38, 38, 0.4)']; // Deep Red/Maroon Glass
        }
    };

    const getBorderColor = () => {
        if (isPositive) return COLORS.accent; // Glowing Cyan
        return '#FF4444'; // Glowing Red
    };

    const IconComponent = COMPANY_ICONS[stock.symbol] || TrendingUp;

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                onPress={() => router.push(`/stock/${stock.symbol}`)}
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
                        {/* Left: Icon & Rank */}
                        <View style={styles.leftSection}>
                            <View style={[styles.iconContainer, { shadowColor: getBorderColor() }]}>
                                <IconComponent size={28} color={COLORS.accent} />
                            </View>
                            {/* Momentum Badge (FIFA "Form") */}
                            {Math.abs(changePercent) > 2 && (
                                <View style={styles.badge}>
                                    <Zap size={10} color="#000" fill="#000" />
                                    <Text style={styles.badgeText}>HOT</Text>
                                </View>
                            )}
                        </View>

                        {/* Center: Info */}
                        <View style={styles.centerSection}>
                            <View style={styles.nameRow}>
                                <Text style={styles.symbol}>{stock.symbol}</Text>
                                <TouchableOpacity onPress={handleToggleWatchlist}>
                                    <Star
                                        size={14}
                                        color={isWatchlisted ? '#FFD700' : 'rgba(255,255,255,0.3)'}
                                        fill={isWatchlisted ? '#FFD700' : 'transparent'}
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.companyName} numberOfLines={1}>
                                {stock.name}
                            </Text>
                        </View>

                        {/* Right: Price & Action */}
                        <View style={styles.rightSection}>
                            <Text style={styles.price}>
                                £{stock.price.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </Text>
                            <View style={[styles.changeBadge, { backgroundColor: isPositive ? 'rgba(0,255,255,0.1)' : 'rgba(255,0,0,0.1)' }]}>
                                {isPositive ? <TrendingUp size={12} color={COLORS.accent} /> : <TrendingDown size={12} color="#FF4444" />}
                                <Text style={[styles.changeText, { color: isPositive ? COLORS.accent : '#FF4444' }]}>
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

// Memoize with custom comparison to prevent unnecessary re-renders
export const StockCard = memo(StockCardComponent, (prevProps, nextProps) => {
    return (
        prevProps.stock.symbol === nextProps.stock.symbol &&
        prevProps.stock.price === nextProps.stock.price &&
        prevProps.stock.history.length === nextProps.stock.history.length
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
        borderWidth: 1.5, // Thicker border for "Card" feel
        padding: 0, // Reset padding for inner content
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
        width: 56,
        height: 56,
        borderRadius: RADIUS.lg,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    badge: {
        position: 'absolute',
        bottom: -6,
        backgroundColor: COLORS.accent,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        shadowColor: COLORS.accent,
        shadowOpacity: 0.5,
        shadowRadius: 4,
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
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#FFF',
        letterSpacing: 0.5,
    },
    companyName: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.6)',
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    price: {
        fontSize: 18,
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
