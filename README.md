# 📈 PaperTrader

> **Master stock trading with zero risk.** A realistic stock market simulator with gamification, achievements, and daily challenges.

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ Features

### 🎮 Gamified Learning Experience
- **Level Up System** - Earn XP and advance through levels as you trade
- **50+ Achievements** - Unlock Bronze, Silver, and Gold tier achievements
- **Daily Challenges** - Complete fresh challenges every day for bonus rewards
- **Login Streaks** - Build momentum with consecutive daily logins
- **Leaderboard** - Compete and track your progress against past performances

### 📊 Realistic Market Simulation
- **Real-time Price Updates** - Market moves every 3 seconds with realistic volatility
- **15+ Stocks** - Trade tech giants, crypto stocks, index funds, and meme stocks
- **Market Sentiment** - Bull and bear market cycles affect all stocks
- **Sector Correlation** - Related stocks move together (Tech, Finance, Healthcare, etc.)
- **News Events** - Breaking news impacts stock prices in real-time
- **Circuit Breakers** - Realistic limits on extreme price movements
- **Mean Reversion** - Prices gravitate toward moving averages

### 💼 Full Trading Features
- **$10,000 Starting Capital** - Virtual cash to build your portfolio
- **Instant Buy/Sell** - Execute trades with haptic feedback
- **Portfolio Tracking** - Monitor your holdings and total equity
- **Trade History** - Review all past transactions with P/L
- **Watchlist** - Star your favorite stocks for quick access
- **Interactive Charts** - Visualize price movements over time

### 🏆 Achievement System

Unlock achievements by:
- **Trading Volume** - Execute your first trade, reach 100+ trades
- **Profit Milestones** - From $100 to $100,000+ in profits
- **Portfolio Growth** - Grow your equity from $15K to $1M+
- **Diversification** - Build a portfolio with 5, 10, 20+ different stocks
- **Win Streaks** - Chain together profitable trades

### 🎯 Daily Challenges

Fresh challenges every day:
- **Volume Trading** - Execute a specific number of trades
- **Profit Goals** - Hit daily profit targets
- **Sector Focus** - Trade specific market sectors
- **Volatility Plays** - Trade high-volatility stocks

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo Go](https://expo.dev/client) app on your phone (iOS or Android)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tonderaiitai8-png/tekbro.git
   cd PaperTrader
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `i` for iOS simulator, `a` for Android emulator

## 📱 Tech Stack

- **Framework:** React Native + Expo
- **Language:** TypeScript
- **State Management:** Zustand
- **Persistence:** AsyncStorage
- **Navigation:** Expo Router (file-based routing)
- **UI Components:** Custom components with Lucide icons
- **Animations:** React Native Animated API
- **Charts:** React Native SVG
- **Haptics:** Expo Haptics
- **Testing:** Jest + React Native Testing Library

## 🎨 Design

- **Theme:** Dark mode with neon green (#00FF9D) and purple (#9D00FF) accents
- **Typography:** System fonts with custom weight variants
- **Animations:** Smooth transitions and micro-interactions
- **Haptic Feedback:** Tactile responses for trades and achievements

## 🏗️ Project Structure

```
PaperTrader/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home (Portfolio + Stats)
│   │   ├── market.tsx       # Market overview
│   │   ├── history.tsx      # Trade history
│   │   └── leaderboard.tsx  # Leaderboard
│   ├── stock/[id].tsx       # Stock detail modal
│   ├── onboarding.tsx       # First-time user flow
│   └── _layout.tsx          # Root layout
├── components/              # Reusable UI components
│   ├── ErrorBoundary.tsx    # Error handling
│   ├── LoadingSkeleton.tsx  # Loading states
│   ├── StockCard.tsx        # Stock list item
│   ├── StockChart.tsx       # Price chart
│   ├── NewsToast.tsx        # News notifications
│   ├── AchievementsSection.tsx
│   ├── DailyChallengeCard.tsx
│   └── ...
├── hooks/                   # Custom React hooks
│   └── useMarketEngine.ts   # Market simulation engine
├── store/                   # Zustand state management
│   └── useStore.ts          # Global app state
├── utils/                   # Utility functions
│   ├── NewsEngine.ts        # News generation
│   ├── analytics.ts         # Analytics service
│   ├── challenges.ts        # Challenge logic
│   └── ...
├── constants/               # App constants
│   ├── theme.ts            # Colors, fonts, spacing
│   ├── stockData.ts        # Stock catalog
│   └── achievements.ts     # Achievement definitions
├── __tests__/              # Unit tests
│   ├── useMarketEngine.test.ts
│   └── NewsEngine.test.ts
└── types.ts                # TypeScript type definitions
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Generate coverage report:

```bash
npm run test:coverage
```

**Test Coverage:**
- Market Engine: 80%+ coverage
- News Engine: 80%+ coverage
- Price bounds validation
- Volatility cycles
- News impact calculations

## 📈 Market Engine

The heart of PaperTrader is a sophisticated market simulation engine featuring:

### Price Movement Algorithm
1. **Base Volatility** - Stock-specific volatility (1-10 scale)
2. **Market Sentiment** - Global bull/bear market influence
3. **Sector Correlation** - Related stocks move together (70% correlation)
4. **Mean Reversion** - Prices return to 10-period moving average
5. **Momentum** - Trending stocks continue trending (30% continuation)
6. **News Impact** - One-time price shocks from breaking news
7. **Circuit Breakers** - Maximum 12% move per update
8. **Support Levels** - Soft floor prevents crashes below 85% of historic low

### News System
- **40%** Company-specific news (AAPL, NVDA, TSLA, etc.)
- **25%** Sector news (Tech, Finance, Healthcare, etc.)
- **20%** Market-wide events
- **15%** Economic indicators

News impacts range from 5-15% price movements.

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Market simulation engine
- [x] Buy/sell functionality
- [x] Portfolio tracking
- [x] Basic UI/UX

### Phase 2: Gamification ✅
- [x] XP and leveling system
- [x] Achievement system (50+ achievements)
- [x] Daily challenges
- [x] Login streaks
- [x] Leaderboard

### Phase 3: Polish & Production ✅
- [x] Error boundaries
- [x] Loading states
- [x] Performance optimizations
- [x] Unit tests (80%+ coverage)
- [x] Analytics integration
- [x] App Store metadata

### Phase 4: Future Enhancements 🔄
- [ ] Options trading
- [ ] Crypto trading
- [ ] Social features (share trades)
- [ ] Advanced charting (candlesticks, indicators)
- [ ] Portfolio analysis tools
- [ ] Educational content
- [ ] Dark mode toggle
- [ ] Onboarding tutorial

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Stock data and company names are fictional/simulated
- Icons by [Lucide](https://lucide.dev/)
- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)

## 📞 Contact

**Developer:** Tonderai Itai  
**GitHub:** [@tonderaiitai8-png](https://github.com/tonderaiitai8-png)

---

**⚠️ Disclaimer:** PaperTrader is a simulation for educational purposes only. It does not use real money or connect to real stock markets. Past performance in the simulator does not guarantee future results in real trading.

**Made with ❤️ and ☕ by Tonderai Itai**
