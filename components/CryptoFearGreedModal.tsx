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

interface CryptoFearGreedModalProps {
    visible: boolean;
    onClose: () => void;
}

export const CryptoFearGreedModal: React.FC<CryptoFearGreedModalProps> = ({ visible, onClose }) => {
    const {
        cryptoFearGreedIndex,
        getCryptoMoodLabel,
        getCryptoMoodColor,
        cryptoVolatility,
        cryptoMomentum,
        cryptoDominance
    } = useMarketMoodStore();

    const animatedValue = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(animatedValue, {
                    toValue: cryptoFearGreedIndex / 100,
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false, // SVG props cannot use native driver
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
    }, [visible, cryptoFearGreedIndex]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [CIRCUMFERENCE, 0],
    });

    const moodLabel = getCryptoMoodLabel();
    const moodColor = getCryptoMoodColor();

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
                        <Text style={styles.headerTitle}>CRYPTO SENTIMENT</Text>
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
                                <SvgLinearGradient id="cryptoGrad" x1="0" y1="0" x2="1" y2="1">
                                    <Stop offset="0" stopColor="#7C4DFF" stopOpacity="1" />
                                    <Stop offset="0.5" stopColor="#00E5FF" stopOpacity="1" />
                                    <Stop offset="1" stopColor="#69F0AE" stopOpacity="1" />
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
                                stroke="url(#cryptoGrad)"
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
                            <Text style={[styles.indexNumber, { color: moodColor }]}>
                                {Math.round(cryptoFearGreedIndex)}
                            </Text>
                            <Text style={styles.indexLabel}>
                                {moodLabel.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    {/* Minimalist Data Grid */}
                    <View style={styles.dataGrid}>
                        {renderMacroItem(
                            "VOLATILITY",
                            (cryptoVolatility * 100).toFixed(1) + '%',
                            cryptoVolatility > 0.05 ? 'up' : 'neutral',
                            "A measure of how much the price of an asset varies over time. High volatility means high risk and potential high reward."
                        )}
                        {renderMacroItem(
                            "MOMENTUM",
                            (cryptoMomentum > 0 ? '+' : '') + (cryptoMomentum * 1000).toFixed(1),
                            cryptoMomentum > 0 ? 'up' : 'down',
                            "The speed or velocity of price changes. Bullish momentum suggests prices are rising; bearish suggests they are falling."
                        )}
                        {renderMacroItem(
                            "DOMINANCE",
                            cryptoDominance.toFixed(1) + '%',
                            'neutral',
                            "Bitcoin Dominance. The percentage of the total crypto market cap that is Bitcoin. Often used to gauge altcoin season."
                        )}
                    </View>

                    {/* Subtle Insight */}
                    <Text style={styles.insightText}>
                        {cryptoFearGreedIndex > 80 ? "Extreme FOMO detected. High risk of correction." :
                            cryptoFearGreedIndex < 20 ? "Peak fear. Capitulation likely." :
                                "Market is accumulating."}
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
