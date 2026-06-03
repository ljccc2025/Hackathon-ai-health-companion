import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const AUTO_DARK_START = 19; // 19:00
const AUTO_LIGHT_START = 7; // 07:00

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getTimeBasedTheme(): Theme {
  const hour = new Date().getHours();
  return hour >= AUTO_DARK_START || hour < AUTO_LIGHT_START ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return getTimeBasedTheme();
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export default function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [autoMode, setAutoMode] = useState(() => !localStorage.getItem('theme'));

  // Auto-switch theme based on time (only when in auto mode)
  useEffect(() => {
    if (!autoMode) return;
    const check = () => {
      const timeTheme = getTimeBasedTheme();
      setTheme(timeTheme);
    };
    check();
    const now = new Date();
    const msToNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;
    const timeout = setTimeout(() => {
      check();
      const hourly = setInterval(check, 60 * 60 * 1000);
      return () => clearInterval(hourly);
    }, msToNextHour);
    return () => clearTimeout(timeout);
  }, [autoMode]);

  useEffect(() => {
    applyTheme(theme);
    if (!autoMode) {
      localStorage.setItem('theme', theme);
    }
  }, [theme, autoMode]);

  // Also listen to system preference changes as fallback
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (autoMode) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [autoMode]);

  const toggle = useCallback(() => {
    localStorage.setItem('theme', theme === 'light' ? 'dark' : 'light');
    setAutoMode(false);
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [theme]);

  const enableAuto = useCallback(() => {
    localStorage.removeItem('theme');
    setAutoMode(true);
    setTheme(getTimeBasedTheme());
  }, []);

  const isAuto = autoMode;

  return { theme, toggle, enableAuto, isAuto };
}
