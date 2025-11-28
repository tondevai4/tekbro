import { useStore } from '../store/useStore';
import { MIDNIGHT_THEME, OCEAN_THEME, SUNSET_THEME, FOREST_THEME, ThemeType } from '../constants/theme';

export const useTheme = () => {
    const currentTheme = useStore((state) => state.currentTheme);
    const setTheme = useStore((state) => state.setTheme);

    const getTheme = () => {
        switch (currentTheme) {
            case 'ocean':
                return OCEAN_THEME;
            case 'sunset':
                return SUNSET_THEME;
            case 'forest':
                return FOREST_THEME;
            case 'midnight':
            default:
                return MIDNIGHT_THEME;
        }
    };

    return {
        theme: getTheme(),
        currentTheme,
        setTheme,
    };
};
