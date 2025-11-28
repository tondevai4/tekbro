import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, Keyboard, TouchableWithoutFeedback, Dimensions, TouchableOpacity } from 'react-native';
import { appStorage } from '../utils/storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    runOnJS,
    FadeIn,
    FadeOut,
    SlideInDown,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { HapticPatterns } from '../utils/haptics';
import { AppBackground } from '../components/AppBackground';
import { Lock, Check, ShieldCheck, ChevronRight, ArrowRight } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const { setProfile, setOnboardingCompleted } = useStore();
    const { theme } = useTheme();
    const [displayMoney, setDisplayMoney] = useState(0);
    const moneyAnim = useSharedValue(0);

    const handleNext = () => {
        HapticPatterns.selection();
        setStep(prev => prev + 1);
    };

    const handleFinish = async () => {
        HapticPatterns.success();
        setProfile(name || 'Trader', 'default');
        setOnboardingCompleted(true);
        router.replace('/(tabs)');
    };

    useEffect(() => {
        if (step === 2) {
            setTimeout(() => {
                moneyAnim.value = withTiming(1000000, { duration: 2500 }, (finished) => {
                    if (finished) {
                        runOnJS(HapticPatterns.success)();
                    }
                });
            }, 500);
        }
    }, [step]);

    useEffect(() => {
        if (step === 2) {
            const interval = setInterval(() => {
                const current = Math.floor(moneyAnim.value);
                setDisplayMoney(current);
                if (current > 0 && current < 1000000 && current % 100000 < 2000) {
                    HapticPatterns.light();
                }
            }, 16);
            return () => clearInterval(interval);
        }
    }, [step]);

    return (
        <AppBackground>
            <SafeAreaView style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.content}>

                        {/* Step 0: Selection */}
                        {step === 0 && (
                            <Animated.View
                                entering={FadeIn.duration(1000)}
                                exiting={FadeOut.duration(500)}
                                style={styles.stepContainer}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
                                    <Lock size={48} color={theme.primary} />
                                </View>
                                <Text style={[styles.title, { color: theme.text }]}>Restricted Access</Text>
                                <Text style={[styles.subtitle, { color: theme.textSub }]}>
                                    You have been selected for the PaperTrader Elite program.
                                </Text>
                                <Text style={[styles.subtitle, { marginTop: 20, color: theme.text }]}>
                                    Do you accept the invitation?
                                </Text>
                                <TouchableOpacity
                                    style={[styles.primaryButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                                    onPress={handleNext}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.buttonText, { color: theme.bg }]}>Initialize Protocol</Text>
                                    <ArrowRight size={20} color={theme.bg} />
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* Step 1: Identity */}
                        {step === 1 && (
                            <Animated.View
                                entering={FadeIn.duration(600)}
                                exiting={FadeOut.duration(300)}
                                style={styles.stepContainer}
                            >
                                <Text style={[styles.stepLabel, { color: theme.primary }]}>STEP 1 / 2</Text>
                                <Text style={[styles.title, { color: theme.text }]}>Identity Verification</Text>
                                <Text style={[styles.subtitle, { color: theme.textSub }]}>
                                    Enter your trading alias to establish your secure ledger.
                                </Text>
                                <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
                                    <BlurView intensity={20} tint="dark" style={styles.blurInput}>
                                        <TextInput
                                            style={[styles.input, { color: theme.text }]}
                                            placeholder="Enter Alias"
                                            placeholderTextColor={theme.textMuted}
                                            value={name}
                                            onChangeText={setName}
                                            autoCapitalize="words"
                                            autoCorrect={false}
                                            autoFocus
                                        />
                                    </BlurView>
                                </View>
                                {name && (
                                    <TouchableOpacity
                                        style={[styles.primaryButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                                        onPress={handleNext}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.buttonText, { color: theme.bg }]}>Confirm Identity</Text>
                                        <Check size={20} color={theme.bg} />
                                    </TouchableOpacity>
                                )}
                            </Animated.View>
                        )}

                        {/* Step 2: Capital Allocation */}
                        {step === 2 && (
                            <Animated.View
                                entering={FadeIn.duration(800)}
                                style={styles.stepContainer}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: theme.positive + '15', borderColor: theme.positive }]}>
                                    <ShieldCheck size={64} color={theme.positive} />
                                </View>
                                <Text style={[styles.stepLabel, { color: theme.primary }]}>FINAL STEP</Text>
                                <Text style={[styles.title, { color: theme.text }]}>Capital Allocation</Text>
                                <Text style={[styles.subtitle, { color: theme.textSub }]}>
                                    Transferring initial liquidity to your portfolio...
                                </Text>
                                <View style={styles.moneyContainer}>
                                    <Text style={[styles.currencySymbol, { color: theme.positive }]}>£</Text>
                                    <Text style={[styles.moneyText, { color: theme.positive }]}>{displayMoney.toLocaleString()}</Text>
                                </View>
                                {displayMoney >= 1000000 && (
                                    <>
                                        <Animated.View
                                            entering={SlideInDown.springify()}
                                            style={styles.stampContainer}
                                        >
                                            <View style={[styles.stamp, { borderColor: theme.positive, backgroundColor: theme.positive + '15' }]}>
                                                <Text style={[styles.stampText, { color: theme.positive }]}>FUNDS AVAILABLE</Text>
                                            </View>
                                        </Animated.View>
                                        <View style={{ flex: 1 }} />
                                        <Animated.View entering={FadeIn.delay(500)} style={{ width: '100%' }}>
                                            <SlideButton onComplete={handleFinish} label="Slide to Enter Market" theme={theme} />
                                        </Animated.View>
                                    </>
                                )}
                            </Animated.View>
                        )}

                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </AppBackground>
    );
}

// Slide Button Component
function SlideButton({ onComplete, label, icon, theme }: { onComplete: () => void; label: string; icon?: 'check' | 'arrow', theme: any }) {
    const SLIDER_WIDTH = SCREEN_WIDTH - (SPACING.xxl * 2);
    const SLIDE_THRESHOLD = SLIDER_WIDTH * 0.75;
    const translateX = useSharedValue(0);
    const [completed, setCompleted] = useState(false);

    const gesture = Gesture.Pan()
        .onUpdate((e) => {
            if (completed) return;
            translateX.value = Math.max(0, Math.min(e.translationX, SLIDER_WIDTH - 65));
        })
        .onEnd(() => {
            if (completed) return;
            if (translateX.value >= SLIDE_THRESHOLD) {
                translateX.value = withSpring(SLIDER_WIDTH - 65);
                runOnJS(HapticPatterns.success)();
                runOnJS(setCompleted)(true);
                setTimeout(() => runOnJS(onComplete)(), 300);
            } else {
                translateX.value = withSpring(0);
                runOnJS(HapticPatterns.light)();
            }
        });

    const sliderStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const textOpacity = useAnimatedStyle(() => ({
        opacity: Math.max(0, 1 - (translateX.value / SLIDER_WIDTH) * 2),
    }));

    return (
        <View style={[styles.slideContainer, { backgroundColor: theme.bgElevated, borderColor: theme.primary }]}>
            <Animated.View style={[styles.slideTextContainer, textOpacity]}>
                <Text style={[styles.slideText, { color: theme.primary }]}>{label}</Text>
            </Animated.View>
            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.slider, sliderStyle, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                    {icon === 'check' ? (
                        <Check size={28} color={theme.bg} strokeWidth={3} />
                    ) : (
                        <ChevronRight size={28} color={theme.bg} strokeWidth={3} />
                    )}
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: SPACING.xxl,
        justifyContent: 'center',
    },
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        borderWidth: 1,
    },
    stepLabel: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        letterSpacing: 2,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: SPACING.md,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: SPACING.md,
    },
    inputWrapper: {
        width: '100%',
        marginTop: SPACING.xxl,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        borderWidth: 1,
    },
    blurInput: {
        padding: SPACING.lg,
    },
    input: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        textAlign: 'center',
    },
    moneyContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: SPACING.xxl,
    },
    currencySymbol: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        marginTop: 8,
        marginRight: 4,
    },
    moneyText: {
        fontSize: 56,
        fontFamily: FONTS.bold,
        letterSpacing: -1,
    },
    stampContainer: {
        marginTop: SPACING.xxl,
        transform: [{ rotate: '-5deg' }],
    },
    stamp: {
        borderWidth: 4,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    stampText: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        letterSpacing: 2,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: RADIUS.full,
        gap: 8,
        marginTop: SPACING.xxxl,
        width: '100%',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    slideContainer: {
        width: '100%',
        height: 70,
        borderRadius: RADIUS.full,
        marginTop: SPACING.xxxl,
        position: 'relative',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 2,
    },
    slideTextContainer: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    slideText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    slider: {
        width: 60,
        height: 60,
        borderRadius: 30,
        position: 'absolute',
        left: 5,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
});
