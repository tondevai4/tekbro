import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import { FONTS, SPACING, RADIUS } from '../constants/theme';
import { useCryptoStore } from '../store/useCryptoStore';
import { useStore } from '../store/useStore';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';

interface TransferModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'DEPOSIT' | 'WITHDRAW';
}

export const TransferModal: React.FC<TransferModalProps> = ({ visible, onClose, type }) => {
    const { cryptoWallet, transferToCrypto, transferFromCrypto } = useCryptoStore();
    const { cash } = useStore();
    const { theme } = useTheme();
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
                <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {type === 'DEPOSIT' ? 'Deposit to Crypto' : 'Withdraw from Crypto'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.modalSubtitle, { color: theme.textSub }]}>
                        {type === 'DEPOSIT'
                            ? `Available Cash: £${cash.toLocaleString()}`
                            : `Available Crypto Balance: £${cryptoWallet.toLocaleString()}`
                        }
                    </Text>

                    <View style={[styles.inputContainer, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                        <Text style={[styles.currencySymbol, { color: theme.text }]}>£</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor={theme.textSub}
                            autoFocus={visible}
                        />
                    </View>

                    <View style={styles.quickAmounts}>
                        {[100, 500, 1000, 5000].map((val) => (
                            <TouchableOpacity
                                key={val}
                                style={[styles.quickButton, { backgroundColor: theme.bg, borderColor: theme.border }]}
                                onPress={() => {
                                    setAmount(val.toString());
                                    Haptics.selectionAsync();
                                }}
                            >
                                <Text style={[styles.quickButtonText, { color: theme.text }]}>£{val}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Max Button Row */}
                    <View style={styles.maxButtonContainer}>
                        <TouchableOpacity
                            style={[styles.maxButton, { borderColor: theme.accent }]}
                            onPress={() => {
                                if (type === 'DEPOSIT') {
                                    setAmount(cash.toString());
                                } else {
                                    setAmount(cryptoWallet.toString());
                                }
                                Haptics.selectionAsync();
                            }}
                        >
                            <Text style={[styles.maxButtonText, { color: theme.accent }]}>MAX</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            { backgroundColor: type === 'DEPOSIT' ? theme.success : theme.accent }
                        ]}
                        onPress={handleTransfer}
                    >
                        <Text style={[styles.confirmButtonText, { color: theme.white }]}>
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
    },
    modalSubtitle: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        marginBottom: SPACING.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
    },
    currencySymbol: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: 24,
        fontFamily: FONTS.bold,
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
    },
    maxButtonText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
    quickButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    quickButtonText: {
        fontFamily: FONTS.medium,
    },
    confirmButton: {
        paddingVertical: 16,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
});
