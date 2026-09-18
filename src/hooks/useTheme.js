import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { THEMES } from '../styles/theme';

export const STORAGE_KEY = 'vmw_theme';

export const getStoredThemeMode = () => {
  if (typeof window === 'undefined') return 'auto';
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === 'light' || s === 'dark' || s === 'auto') return s;
  } catch (_) {}
  return 'auto';
};

export const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const resolveTheme = (m) => {
  if (m === 'auto') return getSystemTheme();
  return m === 'light' ? 'light' : 'dark';
};

// Synchronous application on document root immediately upon module execution
// Prevents theme flash on initial load
if (typeof document !== 'undefined') {
  const initialMode = getStoredThemeMode();
  const initialResolved = resolveTheme(initialMode);
  document.documentElement.dataset.theme = initialResolved;
  document.documentElement.style.colorScheme = initialResolved;
}

export const ThemeCtx = createContext(THEMES[resolveTheme(getStoredThemeMode())] || THEMES.dark);
export const useTheme = () => useContext(ThemeCtx);

export const useThemeMode = () => {
  const [mode, setModeState] = useState(getStoredThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(getStoredThemeMode()));

  const setMode = useCallback((newMode) => {
    if (newMode !== 'light' && newMode !== 'dark' && newMode !== 'auto') return;
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch (_) {}
    const resolved = resolveTheme(newMode);
    setResolvedTheme(resolved);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    }
  }, []);

  useEffect(() => {
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    }

    if (mode === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => {
        const r = e.matches ? 'dark' : 'light';
        setResolvedTheme(r);
        if (typeof document !== 'undefined') {
          document.documentElement.dataset.theme = r;
          document.documentElement.style.colorScheme = r;
        }
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [mode]);

  const C = {
    ...THEMES[resolvedTheme] || THEMES.dark,
    theme: resolvedTheme  // Add the actual theme name to the color object
  };

  return { mode, setMode, C, resolvedTheme };
};

export default useTheme;
