import { useState, useEffect, useContext, createContext } from 'react';
import { THEMES } from '../styles/theme';

export const ThemeCtx = createContext(THEMES.dark);
export const useTheme = () => useContext(ThemeCtx);

export const useThemeMode = () => {
  const [mode, setMode] = useState('auto');
  const [C, setC] = useState(THEMES.dark);

  useEffect(() => {
    const apply = (m) => {
      if (m === 'auto') {
        const d = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setC(d ? THEMES.dark : THEMES.light);
      } else {
        setC(m === 'dark' ? THEMES.dark : THEMES.light);
      }
    };
    apply(mode);

    if (mode === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const h = () => apply('auto');
      mq.addEventListener('change', h);
      return () => mq.removeEventListener('change', h);
    }
  }, [mode]);

  return { mode, setMode, C };
};

export default useTheme;
