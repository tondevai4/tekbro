/**
 * Analytics Service
 * 
 * Centralized analytics tracking for PaperTrader.
 * Currently set up for future integration with providers like:
 * - Sentry (crash reporting)
 * - Firebase Analytics
 * - Amplitude
 * 
 * All events are logged to console in development.
 * In production, they'll be sent to your analytics provider.
 */

export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
}

export interface UserProperties {
    userId?: string;
    level?: number;
    totalTrades?: number;
    portfolioValue?: number;
}

class Analytics {
    private isEnabled: boolean = __DEV__ ? false : true;
    private userId: string | null = null;

    /**
     * Initialize analytics with user properties
     */
    init(userId?: string) {
        this.userId = userId || null;

        if (__DEV__) {
            console.log('[Analytics] Initialized', { userId: this.userId });
        }

        // TODO: Initialize your analytics providers here
        // Example: Sentry.init({ dsn: '...', environment: __DEV__ ? 'development' : 'production' });
        // Example: firebase.analytics().setAnalyticsCollectionEnabled(true);
    }

    /**
     * Track a custom event
     */
    trackEvent(eventName: string, properties?: Record<string, any>) {
        if (!this.isEnabled && !__DEV__) return;

        const event: AnalyticsEvent = {
            name: eventName,
            properties: {
                ...properties,
                timestamp: Date.now(),
                userId: this.userId,
            },
        };

        if (__DEV__) {
            console.log('[Analytics] Event:', event.name, event.properties);
        }

        // TODO: Send to your analytics provider
        // Example: firebase.analytics().logEvent(eventName, properties);
        // Example: amplitude.logEvent(eventName, properties);
    }

    /**
     * Set user properties
     */
    setUserProperties(properties: UserProperties) {
        if (!this.isEnabled && !__DEV__) return;

        if (__DEV__) {
            console.log('[Analytics] User Properties:', properties);
        }

        // TODO: Set user properties in your analytics provider
        // Example: firebase.analytics().setUserProperties(properties);
        // Example: amplitude.setUserProperties(properties);
    }

    /**
     * Track screen view
     */
    trackScreenView(screenName: string, properties?: Record<string, any>) {
        this.trackEvent('screen_view', {
            screen_name: screenName,
            ...properties,
        });
    }

    /**
     * Track app opened
     */
    trackAppOpened() {
        this.trackEvent('app_opened');
    }

    /**
     * Track trade execution
     */
    trackTrade(type: 'BUY' | 'SELL', symbol: string, quantity: number, price: number) {
        this.trackEvent('trade_executed', {
            type,
            symbol,
            quantity,
            price,
            total_value: quantity * price,
        });
    }

    /**
     * Track challenge events
     */
    trackChallengeStarted(challengeType: string) {
        this.trackEvent('challenge_started', {
            challenge_type: challengeType,
        });
    }

    trackChallengeCompleted(challengeType: string, reward: { xp: number; cash?: number }) {
        this.trackEvent('challenge_completed', {
            challenge_type: challengeType,
            xp_reward: reward.xp,
            cash_reward: reward.cash || 0,
        });
    }

    /**
     * Track achievement unlocked
     */
    trackAchievementUnlocked(achievementId: string, tier: string, xpReward: number) {
        this.trackEvent('achievement_unlocked', {
            achievement_id: achievementId,
            tier,
            xp_reward: xpReward,
        });
    }

    /**
     * Track errors (for crash reporting)
     */
    trackError(error: Error, context?: Record<string, any>) {
        if (__DEV__) {
            console.error('[Analytics] Error:', error.message, context);
        }

        // TODO: Send to crash reporting service
        // Example: Sentry.captureException(error, { contexts: { custom: context } });
    }

    /**
     * Enable/disable analytics (for privacy settings)
     */
    setEnabled(enabled: boolean) {
        this.isEnabled = enabled;

        if (__DEV__) {
            console.log('[Analytics] Enabled:', enabled);
        }
    }
}

// Export singleton instance
export const analytics = new Analytics();
