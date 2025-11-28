import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, AlertTriangle, Clock, TrendingUp, Check, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface CryptoOnboardingModalProps {
    visible: boolean;
    onClose: () => void;
}

const ONBOARDING_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to Crypto',
        subtitle: 'High Risk, High Reward',
        description: 'Trade 24/7 in a volatile market. Crypto moves fast—fortunes can be made or lost in minutes.',
        icon: <Zap size={48} color="#00D9FF" />,
        color: '#00D9FF'
    },
    {
        id: 'volatility',
        title: 'Extreme Volatility',
        subtitle: 'Buckle Up',
        description: 'Prices can swing 10-20% in a single day. This is not the stock market. Be prepared for wild rides.',
        icon: <TrendingUp size={48} color="#FFD700" />,
        color: '#FFD700'
    },
    {
        id: 'hours',
        title: 'The Market Never Sleeps',
        subtitle: '24/7 Trading',
        description: 'Unlike stocks, crypto markets are open every second of every day. Opportunities (and risks) never stop.',
        icon: <Clock size={48} color="#A855F7" />,
        color: '#A855F7'
    },
    {
        id: 'risk',
        title: 'Risk Warning',
        subtitle: 'Trade Responsibly',
        description: 'Leverage can amplify gains but also wipe out your account instantly. Only trade what you can afford to lose (virtually).',
        icon: <AlertTriangle size={48} color="#FF4444" />,
        color: '#FF4444'
    }
];

export const CryptoOnboardingModal: React.FC<CryptoOnboardingModalProps> = ({ visible, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const step = ONBOARDING_STEPS[currentStep];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => { }} // Prevent closing via back button
        >
            <BlurView intensity={95} tint="dark" style={styles.container}>
                <SafeAreaView style={styles.content}>
                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        {ONBOARDING_STEPS.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.progressDot,
                                    {
                                        backgroundColor: index <= currentStep ? step.color : 'rgba(255,255,255,0.1)',
                                        width: index === currentStep ? 24 : 8
                                    }
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.cardContainer}>
                        <LinearGradient
                            colors={[`${step.color}22`, 'rgba(255,255,255,0.05)']}
                            style={styles.card}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: `${step.color}33` }]}>
                                {step.icon}
                            </View>

                            <Text style={[styles.title, { color: step.color }]}>{step.title}</Text>
                            <Text style={styles.subtitle}>{step.subtitle}</Text>
                            <Text style={styles.description}>{step.description}</Text>
                        </LinearGradient>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[step.color, step.color]} // Can add gradient variation
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>
                                {currentStep === ONBOARDING_STEPS.length - 1 ? 'I Understand' : 'Next'}
                            </Text>
                            {currentStep === ONBOARDING_STEPS.length - 1 ? (
                                <Check size={20} color="#000" />
                            ) : (
                                <ChevronRight size={20} color="#000" />
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </SafeAreaView>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: SPACING.xl,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: SPACING.xl,
    },
    progressDot: {
        height: 8,
        borderRadius: 4,
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        padding: SPACING.xl,
        borderRadius: RADIUS.xxl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: SPACING.lg,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    description: {
        fontSize: 18,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 28,
    },
    button: {
        width: '100%',
        marginBottom: SPACING.xl,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: RADIUS.xl,
    },
    buttonText: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#000',
    },
});
