import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useMarketMoodStore } from '../store/useMarketMoodStore';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = 260;
const STROKE_WIDTH = 4; // Ultra thin
const RADIUS_VAL = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS_VAL;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StockFearGreedModalProps {
    visible: boolean;
    onClose: () => void;
}

export const StockFearGreedModal: React.FC<StockFearGreedModalProps> = ({ visible, onClose }) => {
    const {
        fearGreedIndex,
        getMoodLabel,
        interestRate,
        gdpGrowth,
        inflation,
        volatilityIndex
    } = useMarketMoodStore();

    const animatedValue = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(animatedValue, {
                    toValue: fearGreedIndex / 100,
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            animatedValue.setValue(0);
            fadeAnim.setValue(0);
        }
    }, [visible, fearGreedIndex]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [CIRCUMFERENCE, 0],
    });

    const moodLabel = getMoodLabel();

    // Minimalist color palette based on value
    const getAccentColor = () => {
        if (fearGreedIndex > 60) return '#00E676'; // Bright Teal/Green
        if (fearGreedIndex < 40) return '#FF5252'; // Soft Red
        return '#E0E0E0'; // Neutral Grey/White
    };

    const accentColor = getAccentColor();

    const showDefinition = (title: string, definition: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(title, definition);
    };

    const renderMacroItem = (label: string, value: string, trend: 'up' | 'down' | 'neutral', definition: string) => (
        <TouchableOpacity
            style={styles.macroItem}
            onPress={() => showDefinition(label, definition)}
            activeOpacity={0.7}
        >
            <Text style={styles.macroLabel}>{label}</Text>
            <View style={styles.macroValueContainer}>
                <Text style={styles.macroValue}>{value}</Text>
                {trend === 'up' && <ArrowUpRight size={14} color="#00E676" />}
                {trend === 'down' && <ArrowDownRight size={14} color="#FF5252" />}
                {trend === 'neutral' && <Minus size={14} color="#888" />}
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />

                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>MARKET SENTIMENT</Text>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onClose();
                            }}
                            style={styles.closeButton}
                        >
                            <X size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Main Visualization */}
                    <View style={styles.ringContainer}>
                        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.svg}>
                            <Defs>
                                <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                                    <Stop offset="0" stopColor="#FF5252" stopOpacity="1" />
                                    <Stop offset="0.5" stopColor="#E0E0E0" stopOpacity="1" />
                                    <Stop offset="1" stopColor="#00E676" stopOpacity="1" />
                                </SvgLinearGradient>
                            </Defs>

                            {/* Background Track */}
                            <Circle
                                cx={CIRCLE_SIZE / 2}
                                cy={CIRCLE_SIZE / 2}
                                r={RADIUS_VAL}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                            />

                            {/* Progress Ring */}
                            <AnimatedCircle
                                cx={CIRCLE_SIZE / 2}
                                cy={CIRCLE_SIZE / 2}
                                r={RADIUS_VAL}
                                stroke="url(#grad)"
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                                strokeDasharray={[CIRCUMFERENCE, CIRCUMFERENCE]}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                rotation="-90"
                                origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                            />
                        </Svg>

                        <View style={styles.centerContent}>
                            <Text style={[styles.indexNumber, { color: accentColor }]}>
                                {Math.round(fearGreedIndex)}
                            </Text>
                            <Text style={styles.indexLabel}>
                                {moodLabel.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    {/* Minimalist Data Grid */}
                    <View style={styles.dataGrid}>
                        {renderMacroItem(
                            "INTEREST RATE",
                            interestRate.toFixed(2) + '%',
                            'neutral',
                            "The base cost of borrowing money set by the Fed. Higher rates generally cool down the economy and stock market."
                        )}
                        {renderMacroItem(
                            "GDP GROWTH",
                            (gdpGrowth > 0 ? '+' : '') + gdpGrowth.toFixed(1) + '%',
                            gdpGrowth > 0 ? 'up' : 'down',
                            "Gross Domestic Product Growth. Measures the health of the economy. Positive growth is bullish for stocks."
                        )}
                        {renderMacroItem(
                            "INFLATION",
                            inflation.toFixed(1) + '%',
                            inflation < 3 ? 'up' : 'down',
                            "The rate at which prices are rising. High inflation erodes purchasing power and often leads to higher interest rates."
                        )}
                        {renderMacroItem(
                            "VIX",
                            volatilityIndex.toFixed(0),
                            volatilityIndex < 20 ? 'up' : 'down',
                            "The 'Fear Gauge'. Measures expected market volatility. High VIX (>30) indicates fear; low VIX (<20) indicates complacency."
                        )}
                    </View>

                    {/* Subtle Insight */}
                    <Text style={styles.insightText}>
                        {fearGreedIndex > 75 ? "Markets are overheated. Caution advised." :
                            fearGreedIndex < 25 ? "Extreme fear. Potential buying opportunity." :
                                "Market conditions are neutral."}
                    </Text>

                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    container: {
        width: width * 0.85,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    headerTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#888',
        letterSpacing: 2,
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    ringContainer: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
    },
    svg: {
        position: 'absolute',
    },
    centerContent: {
        alignItems: 'center',
    },
    indexNumber: {
        fontSize: 86,
        fontWeight: '200', // Thin font
        color: '#FFF',
        fontVariant: ['tabular-nums'],
        letterSpacing: -2,
    },
    indexLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
        letterSpacing: 4,
        marginTop: -5,
    },
    dataGrid: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    macroItem: {
        alignItems: 'center',
    },
    macroLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#555',
        marginBottom: 6,
        letterSpacing: 1,
    },
    macroValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    macroValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#E0E0E0',
    },
    insightText: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        fontWeight: '400',
        letterSpacing: 0.5,
    },
});
