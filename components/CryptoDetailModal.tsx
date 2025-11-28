import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, TrendingUp, TrendingDown, Zap, Check, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { Crypto } from '../types';
import { useCryptoStore } from '../store/useCryptoStore';
import { MiniChart } from './MiniChart';
import { CryptoTooltip } from './CryptoTooltip';

interface CryptoDetailModalProps {
    visible: boolean;
    onClose: () => void;
    crypto: Crypto;
}

const LEVERAGE_OPTIONS = [1, 2, 5, 10];

export const CryptoDetailModal: React.FC<CryptoDetailModalProps> = ({
    visible,
    onClose,
    crypto,
}) => {
    const { cryptoWallet, cryptoHoldings, buyCrypto, sellCrypto } = useCryptoStore();
    const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
    const [amount, setAmount] = useState(''); // Amount in GBP
    const [leverage, setLeverage] = useState(1);

    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const holding = cryptoHoldings[crypto.symbol];
    const ownedQuantity = holding?.quantity || 0;

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
            setAmount('');
            setLeverage(1);
            setTradeType('BUY');
        }
    }, [visible]);

    const inputAmount = parseFloat(amount) || 0;
    const quantity = inputAmount / crypto.price;
    const totalCost = inputAmount / leverage; // Margin required

    // Liquidation Price Calculation
    // Long: Entry * (1 - 1/Leverage)
    const liquidationPrice = leverage > 1
        ? crypto.price * (1 - 1 / leverage)
        : 0;

    const canAfford = tradeType === 'BUY'
        ? cryptoWallet >= totalCost
        : ownedQuantity >= quantity;

    const handleConfirm = () => {
        if (!canAfford || inputAmount <= 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (tradeType === 'BUY') {
            buyCrypto(crypto.symbol, quantity, crypto.price, leverage);
        } else {
            sellCrypto(crypto.symbol, quantity, crypto.price);
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onClose();
    };

    const handleQuickAmount = (percent: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tradeType === 'BUY') {
            const maxAmount = cryptoWallet * leverage;
            setAmount((maxAmount * percent).toFixed(2));
        } else {
            const maxValue = ownedQuantity * crypto.price;
            setAmount((maxValue * percent).toFixed(2));
        }
    };

    const gradientColors = tradeType === 'BUY'
        ? ['#4A00E0', '#8E2DE2'] as const
        : ['#FBBF24', '#F59E0B'] as const;

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
                            {/* Header */}
                            <LinearGradient
                                colors={gradientColors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.header}
                            >
                                <View style={styles.headerContent}>
                                    <View>
                                        <Text style={styles.symbol}>{crypto.symbol}</Text>
                                        <Text style={styles.price}>£{crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                                    </View>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <X size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.trendContainer}>
                                    {crypto.history.length >= 2 && crypto.price >= crypto.history[crypto.history.length - 2].value ? (
                                        <>
                                            <TrendingUp size={16} color="#00FF00" />
                                            <Text style={[styles.trendText, { color: '#00FF00' }]}>Trending Up</Text>
                                        </>
                                    ) : (
                                        <>
                                            <TrendingDown size={16} color="#FF4444" />
                                            <Text style={[styles.trendText, { color: '#FF4444' }]}>Trending Down</Text>
                                        </>
                                    )}
                                </View>
                            </LinearGradient>

                            <View style={styles.content}>
                                {/* Trade Type Toggle */}
                                <View style={styles.toggleContainer}>
                                    <TouchableOpacity
                                        style={[styles.toggleButton, tradeType === 'BUY' && styles.toggleActive]}
                                        onPress={() => { setTradeType('BUY'); Haptics.selectionAsync(); }}
                                    >
                                        <Text style={[styles.toggleText, tradeType === 'BUY' && styles.toggleTextActive]}>BUY</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.toggleButton, tradeType === 'SELL' && styles.toggleActive]}
                                        onPress={() => { setTradeType('SELL'); Haptics.selectionAsync(); }}
                                    >
                                        <Text style={[styles.toggleText, tradeType === 'SELL' && styles.toggleTextActive]}>SELL</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Leverage Selector (Only for Buy) */}
                                {tradeType === 'BUY' && (
                                    <View style={styles.leverageSection}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={styles.sectionLabel}>LEVERAGE</Text>
                                            <CryptoTooltip
                                                title="What is Leverage?"
                                                content="Leverage allows you to trade with more money than you have. A 10x leverage means for every £1 you put in, you trade with £10. This amplifies both profits and losses."
                                                size={14}
                                            />
                                        </View>
                                        <View style={styles.leverageRow}>
                                            {LEVERAGE_OPTIONS.map((opt) => (
                                                <TouchableOpacity
                                                    key={opt}
                                                    style={[styles.leverageButton, leverage === opt && styles.leverageActive]}
                                                    onPress={() => { setLeverage(opt); Haptics.selectionAsync(); }}
                                                >
                                                    <Text style={[styles.leverageText, leverage === opt && styles.leverageTextActive]}>{opt}x</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        {leverage > 1 && (
                                            <View style={styles.liquidationWarning}>
                                                <AlertTriangle size={12} color={COLORS.warning} />
                                                <Text style={styles.liquidationText}>
                                                    Liquidation at £{liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Amount Input */}
                                <View style={styles.inputSection}>
                                    <Text style={styles.sectionLabel}>AMOUNT (GBP)</Text>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.currencyPrefix}>£</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={amount}
                                            onChangeText={(text) => {
                                                // Allow valid decimal input
                                                if (text === '' || /^\d*\.?\d{0,2}$/.test(text)) {
                                                    setAmount(text);
                                                }
                                            }}
                                            keyboardType="decimal-pad"
                                            placeholder="0.00"
                                            placeholderTextColor={COLORS.textSub}
                                            maxLength={10}
                                        />
                                    </View>
                                    <View style={styles.quickRow}>
                                        {[0.25, 0.5, 0.75, 1].map((pct) => (
                                            <TouchableOpacity
                                                key={pct}
                                                style={styles.quickButton}
                                                onPress={() => handleQuickAmount(pct)}
                                            >
                                                <Text style={styles.quickText}>{pct * 100}%</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Summary */}
                                <View style={styles.summary}>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Quantity</Text>
                                        <Text style={styles.summaryValue}>{quantity.toFixed(6)} {crypto.symbol}</Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Margin Required</Text>
                                        <Text style={styles.summaryValue}>£{totalCost.toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Available</Text>
                                        <Text style={styles.summaryValue}>
                                            {tradeType === 'BUY'
                                                ? `£${cryptoWallet.toFixed(2)}`
                                                : `${ownedQuantity.toFixed(6)} ${crypto.symbol}`}
                                        </Text>
                                    </View>
                                </View>

                                {/* Confirm Button */}
                                <TouchableOpacity
                                    style={[styles.confirmButton, (!canAfford || inputAmount <= 0) && styles.disabledButton]}
                                    onPress={handleConfirm}
                                    disabled={!canAfford || inputAmount <= 0}
                                >
                                    <LinearGradient
                                        colors={(!canAfford || inputAmount <= 0) ? ['#333', '#444'] : gradientColors}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.confirmGradient}
                                    >
                                        <Text style={styles.confirmText}>
                                            {tradeType === 'BUY' ? 'CONFIRM BUY' : 'CONFIRM SELL'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </KeyboardAvoidingView >
        </Modal >
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
        backgroundColor: COLORS.bgElevated,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    header: {
        padding: SPACING.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
    },
    symbol: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    price: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.8)',
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: RADIUS.full,
    },
    trendContainer: {
        marginLeft: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
    },
    trendText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
    content: {
        padding: SPACING.lg,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.bgSubtle,
        borderRadius: RADIUS.lg,
        padding: 4,
        marginBottom: SPACING.lg,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: RADIUS.md,
    },
    toggleActive: {
        backgroundColor: COLORS.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    toggleText: {
        fontFamily: FONTS.bold,
        color: COLORS.textSub,
    },
    toggleTextActive: {
        color: COLORS.text,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.sm,
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: COLORS.textSub,
        letterSpacing: 1,
        marginBottom: 0, // Remove margin here as it's handled by sectionHeader
    },
    leverageSection: {
        marginBottom: SPACING.lg,
    },
    leverageRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    leverageButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.bg,
    },
    leverageActive: {
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(74, 0, 224, 0.1)',
    },
    leverageText: {
        fontFamily: FONTS.bold,
        color: COLORS.textSub,
    },
    leverageTextActive: {
        color: COLORS.accent,
    },
    liquidationWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
        gap: 4,
    },
    liquidationText: {
        fontSize: 10,
        color: COLORS.warning,
        fontFamily: FONTS.medium,
    },
    inputSection: {
        marginBottom: SPACING.lg,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    currencyPrefix: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginRight: SPACING.xs,
    },
    input: {
        flex: 1,
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        padding: 0,
    },
    quickRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },
    quickButton: {
        flex: 1,
        paddingVertical: 6,
        alignItems: 'center',
        backgroundColor: COLORS.bgSubtle,
        borderRadius: RADIUS.sm,
    },
    quickText: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: COLORS.textSub,
    },
    summary: {
        backgroundColor: COLORS.bgSubtle,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.xl,
        gap: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 12,
        color: COLORS.textSub,
        fontFamily: FONTS.regular,
    },
    summaryValue: {
        fontSize: 12,
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    confirmButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.5,
    },
    confirmGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    confirmText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#FFF',
        letterSpacing: 1,
    },
});
