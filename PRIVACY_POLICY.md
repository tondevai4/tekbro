# Privacy Policy for PaperTrader

**Last Updated:** November 24, 2025

## Introduction

PaperTrader ("we", "our", or "the app") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our stock trading simulation mobile application.

## Information We Collect

### Information Stored Locally

PaperTrader is designed as a **local-only application**. All data is stored on your device using AsyncStorage and is never transmitted to external servers.

The following data is stored locally on your device:
- Portfolio data (holdings, cash balance, trade history)
- Game progress (XP, level, achievements, login streak)
- User preferences (watchlist, selected stocks)
- Daily challenge progress
- Leaderboard entries (local only)

### Information We Do NOT Collect

- We DO NOT collect any personal information
- We DO NOT track your location
- We DO NOT access your contacts, photos, or other device data
- We DO NOT share any data with third parties
- We DO NOT use cookies or tracking technologies
- We DO NOT require account creation or login

## Data Storage and Security

All application data is stored locally on your device using React Native AsyncStorage. Your data:
- Remains on your device
- Is not backed up to cloud services by default
- Will be deleted if you uninstall the app
- Can be manually cleared through the app's reset function

## Children's Privacy

PaperTrader is suitable for users of all ages. Since we do not collect any personal information, there are no special considerations for children's privacy under COPPA or similar regulations.

## Third-Party Services

PaperTrader does not integrate with any third-party services, analytics platforms, or advertising networks in its current version.

### Future Updates

If we integrate analytics or crash reporting services (such as Sentry) in future updates, we will:
- Update this Privacy Policy
- Notify users of the change
- Provide opt-out options where applicable

## Your Rights

Since all data is stored locally on your device, you have complete control:
- **Access:** View all your data within the app
- **Delete:** Clear all data using the "Reset Progress" feature in settings
- **Export:** Currently not available (may be added in future versions)

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by:
- Updating the "Last Updated" date
- Displaying a notification in the app (for significant changes)

## Data Retention

Your data is retained locally on your device until you:
- Manually reset your progress in the app
- Uninstall the application
- Clear the app's data through device settings

## Contact Us

If you have questions about this Privacy Policy or PaperTrader, please contact us at:

**Email:** [Your contact email here]

## Consent

By using PaperTrader, you consent to this Privacy Policy.

---

## Technical Details (For Developers)

### Data Storage Implementation
- **Technology:** AsyncStorage (React Native)
- **Persistence:** Zustand persist middleware
- **Storage Key:** `paper-trader-storage`
- **Data Format:** JSON

### Permissions Required
- None (The app requires no special device permissions)

### Network Usage
- The app does not make any network requests
- All data is generated and processed locally
- No internet connection required to use the app
