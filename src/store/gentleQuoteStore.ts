import { create } from 'zustand';
import { db } from './db';
import type { GentleQuote } from '../types/health';

interface GentleQuoteState {
  quotes: GentleQuote[];
  loaded: boolean;

  load: () => Promise<void>;
  add: (text: string, source: GentleQuote['source']) => Promise<void>;
  remove: (id: string) => Promise<void>;
  getRandom: () => GentleQuote | null;
}

export const useGentleQuoteStore = create<GentleQuoteState>((set, get) => ({
  quotes: [],
  loaded: false,

  load: async () => {
    const all = await db.gentleQuote.orderBy('savedAt').reverse().toArray();
    set({ quotes: all, loaded: true });
  },

  add: async (text, source) => {
    const quote: GentleQuote = {
      id: crypto.randomUUID(),
      text: text.trim().slice(0, 200),
      source,
      savedAt: Date.now(),
    };
    await db.gentleQuote.add(quote);
    set((s) => ({ quotes: [quote, ...s.quotes] }));
  },

  remove: async (id) => {
    await db.gentleQuote.delete(id);
    set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) }));
  },

  getRandom: () => {
    const { quotes } = get();
    if (quotes.length === 0) return null;
    return quotes[Math.floor(Math.random() * quotes.length)];
  },
}));
