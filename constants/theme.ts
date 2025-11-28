// MODERN 2024/2025 DESIGN SYSTEM
// Inspired by: Linear, Stripe, Arc, Vercel

export type ThemeType = 'midnight' | 'ocean' | 'sunset' | 'forest';

export const MIDNIGHT_THEME = {
    id: 'midnight',
    label: 'Midnight',
    // Backgrounds - Pure, deep blacks
    bg: '#000000',
    bgElevated: '#0A0A0A',
    bgSubtle: '#141414',
    card: '#111111',
    cardHighlight: '#1A1A1A',

    // Borders
    border: '#1F1F1F',
    borderHover: '#2A2A2A',
    borderLight: '#1F1F1F',

    // Text
    text: '#FFFFFF',
    textSub: '#8F8F8F',
    textMuted: '#555555',
    textSecondary: '#A1A1AA',
    textTertiary: '#52525B',
    background: '#000000',

    // Accent - Cyan
    accent: '#06B6D4',
    accentHover: '#0891B2',
    accentSubtle: '#06B6D410',
    primary: '#06B6D4',

    // Semantic
    positive: '#10B981',
    positiveSubtle: '#10B98110',
    success: '#10B981',
    successDim: '#10B98110',
    negative: '#EF4444',
    negativeSubtle: '#EF444410',
    error: '#EF4444',
    warning: '#F59E0B',
    warningSubtle: '#F59E0B10',
    warningDim: '#F59E0B10',
    danger: '#EF4444',
    chartUp: '#10B981',
    chartDown: '#EF4444',
    white: '#FFFFFF',
    cardGradient: ['#0f172a', '#1e1b4b', '#312e81'] as const,
};

export const OCEAN_THEME = {
    id: 'ocean',
    label: 'Ocean',
    bg: '#020617', // Slate 950
    bgElevated: '#0F172A', // Slate 900
    bgSubtle: '#1E293B', // Slate 800
    card: '#0F172A',
    cardHighlight: '#1E293B',

    border: '#1E293B',
    borderHover: '#334155',
    borderLight: '#1E293B',

    text: '#F8FAFC', // Slate 50
    textSub: '#94A3B8', // Slate 400
    textMuted: '#64748B', // Slate 500
    textSecondary: '#CBD5E1', // Slate 300
    textTertiary: '#475569', // Slate 600
    background: '#020617',

    accent: '#38BDF8', // Sky 400
    accentHover: '#0EA5E9', // Sky 500
    accentSubtle: '#38BDF810',
    primary: '#38BDF8',

    positive: '#2DD4BF', // Teal 400
    positiveSubtle: '#2DD4BF10',
    success: '#2DD4BF',
    successDim: '#2DD4BF10',
    negative: '#F87171', // Red 400
    negativeSubtle: '#F8717110',
    error: '#F87171',
    warning: '#FBBF24', // Amber 400
    warningSubtle: '#FBBF2410',
    warningDim: '#FBBF2410',
    danger: '#F87171',
    chartUp: '#2DD4BF',
    chartDown: '#F87171',
    white: '#FFFFFF',
    cardGradient: ['#0c4a6e', '#075985', '#0369a1'] as const,
};

export const SUNSET_THEME = {
    id: 'sunset',
    label: 'Sunset',
    bg: '#180818', // Deep Purple/Black
    bgElevated: '#240A24',
    bgSubtle: '#301030',
    card: '#240A24',
    cardHighlight: '#301030',

    border: '#3D153D',
    borderHover: '#521C52',
    borderLight: '#3D153D',

    text: '#FDF4FF', // Fuchsia 50
    textSub: '#E879F9', // Fuchsia 400 (Muted)
    textMuted: '#A21CAF', // Fuchsia 700
    textSecondary: '#F0ABFC', // Fuchsia 300
    textTertiary: '#86198F', // Fuchsia 800
    background: '#180818',

    accent: '#F472B6', // Pink 400
    accentHover: '#EC4899', // Pink 500
    accentSubtle: '#F472B610',
    primary: '#F472B6',

    positive: '#34D399', // Emerald 400
    positiveSubtle: '#34D39910',
    success: '#34D399',
    successDim: '#34D39910',
    negative: '#FB7185', // Rose 400
    negativeSubtle: '#FB718510',
    error: '#FB7185',
    warning: '#FBBF24',
    warningSubtle: '#FBBF2410',
    warningDim: '#FBBF2410',
    danger: '#FB7185',
    chartUp: '#34D399',
    chartDown: '#FB7185',
    white: '#FFFFFF',
    cardGradient: ['#4a044e', '#701a75', '#86198f'] as const,
};

export const FOREST_THEME = {
    id: 'forest',
    label: 'Forest',
    bg: '#020A05', // Deep Green/Black
    bgElevated: '#05140A',
    bgSubtle: '#0A2112',
    card: '#05140A',
    cardHighlight: '#0A2112',

    border: '#112F1B',
    borderHover: '#1A4228',
    borderLight: '#112F1B',

    text: '#ECFDF5', // Emerald 50
    textSub: '#6EE7B7', // Emerald 300
    textMuted: '#059669', // Emerald 600
    textSecondary: '#A7F3D0', // Emerald 200
    textTertiary: '#047857', // Emerald 700
    background: '#020A05',

    accent: '#10B981', // Emerald 500
    accentHover: '#059669', // Emerald 600
    accentSubtle: '#10B98110',
    primary: '#10B981',

    positive: '#4ADE80', // Green 400
    positiveSubtle: '#4ADE8010',
    success: '#4ADE80',
    successDim: '#4ADE8010',
    negative: '#F87171',
    negativeSubtle: '#F8717110',
    error: '#F87171',
    warning: '#FACC15', // Yellow 400
    warningSubtle: '#FACC1510',
    warningDim: '#FACC1510',
    danger: '#F87171',
    chartUp: '#4ADE80',
    chartDown: '#F87171',
    white: '#FFFFFF',
    cardGradient: ['#064e3b', '#065f46', '#047857'] as const,
};

// Default export for backward compatibility during refactor
export const COLORS = MIDNIGHT_THEME;

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
