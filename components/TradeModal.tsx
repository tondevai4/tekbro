import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, TrendingUp, TrendingDown, Zap, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

interface TradeModalProps {
    visible: boolean;
    onClose: () => void;
    tradeType: 'BUY' | 'SELL';
    symbol: string;
    price: number;
    cash: number;
    ownedShares: number;
    onConfirm: (quantity: number) => void;
}

const BUY_GRADIENTS = ['#10B981', '#059669'] as const;
const SELL_GRADIENTS = ['#FBBF24', '#F59E0B'] as const;

export const TradeModal: React.FC<TradeModalProps> = ({
    visible,
    onClose,
    tradeType,
    symbol,
    price,
    cash,
    ownedShares,
    onConfirm,
}) => {
    const [quantity, setQuantity] = useState(1);
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 300,
                    friction: 20,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0.9);
            fadeAnim.setValue(0);
        }
    }, [visible]);

    const totalCost = quantity * price;
    const canAfford = tradeType === 'BUY' ? cash >= totalCost : ownedShares >= quantity;
    const maxQuantity = tradeType === 'BUY' ? Math.floor(cash / price) : ownedShares;

    const handleQuickSelect = (multiplier: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setQuantity(multiplier);
    };

    const handleMax = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setQuantity(maxQuantity);
    };

    const handleConfirm = () => {
        if (canAfford && quantity > 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onConfirm(quantity);
            setQuantity(1);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const gradientColors = tradeType === 'BUY' ? BUY_GRADIENTS : SELL_GRADIENTS;
    const Icon = tradeType === 'BUY' ? TrendingUp : TrendingDown;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ scale: scaleAnim }],
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View>
                            <LinearGradient
                                colors={gradientColors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.header}
                            >
                                <View style={styles.headerContent}>
                                    <View style={styles.headerLeft}>
                                        <View style={styles.iconCircle}>
                                            <Icon size={24} color="#000" strokeWidth={3} />
                                        </View>
                                        <View>
                                            <Text style={styles.headerTitle}>{tradeType} {symbol}</Text>
                                            <Text style={styles.headerSubtitle}>£{price.toFixed(2)} per share</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <View style={styles.closeButton}>
                                            <X size={20} color="#000" strokeWidth={3} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>

                            <View style={styles.content}>
                                {/* Quantity Display */}
                                <View style={styles.quantitySection}>
                                    <Text style={styles.quantityLabel}>Quantity</Text>
                                    <View style={styles.quantityDisplayContainer}>
                                        <LinearGradient
                                            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                                            style={styles.quantityDisplay}
                                        >
                                            <Text style={styles.quantityNumber}>{quantity}</Text>
                                            <Text style={styles.quantityShares}>shares</Text>
                                        </LinearGradient>
                                    </View>
                                </View>

                                {/* Quick Select Buttons */}
                                <View style={styles.quickSelectContainer}>
                                    {[1, 5, 10].map((num) => (
                                        <TouchableOpacity
                                            key={num}
                                            onPress={() => handleQuickSelect(num)}
                                            style={[
                                                styles.quickButton,
                                                quantity === num && styles.quickButtonActive,
                                            ]}
                                        >
                                            {quantity === num && (
                                                <LinearGradient
                                                    colors={gradientColors}
                                                    style={StyleSheet.absoluteFill}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                />
                                            )}
                                            <Text style={[
                                                styles.quickButtonText,
                                                quantity === num && styles.quickButtonTextActive,
                                            ]}>
                                                {num}x
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        onPress={handleMax}
                                        style={[
                                            styles.quickButton,
                                            styles.maxButton,
                                            quantity === maxQuantity && styles.quickButtonActive,
                                        ]}
                                    >
                                        {quantity === maxQuantity && (
                                            <LinearGradient
                                                colors={gradientColors}
                                                style={StyleSheet.absoluteFill}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            />
                                        )}
                                        <Zap size={14} color={quantity === maxQuantity ? '#000' : gradientColors[0]} fill={quantity === maxQuantity ? '#000' : 'transparent'} />
                                        <Text style={[
                                            styles.quickButtonText,
                                            quantity === maxQuantity && styles.quickButtonTextActive,
                                        ]}>
                                            MAX
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Cost Breakdown */}
                                <View style={styles.breakdown}>
                                    <View style={styles.breakdownRow}>
                                        <Text style={styles.breakdownLabel}>Total Cost</Text>
                                        <Text style={styles.breakdownValue}>£{totalCost.toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.breakdownRow}>
                                        <Text style={styles.breakdownLabel}>
                                            {tradeType === 'BUY' ? 'Available' : 'Owned'}
                                        </Text>
                                        <Text style={styles.breakdownValue}>
                                            {tradeType === 'BUY'
                                                ? `£${cash.toFixed(2)}`
                                                : `${ownedShares} shares`
                                            }
                                        </Text>
                                    </View>
                                    {!canAfford && (
                                        <View style={styles.errorRow}>
                                            <Text style={styles.errorText}>
                                                {tradeType === 'BUY' ? '⚠️ Insufficient funds' : '⚠️ Insufficient shares'}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Confirm Button */}
                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    disabled={!canAfford || quantity <= 0}
                                    style={[styles.confirmButton, (!canAfford || quantity <= 0) && styles.confirmButtonDisabled]}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={canAfford ? gradientColors : ['#374151', '#1F2937']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.confirmGradient}
                                    >
                                        <Check size={20} color={canAfford ? '#000' : '#9CA3AF'} strokeWidth={3} />
                                        <Text style={[styles.confirmText, (!canAfford || quantity <= 0) && styles.confirmTextDisabled]}>
                                            Confirm {tradeType}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContainer: {
        borderTopLeftRadius: RADIUS.xxl,
        borderTopRightRadius: RADIUS.xxl,
        overflow: 'hidden',
        backgroundColor: COLORS.bgElevated,
    },
    header: {
        padding: SPACING.xl,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: '#000',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: 'rgba(0,0,0,0.7)',
        marginTop: 2,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: SPACING.xl,
    },
    quantitySection: {
        marginBottom: SPACING.xl,
    },
    quantityLabel: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.textSub,
        marginBottom: SPACING.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    quantityDisplayContainer: {
        alignItems: 'center',
    },
    quantityDisplay: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl,
        paddingHorizontal: SPACING.xxl,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        minWidth: 200,
    },
    quantityNumber: {
        fontSize: 64,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        letterSpacing: -2,
    },
    quantityShares: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: COLORS.textSub,
        marginTop: -8,
    },
    quickSelectContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.xl,
    },
    quickButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        backgroundColor: COLORS.bgSubtle,
        borderWidth: 2,
        borderColor: COLORS.border,
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    quickButtonActive: {
        borderColor: 'transparent',
    },
    quickButtonText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    quickButtonTextActive: {
        color: '#000',
    },
    maxButton: {
        flexDirection: 'row',
        gap: SPACING.xs,
    },
    breakdown: {
        backgroundColor: COLORS.bgSubtle,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        gap: SPACING.md,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    breakdownLabel: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.textSub,
    },
    breakdownValue: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    errorRow: {
        marginTop: SPACING.sm,
    },
    errorText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.negative,
        textAlign: 'center',
    },
    confirmButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    confirmButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    confirmGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.lg,
    },
    confirmText: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#000',
        letterSpacing: 0.5,
    },
    confirmTextDisabled: {
        color: '#9CA3AF',
    },
});
