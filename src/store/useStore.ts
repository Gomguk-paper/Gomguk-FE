import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TagPreference {
  name: string;
  weight: number;
}

interface UserPrefs {
  tags: TagPreference[];
  level: 'undergraduate' | 'graduate' | 'researcher' | 'practitioner';
  dailyCount: number;
}

interface UserAction {
  paperId: string;
  liked: boolean;
  saved: boolean;
  readAt?: string;
}

interface User {
  name: string;
  isGuest: boolean;
  onboardingCompleted: boolean;
}

interface GomgukStore {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
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
    }
  )
);
