# 📈 PaperTrader

**PaperTrader** is a premium, mobile-first paper trading simulation app built with **React Native** and **Expo**. It offers a risk-free environment for users to practice trading stocks and cryptocurrencies, featuring a high-fidelity "Glassmorphism" UI, real-time market simulation, and deep gamification elements.

---

## ✨ Key Features

### 💹 Trading Engine
- **Stocks & Crypto**: Trade top US stocks (AAPL, TSLA, NVDA, etc.) and major cryptocurrencies (BTC, ETH, SOL).
- **Real-Time Simulation**: Dynamic price updates with realistic volatility and market movements.
- **Order Types**: Buy and Sell at market prices with instant execution.
- **Leverage (Crypto)**: Advanced trading with leverage options for crypto assets.
- **Portfolio Tracking**: Real-time calculation of equity, holdings value, and profit/loss.

### 🎮 Gamification
- **Leveling System**: Earn XP for every trade, profit, and daily login. Level up to unlock new features.
- **Achievements**: Over 20 unique achievements to unlock (e.g., "Diamond Hands", "Whale Alert").
- **Leaderboard**: Compete against simulated "bot" traders and climb the global rankings.
- **Daily Rewards**: Login bonuses to keep your streak alive and boost your starting capital.

### 🎨 Premium UI/UX
- **Glassmorphism Design**: Modern, translucent UI elements with blur effects using `expo-blur`.
- **Dynamic Theming**: Four distinct themes: **Midnight** (Default), **Ocean**, **Sunset**, and **Forest**.
- **Fluid Animations**: Powered by `react-native-reanimated` for smooth transitions and interactions.
- **Haptic Feedback**: Tactile responses for actions using `expo-haptics`.
- **Interactive Charts**: Visual price history using `react-native-gifted-charts`.

### 📱 App Features
- **Onboarding Flow**: Immersive introduction to the app's features and initial capital allocation.
- **News Feed**: Simulated market news updates affecting stock prices.
- **Search & Discovery**: Unified search for stocks and crypto with "Trending Now" insights.
- **Secure Storage**: Local persistence of user progress and portfolio using `zustand` and `AsyncStorage`.

---

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) (0.76) via [Expo](https://expo.dev/) (SDK 52)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (v4)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with persistence)
- **Styling**: StyleSheet API + Custom Theme System
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Gestures**: [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- **Charts**: [React Native Gifted Charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts)
- **Icons**: [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- **Performance**: [@shopify/flash-list](https://github.com/Shopify/flash-list) for high-performance lists

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app on your iOS/Android device (or a simulator).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/papertrader.git
    cd papertrader
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the development server:**
    ```bash
    npx expo start
    ```

4.  **Run on device:**
    - Scan the QR code with the **Expo Go** app (Android) or Camera app (iOS).
    - Press `a` for Android Emulator or `i` for iOS Simulator.

---

## 📂 Project Structure

```
PaperTrader/
├── app/                 # Expo Router pages and layouts
│   ├── (tabs)/          # Main tab navigation (Home, Portfolio, etc.)
│   ├── crypto/          # Crypto detail pages
│   ├── stock/           # Stock detail pages
│   ├── onboarding.tsx   # Intro flow
│   └── _layout.tsx      # Root layout and providers
├── components/          # Reusable UI components
│   ├── GlassCard.tsx    # Core UI container
│   ├── TradeModal.tsx   # Trading interface
│   └── ...
├── constants/           # Static data and config
│   ├── stocks.ts        # Stock market data
│   ├── theme.ts         # Design tokens and themes
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useTheme.ts      # Theme consumption hook
│   └── ...
├── store/               # Zustand state stores
│   ├── useStore.ts      # Main app state (User, Stocks)
│   └── useCryptoStore.ts# Crypto specific state
├── utils/               # Helper functions
│   ├── analytics.ts     # Mock analytics
│   └── haptics.ts       # Haptic feedback patterns
└── assets/              # Images and fonts
```

---

## 🎨 Theming System

PaperTrader features a robust theming system defined in `constants/theme.ts`. The app currently supports four themes:

1.  **Midnight** (Default): Deep blacks and cyans.
2.  **Ocean**: Slate blues and teals.
3.  **Sunset**: Deep purples and pinks.
4.  **Forest**: Dark greens and emeralds.

Themes are applied globally using the `useTheme` hook, ensuring consistent styling across all components.

---

## 🚢 Deployment & CI/CD

This project is configured for automated builds using **GitHub Actions** and **Expo Application Services (EAS)**.

### GitHub Actions
The workflow in `.github/workflows/build-ios.yml` handles:
1.  Checking out the code.
2.  Setting up Node.js and dependencies.
3.  Building the iOS IPA using `eas build --local`.
4.  Uploading the artifact for download.

For more details on the CI/CD pipeline, see [README_GITHUB_ACTIONS.md](./README_GITHUB_ACTIONS.md).

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ by the PaperTrader Team*
