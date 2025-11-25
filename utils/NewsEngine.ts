import { Stock, NewsEvent } from '../types';

// Company-specific news templates
const COMPANY_NEWS_TEMPLATES: Record<string, string[]> = {
    'NVDA': [
        '🎮 NVIDIA announces next-gen AI chips - massive performance boost expected',
        '💻 NVIDIA partners with major cloud providers - revenue surge anticipated',
        '🚀 NVIDIA GPU shortage eases - production ramping up',
        '📊 NVIDIA beats earnings expectations by 20%'
    ],
    'PLTR': [
        '🏛️ Palantir wins $500M government contract',
        '🤝 Palantir expands enterprise AI platform - major clients signed',
        '📈 Palantir revenue growth accelerates in latest quarter',
        '🔒 Palantir debuts new cybersecurity suite'
    ],
    'TSLA': [
        '🚗 Tesla delivers record number of vehicles this quarter',
        '🔋 Tesla reveals new battery technology - 50% more range',
        '🏗️ Tesla opens new Gigafactory - production capacity doubles',
        '🤖 Tesla FSD update impresses analysts'
    ],
    'AAPL': [
        '📱 Apple unveils revolutionary iPhone with AI features',
        '💰 Apple announces record-breaking quarter',
        '🎧 Apple Vision Pro sales exceed expectations',
        '🌍 Apple expands into new international markets'
    ],
    'MSFT': [
        '☁️ Microsoft Cloud revenue surges 25% year-over-year',
        '🤖 Microsoft AI products gain major enterprise adoption',
        '🎮 Xbox Game Pass hits 50M subscribers',
        '💼 Microsoft wins $10B enterprise AI contract'
    ],
    'AMZN': [
        '📦 Amazon Prime Day shatters all previous records',
        '🤖 Amazon robotics transformation doubles warehouse efficiency',
        '🎬 Amazon Studios wins multiple awards - streaming surge',
        '☁️ AWS expands with new data centers globally'
    ],
    'META': [
        '🥽 Meta Quest VR sales triple - metaverse momentum',
        '📈 Meta ad revenue beats estimates by 18%',
        '🤖 Meta AI assistant reaches 100M users',
        '💰 Meta announces $50B buyback program'
    ],
    'GOOGL': [
        '🔍 Google Search AI features drive engagement spike',
        '☁️ Google Cloud wins major Fortune 500 contracts',
        '🤖 Google Gemini AI outperforms competitors in benchmarks',
        '📱 Android market share reaches all-time high'
    ]
};

// Sector news templates
const SECTOR_NEWS: Record<string, string[]> = {
    'Tech': [
        '💻 Tech sector rallies on strong earnings season',
        '📉 Tech stocks dip on regulatory concerns',
        '🚀 AI boom drives tech valuations higher',
        '💰 Tech giants announce increased R&D spending'
    ],
    'Finance': [
        '🏦 Banking sector strengthens on rate policy',
        '💳 Fintech innovation drives sector growth',
        '📊 Financial stocks surge on GDP data',
        '⚠️ Banking sector faces headwinds from credit concerns'
    ],
    'Healthcare': [
        '🏥 Healthcare sector boosted by breakthrough drug approvals',
        '💊 Pharma stocks rally on Medicare reform talks',
        '🔬 Biotech sector gains on promising trial results',
        '⚕️ Healthcare ETFs hit record highs'
    ],
    'Energy': [
        '⚡ Oil prices surge - energy stocks benefit',
        '♻️ Renewable energy stocks soar on new subsidies',
        '🛢️ OPEC production cuts support energy sector',
        '🌍 Energy crisis in Europe boosts US producers'
    ],
    'Crypto': [
        '🪙 Bitcoin surges past key resistance level',
        '📉 Crypto sector pulls back on regulatory news',
        '🚀 Institutional adoption drives crypto rally',
        '⛏️ Bitcoin mining profitability hits 2-year high'
    ]
};

// Market-wide events
const MARKET_EVENTS: Array<{ headline: string; impact: number }> = [
    { headline: '📈 Bull market continues - S&P 500 hits new all-time high', impact: 0.05 },
    { headline: '📉 Market correction underway - investors take profits', impact: -0.04 },
    { headline: '💹 Trading volume surges - retail investors flooding in', impact: 0.03 },
    { headline: '🎯 Market volatility spikes - prepare for swings', impact: 0 },
    { headline: '🚀 Market sentiment extremely bullish - opportunities abound', impact: 0.06 },
    { headline: '⚠️ Market overbought - experts warn of pullback', impact: -0.03 }
];

// Economic indicators
const ECONOMIC_NEWS: Array<{ headline: string; impact: number }> = [
    { headline: '📊 Fed keeps rates steady - markets rally', impact: 0.04 },
    { headline: '📈 GDP growth exceeds expectations', impact: 0.05 },
    { headline: '💼 Unemployment falls to decade low', impact: 0.03 },
    { headline: '📉 Inflation data shows cooling - positive for stocks', impact: 0.04 },
    { headline: '⚠️ Fed signals potential rate hike - caution advised', impact: -0.03 },
    { headline: '🌍 Trade deal announced - global markets surge', impact: 0.06 },
    { headline: '💰 Consumer spending hits record levels', impact: 0.04 }
];

export function generateNewsEvent(stocks: Stock[]): NewsEvent | null {
    const random = Math.random();

    // 40% company news, 25% sector news, 20% market, 15% economic
    if (random < 0.40) {
        // Company-specific news
        const eligibleStocks = stocks.filter(s => COMPANY_NEWS_TEMPLATES[s.symbol]);
        if (eligibleStocks.length > 0) {
            const stock = eligibleStocks[Math.floor(Math.random() * eligibleStocks.length)];
            const templates = COMPANY_NEWS_TEMPLATES[stock.symbol];
            const headline = templates[Math.floor(Math.random() * templates.length)];

            // Determine impact and suggestion
            const isPositive = Math.random() > 0.3; // 70% positive news
            const impact = isPositive
                ? 0.05 + Math.random() * 0.10
                : -(0.05 + Math.random() * 0.10);

            return {
                id: `news-${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
                type: 'COMPANY',
                severity: Math.abs(impact) > 0.10 ? 'HIGH' : Math.abs(impact) > 0.07 ? 'MEDIUM' : 'LOW',
                headline,
                symbol: stock.symbol,
                impact,
                suggestion: impact > 0.08 ? 'BUY' : impact < -0.08 ? 'SELL' : 'HOLD'
            };
        }
    } else if (random < 0.65) {
        // Sector news
        const sectors = Object.keys(SECTOR_NEWS);
        const sector = sectors[Math.floor(Math.random() * sectors.length)];
        const templates = SECTOR_NEWS[sector];
        const headline = templates[Math.floor(Math.random() * templates.length)];

        const isPositive = Math.random() > 0.35;
        const impact = isPositive
            ? 0.03 + Math.random() * 0.05
            : -(0.03 + Math.random() * 0.05);

        return {
            id: `news-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            type: 'SECTOR',
            severity: 'MEDIUM',
            headline,
            sector,
            impact,
            suggestion: impact > 0.05 ? 'BUY' : impact < -0.05 ? 'SELL' : 'HOLD'
        };
    } else if (random < 0.85) {
        // Market-wide event
        const event = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
        return {
            id: `news-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            type: 'MARKET',
            severity: Math.abs(event.impact) > 0.04 ? 'HIGH' : 'MEDIUM',
            headline: event.headline,
            impact: event.impact
        };
    } else {
        // Economic news
        const event = ECONOMIC_NEWS[Math.floor(Math.random() * ECONOMIC_NEWS.length)];
        return {
            id: `news-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            type: 'ECONOMIC',
            severity: Math.abs(event.impact) > 0.04 ? 'HIGH' : 'MEDIUM',
            headline: event.headline,
            impact: event.impact
        };
    }

    return null;
}

/**
 * Determine if we should generate news based on time
 * MINIMUM 3 MINUTES between news events
 */
export function shouldGenerateNews(
    lastNewsTime: number,
    marketVolatility?: number,
    userActivity?: number
): boolean {
    const timeSinceLastNews = Date.now() - lastNewsTime;

    // MINIMUM 3 MINUTES between news events (180,000ms)
    const MIN_NEWS_INTERVAL = 3 * 60 * 1000;

    if (timeSinceLastNews < MIN_NEWS_INTERVAL) {
        return false; // Too soon, don't generate
    }

    // After 3 minutes, generate news
    return true;
}

/**
 * Calculate market volatility from stock price movements
 */
export function calculateMarketVolatility(stocks: Stock[]): number {
    if (stocks.length === 0) return 1;

    let totalVolatility = 0;
    let count = 0;

    stocks.forEach(stock => {
        if (stock.history.length >= 2) {
            const recent = stock.history[stock.history.length - 1].value;
            const previous = stock.history[stock.history.length - 2].value;
            const change = Math.abs((recent - previous) / previous);
            totalVolatility += change;
            count++;
        }
    });

    if (count === 0) return 1;

    // Normalize to 0-2 range (1 = normal, 2 = very volatile)
    const avgVolatility = totalVolatility / count;
    return Math.min(2, 1 + avgVolatility * 20);
}

/**
 * Calculate user activity level (0-1)
 */
export function calculateUserActivity(
    recentTrades: number,
    timeSinceLastTrade: number
): number {
    // Recent trades boost activity
    const tradeScore = Math.min(1, recentTrades / 5);

    // Time decay
    const timeScore = Math.max(0, 1 - (timeSinceLastTrade / 60000)); // Decay over 1 minute

    return (tradeScore * 0.6 + timeScore * 0.4);
}

export function calculateNewsImpact(currentPrice: number, event: NewsEvent, symbol: string, sector: string): number {
    let impactFactor = 0;

    if (event.type === 'COMPANY' && event.symbol === symbol) {
        // Direct company news - full impact
        impactFactor = event.impact;
    } else if (event.type === 'SECTOR' && event.sector === sector) {
        // Sector news - reduced impact
        impactFactor = event.impact;
    } else if (event.type === 'MARKET' || event.type === 'ECONOMIC') {
        // Market-wide - small impact
        impactFactor = event.impact;
    }

    return currentPrice * (1 + impactFactor);
}
