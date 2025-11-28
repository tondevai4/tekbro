# PaperTrader Application Audit

> **Generated:** November 27, 2025
> **Version:** 1.0.0 (Simulated)
> **Tech Stack:** React Native (Expo), TypeScript, Zustand, Lucide Icons, Reanimated

## 1. Project Overview
PaperTrader is a high-fidelity stock and crypto market simulator designed to provide a premium, risk-free trading experience. It features realistic market engines, news-driven price action, and a deep gamification system to engage users.

---

## 2. Core Architecture

### 🧠 Market Engines
The app runs on two independent, sophisticated simulation engines:

#### **Stock Market Engine** (`useMarketEngine.ts`)
- **Cycle Theory**: Simulates 4 market phases (`Early`, `Mid`, `Late`, `Recession`).
- **Sector Rotation**: Different sectors (Tech, Finance, Energy, etc.) outperform in specific phases.
- **News Integration**: Generates sector-specific and company-specific news that impacts prices.
- **Fear & Greed**: A composite index (0-100) driven by 7 metrics (Momentum, Volatility, Safe Haven Demand, etc.).

#### **Crypto Engine V2** (`useCryptoEngine.ts`)
- **State Machine**: Distinct phases (`Accumulation`, `Bull Run`, `Euphoria`, `Correction`, `Bear Winter`).
- **News Driver**: News events *trigger* phase transitions (e.g., "Regulatory Crackdown" -> `Correction`).
- **Lévy Flight Volatility**: Uses advanced math to simulate "fat tail" events (extreme crypto volatility).
- **Sentiment Integration**: "Fire" meter (Skull to Rocket) directly influences pump/dump probabilities.
- **Daily Reset**: Rolling 24h window for percentage changes to prevent "stuck" prices.

### 💾 State Management (Zustand)
- **`useStore.ts`**: Core user state (Cash, Portfolio, Watchlist, XP, Level).
- **`useCryptoStore.ts`**: Crypto-specific state (Wallet, Holdings, Trades, V2 Engine State).
- **`useMarketMoodStore.ts`**: Centralized sentiment store (Stock F&G, Crypto F&G, Market Cycles).
- **`toastStore.ts`**: Global toast notification system.

---

## 3. Feature Breakdown

### 📈 Stock Market (`(tabs)/market.tsx`)
- **Live Ticker**: Real-time price updates for 100+ simulated stocks.
- **Sector Performance**: Visual heatmap of sector performance (Tech, Finance, etc.).
- **Fear & Greed Meter**: Interactive gauge showing market sentiment.
- **Stock Details**:
    - **`StockCard.tsx`**: Optimized list item with "FIFA-style" momentum badges.
    - **`StockChart.tsx`**: Interactive price history chart.
    - **`TradeModal.tsx`**: Buy/Sell interface with validation.

### ₿ Crypto Exchange (`(tabs)/crypto.tsx`)
- **"Playing with Fire" Aesthetic**: Neon/Dark theme distinct from stocks.
- **Sentiment Modal** (`CryptoFearGreedModal.tsx`):
    - Visualizes sentiment with icons (Skull, Zap, Fire, Rocket).
    - Displays "REKT Zone" vs "Moon Mission" status.
- **Leverage Trading**: Support for 1x, 2x, 5x, 10x leverage with liquidation logic.
- **Transfer System**: Move funds between Main Cash and Crypto Wallet.

### 💼 Portfolio (`(tabs)/portfolio.tsx`)
- **Unified View**: See Stock and Crypto holdings in one place.
- **Analytics** (`PortfolioDetailModal.tsx`):
    - Sector Allocation breakdown.
    - Top Gainers/Losers.
    - Diversification Score.
- **History**: Transaction history for all trades.

### 📰 News & Events (`(tabs)/news.tsx`)
- **`NewsEngine.ts`**: Generates realistic headlines using Markov chains/templates.
- **Impact System**: News isn't just text; it moves prices (e.g., "Apple Earnings Beat" -> AAPL +5%).
- **Breaking News**: `BreakingNewsAlert.tsx` overlays for major market events.

### 🎮 Gamification & Leaderboard
- **XP System**: Earn XP for trading, profit, and daily streaks.
- **Levels**: Unlock new features (e.g., Margin Trading) at higher levels.
- **Achievements**: `AchievementsSection.tsx` tracks milestones (e.g., "First 10k Profit").
- **Daily Challenges**: `DailyChallengesModal.tsx` offers tasks for bonus XP.
- **Leaderboard**: Compare net worth with simulated rivals (Elon, Warren, etc.).

---

## 4. UI/UX System

### 🎨 Design Language
- **Glassmorphism**: Extensive use of `GlassCard.tsx` (blur effects, translucent borders).
- **Gradients**: `expo-linear-gradient` used for rich backgrounds and cards.
- **Icons**: 100+ `lucide-react-native` icons mapped to specific companies and sectors.
- **Haptics**: `haptics.ts` defines custom vibration patterns for Success, Error, and Impact.

### 🧩 Key Components
- **`MetricDetailModal.tsx`**: Reusable modal for explaining complex stats (P/E Ratio, Volatility).
- **`NewsToast.tsx`**: Non-intrusive in-app notifications for market updates.
- **`AnimatedDots.tsx`**: Micro-interaction for loading states.
- **`SectorTabs.tsx`**: Filter stock list by industry.

---

## 5. Technical Details

### 🛠️ Utilities
- **`analytics.ts`**: Event tracking wrapper.
- **`currency.ts`**: Formatting helpers for currency display.
- **`newsChains.ts`**: Data source for news generation templates.
- **`sounds.ts`**: Sound effect triggers (currently placeholders).

### 📱 Platform Specifics
- **iOS**: Optimized for iOS Haptics and Safe Areas.
- **Expo**: Built using Expo Go workflow (recently fixed compatibility).

---

## 6. Recent Fixes & Improvements (v1.0.1)
- **Crypto Engine V2**: Complete rewrite to fix "stuck prices" and add "Fire" sentiment.
- **Performance**: Optimized `StockCard` re-renders using selectors.
- **Stability**: Fixed `ReferenceError` crashes in hooks.
- **UI Polish**: Fixed icon imports (`Virus` -> `Biohazard`) and resized modal text.
