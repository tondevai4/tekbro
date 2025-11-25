# Screenshot Capture Guide

## Overview
This guide provides instructions for capturing the 6 required App Store screenshots for PaperTrader.

## Device Setup

### iOS
- Use iPhone 14 Pro Max (6.7" display) or iPhone 15 Pro Max
- Enable Developer Mode  
- Set device to Light Mode
- Disable all notifications
- Set time to 9:41 AM (Apple standard)
- Enable full battery display
- Clean home screen

### Android
- Use Pixel 7 Pro or Samsung Galaxy S23 Ultra
- Set to Light Mode
- Clean status bar

## Screenshot Requirements

### Required Resolutions
- **iOS:** 1290 x 2796 pixels (iPhone 6.7")
- **Android:** 1440 x 3120 pixels

---

## Screenshot 1: Home Screen with Live Market Data

**Location:** Market Tab (default screen)

**Setup:**
1. Launch app and navigate to Market tab
2. Ensure stocksare showing with varied price changes (some green, some red)
3. Make sure watchlist has 2-3 stocks starred
4. Wait for price to update (shows real-time animation)

**Framing:**
- Capture from top of screen (including status bar) to bottom navigation
- Include: Header, search bar, All Stocks/Watchlist tabs, sector filters, and at least 5-6 visible stocks

**Key Elements to Show:**
- Live price updates
- Green/red price indicators
- Percentage changes
- Stock symbols and names
- Quick buy button (lightning bolt)
- Watchlist stars

**Caption:** "Real-time market simulation with 15+ stocks across multiple sectors"

---

## Screenshot 2: Stock Detail with Chart + Buy/Sell UI

**Location:** Stock Detail Modal (tap any stock)

**Setup:**
1. From Market tab, tap on NVDA or AAPL (high-value stock)
2. Ensure chart shows interesting price movement (some ups and downs)
3. Capture the full modal view

**Framing:**
- Full modal from top to bottom
- Include: Stock name, price, chart, buy/sell buttons, holdings info

**Key Elements to Show:**
- Interactive price chart with green trend
- Current price prominently displayed
- Buy/Sell action buttons
- "You own X shares" indicator (if applicable)
- Average cost and P/L (if holdings exist)

**Caption:** "Detailed stock analysis with interactive charts and instant trading"

---

## Screenshot 3: Achievements Grid with Progress Bars

**Location:** Index Tab (Home) - Achievements Section

**Setup:**
1. Navigate to Index (Home) tab
2. Scroll to Achievements section
3. Tap "View All" to open full achievements modal
4. Ensure you have:
   - At least 3-5 unlocked achievements (green/glowing)
   - Several in-progress achievements showing progress bars
   - Mix of Bronze, Silver, and Gold tiers visible

**Framing:**
- Capture the achievements modal
- Show achievement grid with multiple rows
- Include header showing "X of 50 unlocked"

**Key Elements to Show:**
- Unlocked achievement badges (glowing)
- Progress bars on locked achievements
- Tier indicators (🥉🥈🏆)
- XP rewards
- Achievement titles and descriptions

**Caption:** "Unlock 50+ achievements across Bronze, Silver, and Gold tiers"

---

## Screenshot 4: Daily Challenge Card

**Location:** Index Tab (Home) - Daily Challenge Section

**Setup:**
1. Navigate to Index (Home) tab
2. Scroll to Daily Challenge card
3. Ensure challenge is active with partial progress
   - If no progress, execute 1-2 trades to show progress bar filling
   - Ideal: 30-60% progress to show it's achievable

**Framing:**
- Focus on the Daily Challenge card
- Include surrounding context (XP header above, achievements below)
- Center the challenge card prominently

**Key Elements to Show:**
- Challenge icon and title
- Challenge description
- Progress bar (partially filled)
- "X/Y complete" text
- Reward information (+XP, +Cash)
- Time remaining (if shown)

**Caption:** "Complete daily challenges for bonus rewards and XP"

---

## Screenshot 5: Leaderboard with Rankings

**Location:** Leaderboard Tab

**Setup:**
1. Navigate to Leaderboard tab
2. Ensure leaderboard has at least 5 entries
   - If empty, execute trades and tap "Update Leaderboard" 2-3 times with different equity values
3. Your entry should be highlighted

**Framing:**
- Capture full leaderboard from header to bottom navigation
- Include: Header, leaderboard entries, bottom nav

**Key Elements to Show:**
- Rank numbers (#1, #2, #3, etc.)
- Usernames
- Equity values (varied amounts)
- Achievement counts
- Level badges
- Your entry highlighted/emphasized

**Caption:** "Compete on the leaderboard and track your progress"

---

## Screenshot 6: Portfolio History with Profit Graph

**Location:** History Tab

**Setup:**
1. Navigate to History tab
2. Ensure portfolio has:
   - Executed multiple trades (buy and sell)
   - Portfolio value graph showing upward trend (green line)
   - Trade history list below

**Framing:**
- Capture from top of History tab to show both:
  - Equity graph at top
  - Trade history list below

**Key Elements to Show:**
- Equity over time graph (preferably trending up)
- Graph with multiple data points
- Recent trades list showing:
  - BUY/SELL labels
  - Stock symbols
  - Quantities
  - Prices
  - Timestamps
  - P/L for sells (green if profit)

**Caption:** "Track your portfolio value and trading history"

---

## Capture Methods

### iOS - Using Xcode Simulator
```bash
# Run simulator
npx expo run:ios

# Capture screenshot
Cmd + S (saves to Desktop)
```

### iOS - Physical Device
1. Press Volume Up + Side Button simultaneously
2. Screenshot saves to Photos
3. AirDrop to Mac or use iCloud Photos

### Android - Using Emulator
```bash
# Run emulator
npx expo run:android

# Use emulator controls to capture screenshot
```

### Android - Physical Device
1. Press Power + Volume Down simultaneously
2. Transfer via USB or Google Photos

---

## Post-Processing

### Required Edits
1. **Crop** to exact dimensions (1290x2796 for iOS)
2. **Remove** status bar if it shows sensitive info
3. **Ensure** consistent time (9:41 AM)
4. **Verify** no personal data visible
5. **Compress** to under 8MB per image

### Recommended Tools
- **Figma** - For creating frames and adding captions
- **Photoshop** - Professional editing
- **Figma to App Store** - Use template frames
- **Screenshots.pro** - App Store screenshot generator

### File Naming Convention
```
01-market-home.png
02-stock-detail.png
03-achievements.png
04-daily-challenge.png
05-leaderboard.png
06-portfolio-history.png
```

---

## App Preview Video (30s)

### Recording Setup
1. Use screen recording on device
2. Plan your movements in advance
3. Move slowly and deliberately
4. Pause on key screens for 2-3 seconds

### Video Flow
1. **[0-5s]** App launch → Market tab fade in
2. **[6-10s]** Scroll through stocks, tap NVDA
3. **[11-15s]** Stock detail appears, tap Buy, confirm
4. **[16-20s]** Return to home, scroll to Achievements
5. **[21-25s]** Achievement unlocks animation
6. **[26-30s]** Daily challenge completes, confetti

### Export Settings
- **Resolution:** 1080p minimum
- **Frame Rate:** 30 FPS
- **Format:** MP4 (H.264)
- **Duration:** 15-30 seconds
- **File Size:** Under 500MB

---

## Checklist

- [ ] All 6 screenshots captured
- [ ] Screenshots cropped to correct dimensions
- [ ] Time showing 9:41 AM consistently
- [ ] No personal information visible
- [ ] Varied content (green/red stocks, different values)
- [ ] High resolution (no blur or pixelation)
- [ ] Consistent app state (same theme/mode)
- [ ] Files named correctly
- [ ] Video recorded (optional but recommended)
- [ ] Video edited and exported

---

## Upload Locations

### iOS - App Store Connect
1. Login to App Store Connect
2. Navigate to your app
3. Go to "App Store" tab
4. Scroll to "App Previews and Screenshots"
5. Upload for each device size:
   - 6.7" Display (iPhone 14 Pro Max)
   - 6.5" Display (iPhone 11 Pro Max)  
   - 5.5" Display (iPhone 8 Plus)

### Android - Google Play Console
1. Login to Play Console
2. Navigate to your app
3. Go to "Store presence" → "Main store listing"
4. Scroll to "Phone screenshots"
5. Upload minimum 2, maximum 8 screenshots
6. Also upload for "7-inch tablet" and "10-inch tablet" if desired

---

## Tips for Great Screenshots

✅ **DO:**
- Show the app in action (buttons pressed, modals open)
- Use realistic data (varied prices, sensible values)
- Highlight key features
- Ensure good visual contrast
- Show progress/achievements unlocked

❌ **DON'T:**
- Use emptyEmpty states
- Show error messages
- Include debug information
- Use Lorem Ipsum or placeholder text
- Show notification badges or alerts
- Capture with low battery
