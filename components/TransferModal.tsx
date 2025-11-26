import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { useCryptoStore } from '../store/useCryptoStore';
import { useStore } from '../store/useStore';
import * as Haptics from 'expo-haptics';

interface TransferModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'DEPOSIT' | 'WITHDRAW';
}

export const TransferModal: React.FC<TransferModalProps> = ({ visible, onClose, type }) => {
    const { cryptoWallet, transferToCrypto, transferFromCrypto } = useCryptoStore();
    const { cash } = useStore();
    const [amount, setAmount] = useState('');

    // Reset amount when modal opens
    useEffect(() => {
        if (visible) {
            setAmount('');
        }
    }, [visible]);

    const handleTransfer = () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
            return;
        }

        if (type === 'DEPOSIT') {
            if (value > cash) {
                Alert.alert('Insufficient Funds', 'You do not have enough cash in your main account.');
                return;
            }
            transferToCrypto(value);
        } else {
            if (value > cryptoWallet) {
                Alert.alert('Insufficient Funds', 'You do not have enough cash in your crypto wallet.');
                return;
            }
            transferFromCrypto(value);
        }

        setAmount('');
        onClose();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {type === 'DEPOSIT' ? 'Deposit to Crypto' : 'Withdraw from Crypto'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.modalSubtitle}>
                        {type === 'DEPOSIT'
                            ? `Available Cash: £${cash.toLocaleString()}`
                            : `Available Crypto Balance: £${cryptoWallet.toLocaleString()}`
                        }
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.currencySymbol}>£</Text>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor={COLORS.textSub}
                            autoFocus={visible}
                        />
                    </View>

                    <View style={styles.quickAmounts}>
                        {[100, 500, 1000, 5000].map((val) => (
                            <TouchableOpacity
                                key={val}
                                style={styles.quickButton}
                                onPress={() => {
                                    setAmount(val.toString());
                                    Haptics.selectionAsync();
                                }}
                            >
                                <Text style={styles.quickButtonText}>£{val}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Max Button Row */}
                    <View style={styles.maxButtonContainer}>
                        <TouchableOpacity
                            style={styles.maxButton}
                            onPress={() => {
                                if (type === 'DEPOSIT') {
                                    setAmount(cash.toString());
                                } else {
                                    setAmount(cryptoWallet.toString());
                                }
                                Haptics.selectionAsync();
                            }}
                        >
                            <Text style={styles.maxButtonText}>MAX</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            { backgroundColor: type === 'DEPOSIT' ? COLORS.success : COLORS.accent }
                        ]}
                        onPress={handleTransfer}
                    >
                        <Text style={styles.confirmButtonText}>
                            {type === 'DEPOSIT' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.xl,
        paddingBottom: SPACING.xxl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    modalSubtitle: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.textSub,
        marginBottom: SPACING.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    currencySymbol: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    quickAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    maxButtonContainer: {
        alignItems: 'flex-end',
        marginBottom: SPACING.xl,
    },
    maxButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    maxButtonText: {
        color: COLORS.accent,
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
    quickButton: {
        backgroundColor: COLORS.bg,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    quickButtonText: {
        color: COLORS.text,
        fontFamily: FONTS.medium,
    },
    confirmButton: {
        paddingVertical: 16,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
});
