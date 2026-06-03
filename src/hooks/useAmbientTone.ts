import { useEffect } from 'react';
import type { ReminderTone } from '../types/health';

const TONE_PALETTE: Record<ReminderTone, Record<string, string>> = {
  friend: {
    '--tone-accent': '#4ea387',
    '--tone-accent-soft': '#a6d6c3',
    '--tone-glow': 'rgba(78,163,135,0.18)',
    '--tone-deco': 'rgba(166,214,195,0.25)',
    '--tone-shadow': 'rgba(72,97,84,0.24)',
  },
  quiet: {
    '--tone-accent': '#5b8d89',
    '--tone-accent-soft': '#b0ccc7',
    '--tone-glow': 'rgba(91,141,137,0.14)',
    '--tone-deco': 'rgba(176,204,199,0.20)',
    '--tone-shadow': 'rgba(70,90,85,0.18)',
  },
  encouraging: {
    '--tone-accent': '#e87d1f',
    '--tone-accent-soft': '#fde4c2',
    '--tone-glow': 'rgba(245,151,59,0.16)',
    '--tone-deco': 'rgba(253,228,194,0.28)',
    '--tone-shadow': 'rgba(160,100,30,0.20)',
  },
  poetic: {
    '--tone-accent': '#c23e5f',
    '--tone-accent-soft': '#f0b3c4',
    '--tone-glow': 'rgba(216,92,126,0.14)',
    '--tone-deco': 'rgba(240,179,196,0.22)',
    '--tone-shadow': 'rgba(130,50,70,0.18)',
  },
  companion: {
    '--tone-accent': '#d85c7e',
    '--tone-accent-soft': '#f7d7e0',
    '--tone-glow': 'rgba(216,92,126,0.12)',
    '--tone-deco': 'rgba(247,215,224,0.24)',
    '--tone-shadow': 'rgba(120,50,70,0.16)',
  },
};

export default function useAmbientTone(tone: ReminderTone) {
  useEffect(() => {
    const vars = TONE_PALETTE[tone] ?? TONE_PALETTE.friend;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
  }, [tone]);
}
