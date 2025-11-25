import { Animated, Easing } from 'react-native';

// Standard spring config optimized for 120Hz displays
export const springConfig = {
    tension: 300,
    friction: 20,
    useNativeDriver: true,
};

// High-performance timing config for smooth animations
export const timingConfig = {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Material Design easing
    useNativeDriver: true,
};

// Fade animations
export const fadeIn = (value: Animated.Value, delay = 0, duration = 300) => {
    return Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
    });
};

export const fadeOut = (value: Animated.Value, duration = 200) => {
    return Animated.timing(value, {
        toValue: 0,
        duration,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
    });
};

// Scale animations
export const scaleIn = (value: Animated.Value) => {
    return Animated.spring(value, {
        toValue: 1,
        ...springConfig,
    });
};

export const scaleOut = (value: Animated.Value) => {
    return Animated.spring(value, {
        toValue: 0.8,
        ...springConfig,
    });
};

// Smooth press animation for buttons
export const pressAnimation = (scale: Animated.Value) => {
    return Animated.sequence([
        Animated.spring(scale, {
            toValue: 0.95,
            tension: 400,
            friction: 15,
            useNativeDriver: true,
        }),
        Animated.spring(scale, {
            toValue: 1,
            tension: 400,
            friction: 15,
            useNativeDriver: true,
        }),
    ]);
};

// Slide animations
export const slideInFromRight = (value: Animated.Value, duration = 300) => {
    return Animated.timing(value, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
    });
};

export const slideInFromLeft = (value: Animated.Value, duration = 300) => {
    return Animated.timing(value, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
    });
};

export const slideInFromBottom = (value: Animated.Value, duration = 400) => {
    return Animated.spring(value, {
        toValue: 0,
        tension: 280,
        friction: 22,
        useNativeDriver: true,
    });
};

// Staggered animations for lists
export const staggeredFadeIn = (
    values: Animated.Value[],
    staggerDelay = 50,
    itemDuration = 300
) => {
    return Animated.stagger(
        staggerDelay,
        values.map((value) => fadeIn(value, 0, itemDuration))
    );
};

// Bounce animation
export const bounceAnimation = (value: Animated.Value) => {
    return Animated.sequence([
        Animated.spring(value, {
            toValue: 1.1,
            tension: 400,
            friction: 10,
            useNativeDriver: true,
        }),
        Animated.spring(value, {
            toValue: 1,
            tension: 400,
            friction: 15,
            useNativeDriver: true,
        }),
    ]);
};

// Shake animation for errors
export const shakeAnimation = (value: Animated.Value) => {
    return Animated.sequence([
        Animated.timing(value, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(value, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(value, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]);
};

// Pulse animation for notifications
export const pulseAnimation = (value: Animated.Value) => {
    return Animated.loop(
        Animated.sequence([
            Animated.timing(value, {
                toValue: 1.05,
                duration: 800,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: 1,
                duration: 800,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ])
    );
};

// Rotation animation
export const rotateAnimation = (value: Animated.Value, toValue = 1, duration = 1000) => {
    return Animated.loop(
        Animated.timing(value, {
            toValue,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
        })
    );
};

// Helper to create interpolated rotation
export const interpolateRotation = (value: Animated.Value) => {
    return value.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
};

// Helper for smooth opacity transitions
export const smoothOpacity = (value: Animated.Value) => {
    return value.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });
};

// Easing functions for different use cases
export const customEasing = {
    // Snappy for buttons
    snappy: Easing.bezier(0.4, 0.0, 0.2, 1),
    // Smooth for cards
    smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
    // Bouncy for celebrations
    bouncy: Easing.bezier(0.68, -0.55, 0.265, 1.55),
};
