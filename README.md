---

# **PaperTrader**

PaperTrader is a full-stack, TypeScript-powered, simulated trading game built with **React Native + Expo**.
It blends real-time market behavior, challenge modes, achievements, leaderboards, calculations, and interactive charts to create a gamified stock-trading experience.

It’s not “buy low sell high” — the app generates **events**, **news shocks**, **market cycles**, and **probability-weighted scenarios** to mimic the emotional chaos of actual trading, all while tracking user progress in a persistent store.

---

## **🔥 Core Highlights**

### **• Real-time simulated market engine**

Powered by `useMarketEngine.ts`, the system simulates:

* Price movements
* Volatility cycles
* Momentum shifts
* News-driven spikes & crashes
* Random & deterministic events
* Market sentiment

### **• Achievement System**

Defined in `constants/achievements.ts`

Achievements include:

* Profit milestones
* Streak-based accomplishments
* Consistency behaviors
* Challenge-based unlocks
* Exploration rewards (using specific app features)

Achievements integrate with:

* `useStore.ts` (persistence)
* UI surfaces (badges, progress indicators)

### **• Dynamic Challenges**

Generated in:

* `challengeGenerator.ts`
* `challenges.ts`

Challenge types:

* Timed trading sessions
* Risk-based constraints
* Profit-target missions
* Drawdown-restricted runs
* Randomized quests

Each challenge tracks:

* Win/loss
* Attempt count
* Performance breakdown

### **• News Engine**

`NewsEngine.ts` generates simulated narratives:

* Company scandals
* Economic booms
* Rate hikes
* Market fear events
* Sector-specific stories

These push through to the market engine to influence price behavior.

### **• Clean UI Architecture**

Inside the `/app/(tabs)` directory:

* **Home / Dashboard**
* **Leaderboard**
* **History**
* **Portfolio Overview**

UI elements handled by:

* `StockCard.tsx`
* `StockChart.tsx`
* `StatsHeader.tsx`

The UI is animated, theme-aware, lean, and modular.

### **• Full TypeScript Support**

Every layer uses strict types in:

* `types.ts`
* Hooks
* Utils
* Market engines
* Challenge logic

---

## **📦 Folder Breakdown**

```
papertrader/
│
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx        # Main dashboard
│   │   ├── history.tsx      # Session logs
│   │   ├── leaderboard.tsx  # Ranking
│   │   └── _layout.tsx
│   └── ...other screens
│
├── components/
│   ├── StockCard.tsx
│   ├── StockChart.tsx
│   └── StatsHeader.tsx
│
├── constants/
│   ├── stockData.ts
│   ├── stockData.ts.backup
│   ├── achievements.ts
│   ├── theme.ts
│
├── contexts/
│   └── ThemeContext.tsx
│
├── hooks/
│   └── useMarketEngine.ts
│
├── store/
│   └── useStore.ts
│
├── utils/
│   ├── NewsEngine.ts
│   ├── challengeGenerator.ts
│   ├── challenges.ts
│   ├── currency.ts
│   ├── marketEvents.ts
│   └── sounds.ts
│
├── STRATEGY_GUIDE.md
├── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## **🚀 Getting Started**

### **Install**

```bash
git clone https://github.com/tonderaiitai8-png/tekbro.git
cd tekbro
npm install
```

### **Run**

```bash
npm run start
npm run android
npm run ios
```

---

## **📈 How the Market System Works**

The engine blends:

* Random walk simulation
* Weighted event probabilities
* News-based volatility
* Momentum feedback loops
* Player-driven price impact (in certain challenges)

Every tick updates:

* Price
* Volume
* Velocity
* Trend bias

This creates *playable chaos* — structured enough to learn from, unpredictable enough to stay fun.

---

## **🏆 Achievements & Progression**

Achievements reward:

* Profit streaks
* Risk management
* Challenge completions
* Feature exploration
* Consecutive profitable days
* Deep-dive behaviors (reading news, viewing charts, etc.)

Progress persists automatically through `useStore.ts`.

---

## **🧠 Challenges & Game Modes**

Each challenge includes:

* Rules
* Goals
* Constraints (drawdown, volatility, capital limits)
* Time limits
* Reward multipliers

Your performance affects:

* Leaderboard rank
* Profile stats
* Achievement unlocks

---

## **🎨 Themes & Personalization**

Defined in `theme.ts`

Users can switch:

* Color mode
* Accent shades
* Typography presets

Theme is globally injected via `ThemeContext.tsx`.

---

## **🗂️ Future Plans**

This repo is ready for future expansion:

* Real data feed mode
* Competitive seasons
* Social trading
* AI advisors
* Replay engine
* Exportable trading logs

---

## **📜 License**

MIT (use it however you want).

---

## **🤝 Contributing**

Open to PRs for:

* Screens
* Animations
* Indicator algorithms
* Performance improvements
* UX and UI enhancements

---

If you want, I can generate:

* A version with **project screenshots**

* A version with **badges**

* A version styled like a **commercial product landing page**

* A version with **API documentation for all utilities**
