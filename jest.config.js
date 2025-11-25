module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native)',
    ],
    collectCoverageFrom: [
        'hooks/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
        'store/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
    ],
    coverageThreshold: {
        './hooks/useMarketEngine.ts': {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
        },
        './utils/NewsEngine.ts': {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
        },
    },
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
};
