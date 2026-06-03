import { create } from 'zustand';
import { db } from './db';
import type { MedicineNote } from '../types/health';

interface MedicineState {
  notes: MedicineNote[];
  loaded: boolean;

  load: () => Promise<void>;
  add: (note: Omit<MedicineNote, 'id' | 'createdAt'>) => Promise<MedicineNote>;
  remove: (id: string) => Promise<void>;
  toggleEnabled: (id: string) => Promise<void>;
  update: (id: string, patch: Partial<Pick<MedicineNote, 'medicineName' | 'dosageText' | 'remindAt' | 'repeatRule' | 'note'>>) => Promise<void>;
}

export const useMedicineStore = create<MedicineState>()((set, get) => ({
  notes: [],
  loaded: false,

  load: async () => {
    const notes = await db.medicine.orderBy('remindAt').toArray();
    set({ notes, loaded: true });
  },

  add: async (input) => {
    const note: MedicineNote = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: Date.now(),
    };
    await db.medicine.add(note);
    set((s) => ({ notes: [...s.notes, note].sort((a, b) => a.remindAt.localeCompare(b.remindAt)) }));
    return note;
  },

  remove: async (id) => {
    await db.medicine.delete(id);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },

  toggleEnabled: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const updated = { ...note, enabled: !note.enabled };
    await db.medicine.update(id, { enabled: updated.enabled });
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
    }));
  },

  update: async (id, patch) => {
    await db.medicine.update(id, patch);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
  },
}));
