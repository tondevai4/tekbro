import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

interface GameAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onDismiss: () => void;
}

export const GameAlert: React.FC<GameAlertProps> = ({ visible, title, message, onDismiss }) => {
    const { theme } = useTheme();
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Slide down
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();

            // Haptic feedback
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Auto-dismiss after 6 seconds (longer to read)
            const timer = setTimeout(() => {
                handleDismiss();
            }, 6000);

            return () => clearTimeout(timer);
        } else {
            handleDismiss();
        }
    }, [visible]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            })
        ]).start(() => {
            if (visible) onDismiss();
        });
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity
                }
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleDismiss}
                style={[
                    styles.content,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.primary,
                        shadowColor: theme.primary
                    }
                ]}
            >
                {/* Search Icon (Game Style) */}
                <View style={styles.iconContainer}>
                    <Search size={20} color={theme.primary} />
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.primary }]} numberOfLines={1}>{title}</Text>
                    <Text style={[styles.message, { color: theme.textSub }]} numberOfLines={2}>{message}</Text>
                </View>

                {/* Dismiss Hint */}
                <View style={[styles.dismissContainer, { borderLeftColor: theme.border }]}>
                    <Text style={[styles.dismissText, { color: theme.text }]}>OK</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50, // Adjusted for better visibility
        left: SPACING.md,
        right: SPACING.md,
        zIndex: 99999, // Super high z-index
        alignItems: 'center',
        elevation: 10, // Android elevation
    },
    content: {
        width: '100%',
        borderRadius: RADIUS.full, // Pill shape
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: FONTS.bold,
        fontSize: 14,
        marginBottom: 2,
    },
    message: {
        fontFamily: FONTS.medium,
        fontSize: 12,
    },
    dismissContainer: {
        marginLeft: 12,
        paddingLeft: 12,
        borderLeftWidth: 1,
    },
    dismissText: {
        fontFamily: FONTS.bold,
        fontSize: 12,
    }
});
