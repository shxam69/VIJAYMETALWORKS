import { useContext, createContext } from 'react';
import { THEMES } from '../styles/theme';

// Always use dark theme - no toggle, no storage
export const ThemeCtx = createContext(THEMES.dark);
export const useTheme = () => useContext(ThemeCtx);

export const useThemeMode = () => {
  // Always return dark theme
  const C = {
    ...THEMES.dark,
    theme: 'dark'
  };

  return { mode: 'dark', setMode: () => {}, C, resolvedTheme: 'dark' };
};

export default useTheme;
