// Gradient presets for consistent design
export const GRADIENTS = {
    // Portfolio & stats
    portfolio: ['#06B6D4', '#0891B2'] as const,
    portfolioSubtle: ['#0A0A0A', '#141414'] as const,

    // Gains & losses
    gain: ['#10B981', '#059669'] as const,
    gainSubtle: ['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0.1)'] as const,
    loss: ['#EF4444', '#DC2626'] as const,
    lossSubtle: ['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.1)'] as const,

    // Rankings
    gold: ['#FBBF24', '#F59E0B'] as const,
    silver: ['#9CA3AF', '#6B7280'] as const,
    bronze: ['#CD7F32', '#92400E'] as const,

    // Actions
    buy: ['#10B981', '#059669'] as const,
    sell: ['#FBBF24', '#F59E0B'] as const,

    // Default glass
    glass: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'] as const,
    glassStrong: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as const,
};

// Emoji icons for stocks
export const STOCK_EMOJIS: Record<string, string> = {
    // Tech
    AAPL: '🍎',
    MSFT: '💻',
    GOOGL: '🔍',
    META: '📘',
    AMZN: '📦',
    NVDA: '🎮',
    TSLA: '🚗',
    AMD: '⚡',
    INTC: '🔧',

    // Finance
    JPM: '🏦',
    BAC: '💳',
    GS: '💰',
    MS: '📊',
    WFC: '🏛️',

    // Healthcare
    JNJ: '💊',
    PFE: '💉',
    UNH: '🏥',
    ABBV: '🔬',

    // Energy
    XOM: '⛽',
    CVX: '🛢️',

    // Crypto
    BTC: '🪙',
    ETH: '💎',

    // Default
    DEFAULT: '📈',
};

export const getStockEmoji = (symbol: string): string => {
    return STOCK_EMOJIS[symbol] || STOCK_EMOJIS.DEFAULT;
};
