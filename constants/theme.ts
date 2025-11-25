// MODERN 2024/2025 DESIGN SYSTEM
// Inspired by: Linear, Stripe, Arc, Vercel

export const DARK_THEME = {
    // Backgrounds - Pure, deep blacks
    bg: '#000000',
    bgElevated: '#0A0A0A',
    bgSubtle: '#141414',
    card: '#111111', // Slightly lighter than bgElevated for cards

    // Borders - Subtle, refined
    border: '#1F1F1F',
    borderHover: '#2A2A2A',
    borderLight: '#1F1F1F', // Alias

    // Text - High contrast hierarchy
    text: '#FFFFFF',
    textSub: '#8F8F8F',
    textMuted: '#555555',
    textSecondary: '#A1A1AA', // Alias for better readability
    textTertiary: '#52525B', // Alias
    background: '#000000', // Alias

    // Accent - Single, refined cyan
    accent: '#06B6D4', // Tailwind cyan-500
    accentHover: '#0891B2',
    accentSubtle: '#06B6D410',
    primary: '#06B6D4', // Alias

    // Semantic colors
    positive: '#10B981', // Green-500
    positiveSubtle: '#10B98110',
    success: '#10B981', // Alias
    successDim: '#10B98110', // Alias

    negative: '#EF4444', // Red-500
    negativeSubtle: '#EF444410',

    warning: '#F59E0B', // Amber-500
    warningSubtle: '#F59E0B10',
    warningDim: '#F59E0B10', // Alias
};

export const LIGHT_THEME = {
    // Backgrounds - Crisp whites
    bg: '#FFFFFF',
    bgElevated: '#FAFAFA',
    bgSubtle: '#F5F5F5',
    card: '#FFFFFF',

    // Borders
    border: '#E5E5E5',
    borderHover: '#D4D4D4',
    borderLight: '#E5E5E5',

    // Text
    text: '#0A0A0A',
    textSub: '#737373',
    textMuted: '#A3A3A3',
    textSecondary: '#52525B',
    textTertiary: '#A1A1AA',
    background: '#FFFFFF',

    // Accent
    accent: '#0891B2',
    accentHover: '#0E7490',
    accentSubtle: '#0891B210',
    primary: '#0891B2',

    // Semantic
    positive: '#059669',
    positiveSubtle: '#05966910',
    success: '#059669',
    successDim: '#05966910',

    negative: '#DC2626',
    negativeSubtle: '#DC262610',

    warning: '#D97706',
    warningSubtle: '#D9770610',
    warningDim: '#D9770610',
};

export const COLORS = DARK_THEME;

export const FONTS = {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
    },
    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// Modern radius system
export const RADIUS = {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
};

// No heavy shadows - just subtle elevations
export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
};
