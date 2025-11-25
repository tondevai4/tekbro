import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // In production, this is where you'd send to error tracking service
        // e.g., Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <AlertTriangle size={64} color={COLORS.negative} />
                        </View>

                        <Text style={styles.title}>Something went wrong</Text>

                        <Text style={styles.message}>
                            {this.props.fallbackMessage ||
                                "We're sorry, but something unexpected happened. Please try again."}
                        </Text>

                        {__DEV__ && this.state.error && (
                            <View style={styles.errorDetails}>
                                <Text style={styles.errorText}>
                                    {this.state.error.toString()}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={this.handleReset}
                            activeOpacity={0.7}
                        >
                            <RefreshCw size={20} color={COLORS.background} />
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
    },
    iconContainer: {
        marginBottom: SPACING.xl,
        opacity: 0.8,
    },
    title: {
        fontSize: FONTS.sizes.xxl,
        fontFamily: FONTS.weights.bold,
        color: COLORS.text,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    message: {
        fontSize: FONTS.sizes.md,
        fontFamily: FONTS.weights.regular,
        color: COLORS.textSub,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 24,
    },
    errorDetails: {
        backgroundColor: COLORS.card,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.xl,
        maxWidth: '100%',
    },
    errorText: {
        fontSize: FONTS.sizes.xs,
        fontFamily: 'monospace',
        color: COLORS.negative,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        gap: SPACING.sm,
    },
    buttonText: {
        fontSize: FONTS.sizes.md,
        fontFamily: FONTS.weights.bold,
        color: COLORS.background,
    },
});
