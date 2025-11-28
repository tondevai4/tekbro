import React, { createContext, useContext, useState, useEffect } from 'react';
import { appStorage } from '../utils/storage';
import { DARK_THEME, LIGHT_THEME } from '../constants/theme';

type Theme = typeof DARK_THEME;
type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

    useEffect(() => {
        // Load saved theme preference
        const loadTheme = async () => {
            const saved = await appStorage.getStringAsync('theme');
            if (saved === 'light' || saved === 'dark') {
                setThemeMode(saved as ThemeMode);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = () => {
        const newMode = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newMode);
        appStorage.set('theme', newMode);
    };

    const theme = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

    return (
        <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
