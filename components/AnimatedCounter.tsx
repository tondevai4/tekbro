import React, { useEffect, useState } from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { runOnJS, useSharedValue, withTiming, Easing, useAnimatedReaction, withDelay } from 'react-native-reanimated';

interface AnimatedCounterProps extends TextProps {
    value: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
    delay?: number;
    style?: TextStyle | TextStyle[];
    formatter?: (val: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    prefix = '',
    suffix = '',
    duration = 800,
    delay = 0,
    style,
    formatter,
    ...props
}) => {
    const [displayValue, setDisplayValue] = useState(value);
    const animatedValue = useSharedValue(value);

    useEffect(() => {
        animatedValue.value = withDelay(
            delay,
            withTiming(value, {
                duration,
                easing: Easing.out(Easing.exp),
            })
        );
    }, [value, delay]);

    useAnimatedReaction(
        () => animatedValue.value,
        (currentValue) => {
            runOnJS(setDisplayValue)(currentValue);
        }
    );

    const formatted = formatter
        ? formatter(displayValue)
        : `${prefix}${Math.floor(displayValue).toLocaleString()}${suffix}`;

    return (
        <Text style={[styles.text, style]} {...props}>
            {formatted}
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        // Standard text styles
    }
});
