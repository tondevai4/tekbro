// Simplified types for Phase 1
export interface PricePoint {
    timestamp: number;
    value: number;
}

export interface Stock {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change: number; // Daily change percent
    history: PricePoint[];
    sector: 'Tech' | 'Finance' | 'Healthcare' | 'Consumer' | 'Energy' | 'Real Estate' | 'Crypto';
    marketCap: number;
    volatility: number; // 0.01-0.10 scale (1%-10% daily volatility)
    description: string;
    icon?: string; // Emoji icon
}


export interface PortfolioItem {
    symbol: string;
    quantity: number;
    averagePrice: number;
    averageCost: number; // Keep both for compatibility if needed, or consolidate.
}

export interface Trade {
    id: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    timestamp: number;
    pnl?: number;
    pnlPercent?: number;
}

// Sprint 2: Achievement type
export interface AchievementCondition {
    type: 'netWorth' | 'trades' | 'profit_trade' | 'gain_percent' | 'quick_profit' | 'hold_duration' | 'win_streak' | 'win_rate' | 'concentration' | 'diversity' | 'crypto_own' | 'crypto_value' | 'penny_profit' | 'trade_size' | 'low_cash' | 'loss_percent' | 'netWorth_low' | 'comeback' | 'time_trade' | 'no_sell_streak' | 'profit_total' | 'loss_total' | 'login_streak';
    value: number;
}

export interface AchievementTemplate {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    category: 'Wealth' | 'Trading' | 'Mastery' | 'Risk' | 'Secret' | 'Portfolio' | 'Social' | 'Milestones';
    condition: AchievementCondition;
    tier?: 'bronze' | 'silver' | 'gold';
    target?: number;
}

export interface Achievement extends AchievementTemplate {
    unlocked: boolean;
    progress: number;
    target: number; // Required in state
    tier: 'bronze' | 'silver' | 'gold'; // Required in state
}

export interface NewsItem {
    id: string;
    headline: string;
    timestamp: number;
}

export interface PriceAlert {
    id: string;
    symbol: string;
    targetPrice: number;
    type: 'ABOVE' | 'BELOW';
    active: boolean;
}


export interface DailyChallenge {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    description: string;
    type: 'profit' | 'volume' | 'sector' | 'streak' | 'growth';
    target: number;
    progress: number;
    reward: {
        xp: number;
        cash?: number;
    };
    completed: boolean;
    icon?: string; // Emoji icon
}

export interface DailyChallenges {
    date: string; // YYYY-MM-DD format
    challenges: DailyChallenge[];
}


export interface LeaderboardEntry {
    id: string;
    username: string;
    equity: number;
    level: number;
    isUser?: boolean;
    rank?: number;
    achievementsUnlocked: number;
    timestamp?: number;
}

export interface NewsEvent {
    id: string;
    timestamp: number;
    type: 'COMPANY' | 'SECTOR' | 'MARKET' | 'ECONOMIC';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    headline: string;
    symbol?: string; // For company-specific news
    sector?: string; // For sector news
    impact: number; // -1 to 1 (negative to positive)
    suggestion?: 'BUY' | 'SELL' | 'HOLD';
}

export interface AppState {
    // Core state
    cash: number;
    holdings: Record<string, PortfolioItem>;
    stocks: Stock[];
    trades: Trade[];
    achievements: Achievement[];
    watchlist: string[];
    news: NewsItem[];
    alerts: PriceAlert[];
    xp: number;
    level: number;
    username: string;
    avatar: string;
    dailyChallenges: DailyChallenges | null;
    loginStreak: number;
    lastLoginDate: string;
    highScore: number;
    leaderboard: LeaderboardEntry[];
    onboardingCompleted: boolean;
    equityHistory: PricePoint[];
    activeNews: NewsEvent | null;
    marketSentiment: number;

    // Actions
    buyStock: (symbol: string, quantity: number, price: number) => void;
    sellStock: (symbol: string, quantity: number, price: number) => void;
    updateStockPrice: (symbol: string, newPrice: number) => void;
    setStocks: (stocks: Stock[]) => void;
    unlockAchievement: (id: string) => void;
    setNews: (news: NewsItem[]) => void;
    addAlert: (alert: PriceAlert) => void;
    removeAlert: (id: string) => void;
    addXp: (amount: number) => void;
    setProfile: (username: string, avatar: string) => void;
    reset: () => void;
    checkLoginStreak: () => number;
    setActiveNews: (news: NewsEvent | null) => void;
    setMarketSentiment: (sentiment: number) => void;
}

// Crypto Trading Types
export interface Crypto {
    symbol: string;
    name: string;
    price: number;
    change24h: number; // Daily change percent
    basePrice: number; // Initial price for reset
    openPrice: number; // Session opening price for % calculation
    minPrice?: number; // Safety Floor (optional)
    history: PricePoint[];
    volatility: number; // 0.03-0.10 (3%-10% per tick)
    logo?: any; // PNG image require
    description?: string;
    educational?: string; // Educational content for tooltips
}

export interface CryptoHolding {
    symbol: string;
    quantity: number;
    averageCost: number;
    leverage: number; // 1, 2, 5, or 10
    liquidationPrice?: number; // Only if leveraged (leverage > 1)
    entryPrice?: number; // Price when position was opened
}

export interface OHLC {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
}
