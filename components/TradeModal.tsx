import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Check, TrendingUp, TrendingDown, DollarSign } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FONTS, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface TradeModalProps {
    visible: boolean;
    onClose: () => void;
    tradeType: 'BUY' | 'SELL';
    symbol: string;
    price: number;
    cash: number;
    ownedShares: number;
    onConfirm: (quantity: number, type: 'BUY' | 'SELL') => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
    visible,
    onClose,
    tradeType: initialTradeType,
    symbol,
    price,
    cash,
    ownedShares,
    onConfirm
}) => {
    const { theme } = useTheme();
    const [quantity, setQuantity] = useState('');
    const [activeTradeType, setActiveTradeType] = useState(initialTradeType);

    // Reset state when opening
    useEffect(() => {
        if (visible) {
            setQuantity('');
            setActiveTradeType(initialTradeType);
            scale.value = withSpring(1, { damping: 15 });
            opacity.value = withTiming(1, { duration: 200 });
        } else {
            scale.value = withTiming(0.9, { duration: 200 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible, initialTradeType]);

    // Animations
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const numQuantity = parseFloat(quantity) || 0;
    const totalCost = numQuantity * price;
    const canAfford = activeTradeType === 'BUY' ? totalCost <= cash : numQuantity <= ownedShares;

    // Theme-aware gradients
    const buyGradient = [theme.positive, theme.positive + '80'] as const; // Green/Teal
    const sellGradient = [theme.warning, theme.warning + '80'] as const; // Amber/Orange

    const gradientColors = activeTradeType === 'BUY' ? buyGradient : sellGradient;

    const handleConfirm = () => {
        if (numQuantity > 0 && canAfford) {
            onConfirm(numQuantity, activeTradeType);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleQuickSelect = (percentage: number) => {
        Haptics.selectionAsync();
        if (activeTradeType === 'BUY') {
            const maxAffordable = Math.floor((cash * percentage) / price);
            setQuantity(maxAffordable.toString());
        } else {
            const maxSellable = Math.floor(ownedShares * percentage);
            setQuantity(maxSellable.toString());
        }
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <Animated.View style={[styles.modalContainer, animatedStyle, { backgroundColor: theme.bgElevated }]}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View>
                            {/* Header */}
                            <LinearGradient
                                colors={gradientColors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.header}
                            >
                                <View style={styles.headerContent}>
                                    <View style={styles.headerLeft}>
                                        <View style={styles.iconCircle}>
                                            {activeTradeType === 'BUY' ? (
                                                <TrendingUp size={24} color="#000" />
                                            ) : (
                                                <TrendingDown size={24} color="#000" />
                                            )}
                                        </View>
                                        <View>
                                            <Text style={styles.headerTitle}>{activeTradeType} {symbol}</Text>
                                            <Text style={styles.headerSubtitle}>£{price.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <X size={20} color="#000" />
                                    </TouchableOpacity>
                                </View>

                                {/* Toggle Switch */}
                                <View style={styles.toggleContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleButton,
                                            activeTradeType === 'BUY' && styles.toggleButtonActive
                                        ]}
                                        onPress={() => {
                                            setActiveTradeType('BUY');
                                            Haptics.selectionAsync();
                                        }}
                                    >
                                        <Text style={[
                                            styles.toggleText,
                                            activeTradeType === 'BUY' && styles.toggleTextActive
                                        ]}>Buy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleButton,
                                            activeTradeType === 'SELL' && styles.toggleButtonActive
                                        ]}
                                        onPress={() => {
                                            setActiveTradeType('SELL');
                                            Haptics.selectionAsync();
                                        }}
                                    >
                                        <Text style={[
                                            styles.toggleText,
                                            activeTradeType === 'SELL' && styles.toggleTextActive
                                        ]}>Sell</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>

                            <View style={styles.content}>
                                {/* Quantity Input */}
                                <View style={styles.quantitySection}>
                                    <Text style={[styles.quantityLabel, { color: theme.textSub }]}>Quantity</Text>
                                    <View style={styles.quantityDisplayContainer}>
                                        <View style={[styles.quantityDisplay, { borderColor: theme.border }]}>
                                            <TextInput
                                                style={[styles.quantityInput, { color: theme.text }]}
                                                value={quantity}
                                                onChangeText={setQuantity}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                placeholderTextColor={theme.textTertiary}
                                                maxLength={6}
                                            />
                                            <Text style={[styles.quantityShares, { color: theme.textSub }]}>Shares</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Quick Select */}
                                <View style={styles.quickSelectContainer}>
                                    {[0.25, 0.5, 0.75].map((pct) => (
                                        <TouchableOpacity
                                            key={pct}
                                            style={[styles.quickButton, { borderColor: theme.border }]}
                                            onPress={() => handleQuickSelect(pct)}
                                        >
                                            <Text style={[styles.quickButtonText, { color: theme.textSub }]}>
                                                {pct * 100}%
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        style={[styles.quickButton, styles.maxButton, { backgroundColor: theme.bgSubtle, borderColor: 'transparent' }]}
                                        onPress={() => handleQuickSelect(1)}
                                    >
                                        <Text style={[styles.quickButtonTextActive, { color: theme.text }]}>MAX</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Cost Breakdown */}
                                <View style={[styles.breakdown, { backgroundColor: theme.bgSubtle }]}>
                                    <View style={styles.breakdownRow}>
                                        <Text style={[styles.breakdownLabel, { color: theme.textSub }]}>Total Cost</Text>
                                        <Text style={[styles.breakdownValue, { color: theme.text }]}>£{totalCost.toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.breakdownRow}>
                                        <Text style={[styles.breakdownLabel, { color: theme.textSub }]}>
                                            {activeTradeType === 'BUY' ? 'Available Cash' : 'Available Shares'}
                                        </Text>
                                        <Text style={[styles.breakdownValue, { color: theme.text }]}>
                                            {activeTradeType === 'BUY' ? `£${cash.toFixed(2)}` : ownedShares}
                                        </Text>
                                    </View>
                                    {!canAfford && (
                                        <View style={styles.errorRow}>
                                            <Text style={[styles.errorText, { color: theme.negative }]}>
                                                {activeTradeType === 'BUY' ? 'Insufficient Funds' : 'Insufficient Shares'}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Confirm Button */}
                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    disabled={!canAfford || numQuantity <= 0}
                                    style={[styles.confirmButton, (!canAfford || numQuantity <= 0) && styles.confirmButtonDisabled]}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={canAfford ? gradientColors : [theme.bgSubtle, theme.bgSubtle]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.confirmGradient}
                                    >
                                        <Check size={20} color={canAfford ? '#000' : theme.textTertiary} strokeWidth={3} />
                                        <Text style={[styles.confirmText, (!canAfford || numQuantity <= 0) && { color: theme.textTertiary }]}>
                                            Confirm {activeTradeType}
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
    },
    header: {
        padding: SPACING.xl,
        paddingBottom: SPACING.lg,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
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
        backgroundColor: 'rgba(255,255,255,0.2)',
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
        color: 'rgba(0,0,0,0.6)',
        marginTop: 2,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: RADIUS.lg,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: RADIUS.md,
    },
    toggleButtonActive: {
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: 'rgba(0,0,0,0.5)',
    },
    toggleTextActive: {
        color: '#000',
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
        minWidth: 200,
    },
    quantityInput: {
        fontSize: 48,
        fontFamily: FONTS.bold,
        letterSpacing: -2,
        textAlign: 'center',
        minWidth: 100,
        padding: 0,
    },
    quantityShares: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        marginTop: -4,
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
        borderWidth: 1,
        overflow: 'hidden',
    },
    quickButtonText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    quickButtonTextActive: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    maxButton: {
        flex: 1,
    },
    breakdown: {
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
    },
    breakdownValue: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    errorRow: {
        marginTop: SPACING.sm,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
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
});
