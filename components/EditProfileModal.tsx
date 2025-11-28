import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, User, Check, Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FONTS, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store/useStore';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
    const { theme } = useTheme();
    const { username, setProfile } = useStore();
    const [newUsername, setNewUsername] = useState(username);

    // Animations
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            setNewUsername(username);
            scale.value = withSpring(1, { damping: 15 });
            opacity.value = withTiming(1, { duration: 200 });
        } else {
            scale.value = withTiming(0.9, { duration: 200 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible, username]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const handleSave = () => {
        if (newUsername.trim().length > 0) {
            // Fix: Pass arguments directly, not as an object
            setProfile(newUsername.trim(), 'default');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onClose();
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <Animated.View style={[styles.modalContent, animatedStyle]}>
                    <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={StyleSheet.absoluteFill} />
                    <LinearGradient
                        colors={[theme.bgElevated, theme.bg]}
                        style={[styles.gradientBg, { borderColor: theme.border }]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
                            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.bgSubtle }]}>
                                <X size={20} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Avatar Section */}
                        <View style={styles.avatarSection}>
                            <View style={[styles.avatarContainer, { borderColor: theme.primary }]}>
                                <User size={40} color={theme.primary} />
                                <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: theme.primary }]}>
                                    <Camera size={14} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Input Field */}
                        <View style={styles.inputSection}>
                            <Text style={[styles.label, { color: theme.textSub }]}>USERNAME</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.bgSubtle, borderColor: theme.border }]}>
                                <User size={20} color={theme.textTertiary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    value={newUsername}
                                    onChangeText={setNewUsername}
                                    placeholder="Enter username"
                                    placeholderTextColor={theme.textTertiary}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            onPress={handleSave}
                            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                            <Check size={20} color="#000" />
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: RADIUS.xxl,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    gradientBg: {
        padding: SPACING.xl,
        borderWidth: 1,
        borderRadius: RADIUS.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 24,
        fontFamily: FONTS.bold,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: RADIUS.full,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    inputSection: {
        marginBottom: SPACING.xl,
    },
    label: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.xs,
        letterSpacing: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        height: 56,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        gap: SPACING.md,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: RADIUS.lg,
        gap: SPACING.sm,
    },
    saveBtnText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#000',
    },
});
