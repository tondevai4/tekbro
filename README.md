# 📈 PaperTrader: The Ultimate Stock Market Simulation Game

> **A high-performance, gamified stock trading simulator built with React Native and Expo. Practice trading stocks and crypto, complete daily challenges, unlock achievements, and climb the global leaderboard—all in a beautifully designed dark-mode interface.**

---

## ✨ Features

### 🎮 Core Gameplay
- **Real-Time Market Simulation**: Watch 90+ stocks and 10 cryptocurrencies update dynamically with realistic price movements using Geometric Brownian Motion
- **Paper Trading**: Start with £1,000,000 virtual cash and build your portfolio without risking real money
- **Crypto Trading**: Trade Bitcoin, Ethereum, and other major cryptocurrencies with 5x-20x leverage
- **Breaking News System**: React to market-moving news events that impact stock prices in real-time
- **Historical Charts**: View detailed price history and performance metrics for every asset

### 🏆 Gamification
- **56 Achievements**: Unlock achievements across 8 categories (Trading Volume, Profit Goals, Equity Milestones, Diversification, Win Streaks, Login Streaks, Crypto, and Special)
- **XP & Leveling System**: Earn experience points from trades, achievements, and challenges
- **Daily Challenges**: Complete 3 fresh challenges every day (Hard Mode difficulty: 10%+ returns, 24hr time limits)
- **Login Streaks**: Build momentum with daily login rewards
- **Global Leaderboard**: Compete with mock elite traders (top 10 display)

### 📊 Portfolio Management
- **Real-Time Metrics**: Track your total equity, cash balance, P/L, and win rate
- **Diversification Tracking**: Monitor your portfolio composition by sector
- **Performance Analytics**: View detailed stats including total trades, biggest win/loss, and more
- **Advanced Indicators**: RSI, Moving Averages, and Bollinger Bands on stock detail pages

### 🎨 Premium UI/UX
- **Glassmorphism Design**: Modern dark-mode interface with blur effects and vibrant gradients
- **Smooth Animations**: Powered by React Native Reanimated for 60fps performance
- **Haptic Feedback**: Tactile responses for key interactions
- **Confetti Celebrations**: Visual rewards for achievements and level-ups
- **Sound Effects**: Audio feedback for trades and notifications (subtle, premium quality)

---

## 🛠️ Technical Architecture

### Tech Stack
- **Framework**: React Native 0.81 (Expo SDK 54)
- **Language**: TypeScript
- **State Management**: Zustand (global store)
- **Navigation**: Expo Router (file-based routing)
- **UI Performance**: Shopify FlashList, React Native Reanimated
- **Styling**: Custom design system with glassmorphism effects
- **Storage**: AsyncStorage for game state persistence
- **Testing**: Jest + React Native Testing Library

### Performance Optimizations
- **Geometric Brownian Motion**: Realistic market simulation using Box-Muller transform for normally distributed price movements
- **Throttled Updates**: Market ticks every 3s to maintain 60fps UI performance
- **Memoization**: Strategic use of `React.memo` and `useMemo` to prevent unnecessary re-renders
- **FlashList**: Recycled list views for smooth scrolling with thousands of items
- **Granular State Selectors**: Zustand selectors prevent component re-renders when unrelated state changes

### Architecture Highlights
- **Decoupled Simulation Layer**: Market engine runs independently from UI rendering
- **Hook-Based Architecture**: `useMarketEngine`, `useCryptoEngine`, and `useToast` for clean separation of concerns
- **Error Boundaries**: Graceful error handling with user-friendly fallback UI
- **Analytics Layer**: Structured event tracking system (currently console-only, ready for integration)

---

## 📱 App Structure

```
PaperTrader/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Bottom tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── market.tsx     # Stock market browser
│   │   ├── crypto.tsx     # Crypto trading
│   │   ├── history.tsx    # Trade history
│   │   └── leaderboard.tsx # Leaderboard
│   ├── stock/[id].tsx     # Stock detail modal
│   ├── onboarding.tsx     # First-time user experience
│   └── _layout.tsx        # Root navigation wrapper
├── components/            # 38 reusable UI components
├── constants/             # Data catalogs & theme system
├── hooks/                 # Custom React hooks
├── store/                 # Zustand state stores
├── utils/                 # Business logic & helpers
└── types.ts               # TypeScript definitions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation
```bash
npm install
npx expo start
```

### Building for iOS
We use GitHub Actions to build unsigned IPAs that can be sideloaded via AltStore:
```bash
# See README_GITHUB_ACTIONS.md for detailed instructions
```

---

## 🎯 Game Modes

### Standard Trading
- Buy and sell stocks with your virtual cash
- Track your portfolio performance in real-time
- React to breaking news events

### Crypto Trading
- Access a separate crypto wallet with £100,000 starting balance
- Trade with leverage (5x-20x) for amplified gains or losses
- Transfer profits back to your main account (one-way transfer)

### Daily Challenges
Three fresh challenges appear every 24 hours:
- **Profit Target**: Make £X profit in a single trade
- **Volume Challenge**: Trade £X total volume
- **Win Streak**: Complete X profitable trades in a row

Success unlocks XP and cash rewards!

---

## 📊 Data & Content

- **90 Stocks**: Curated selection across Technology, Finance, Healthcare, Consumer, Energy, and more
- **10 Cryptocurrencies**: Bitcoin, Ethereum, Solana, and other major coins
- **56 Achievements**: Bronze → Silver → Gold progression
- **Dynamic News**: 50+ news templates that trigger based on market conditions
- **Leaderboard**: 10 mock elite traders with realistic portfolios

---

## 🔧 Configuration

Key settings in `app.json`:
- **Bundle ID**: `com.papertrader.app`
- **iOS Deployment Target**: 15.1
- **New Architecture**: Disabled for stability
- **Plugins**: Expo Router, Expo Build Properties

---

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

Current test coverage focuses on:
- Daily challenge generation
- Achievement tracking logic
- Market simulation accuracy

---

## 📝 License & Privacy

- **Privacy**: No user tracking, no data collection, no ads
- **Storage**: All game data stored locally on device
- **Offline Play**: Fully functional without internet connection

---

## 👨‍💻 Author

**Tonde**  
*Built with AI Pair Programmer Antigravity*

---

## 🗺️ Future Roadmap

- [ ] Real-time WebSocket integration (live market data)
- [ ] Multiplayer challenges
- [ ] Options trading simulator
- [ ] Custom watchlists
- [ ] Portfolio analytics dashboard
- [ ] Social features (share trades, compete with friends)
- [ ] WASM module for advanced market simulation
- [ ] Sentry/Firebase integration for crash reporting

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Expo SDK**: 54.0.25  
**React Native**: 0.81.5
