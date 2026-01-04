import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserPrefs, StoredUser } from '@/lib/authStorage';

interface UserAction {
  paperId: string;
  liked: boolean;
  saved: boolean;
  readAt?: string;
}

interface GomgukStore {
  // User
  user: StoredUser | null;
  setUser: (user: StoredUser | null) => void;
  
  // Preferences
  prefs: UserPrefs | null;
  setPrefs: (prefs: UserPrefs) => void;
  
  // Actions (likes, saves, reads)
  actions: UserAction[];
  toggleLike: (paperId: string) => void;
  toggleSave: (paperId: string) => void;
  markAsRead: (paperId: string) => void;
  getAction: (paperId: string) => UserAction | undefined;
  
  // UI State
  currentSummaryIndex: number;
  setCurrentSummaryIndex: (index: number) => void;
}

export const useStore = create<GomgukStore>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      
      // Preferences
      prefs: null,
      setPrefs: (prefs) => set({ prefs }),
      
      // Actions
      actions: [],
      toggleLike: (paperId) => set((state) => {
        const existing = state.actions.find(a => a.paperId === paperId);
        if (existing) {
          return {
            actions: state.actions.map(a => 
              a.paperId === paperId ? { ...a, liked: !a.liked } : a
            )
          };
        }
        return {
          actions: [...state.actions, { paperId, liked: true, saved: false }]
        };
      }),
      toggleSave: (paperId) => set((state) => {
        const existing = state.actions.find(a => a.paperId === paperId);
        if (existing) {
          return {
            actions: state.actions.map(a => 
              a.paperId === paperId ? { ...a, saved: !a.saved } : a
            )
          };
        }
        return {
          actions: [...state.actions, { paperId, liked: false, saved: true }]
        };
      }),
      markAsRead: (paperId) => set((state) => {
        const existing = state.actions.find(a => a.paperId === paperId);
        if (existing) {
          return {
            actions: state.actions.map(a => 
              a.paperId === paperId ? { ...a, readAt: new Date().toISOString() } : a
            )
          };
        }
        return {
          actions: [...state.actions, { paperId, liked: false, saved: false, readAt: new Date().toISOString() }]
        };
      }),
      getAction: (paperId) => get().actions.find(a => a.paperId === paperId),
      
      // UI State
      currentSummaryIndex: 0,
      setCurrentSummaryIndex: (index) => set({ currentSummaryIndex: index }),
    }),
    {
      name: 'gomguk-storage',
      storage: createJSONStorage(() => {
        try {
          const testKey = '__gomguk_storage_test__';
          window.localStorage.setItem(testKey, '1');
          window.localStorage.removeItem(testKey);
          return window.localStorage;
        } catch {
          return {
            getItem: (key: string) => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
      }),
    }
  )
);
