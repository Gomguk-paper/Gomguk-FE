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
  actionsByUser: Record<string, UserAction[]>;
  toggleLike: (paperId: string) => void;
  toggleSave: (paperId: string) => void;
  markAsRead: (paperId: string) => void;
  getAction: (paperId: string) => UserAction | undefined;
  
  // UI State
  currentSummaryIndex: number;
  setCurrentSummaryIndex: (index: number) => void;
}

const getUserActionKey = (user: StoredUser | null) => {
  if (!user || user.provider === 'guest') {
    return null;
  }
  return user.provider;
};

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
      actionsByUser: {},
      toggleLike: (paperId) => set((state) => {
        const userKey = getUserActionKey(get().user);
        if (!userKey) {
          return state;
        }
        const currentActions = state.actionsByUser[userKey] ?? [];
        const existing = currentActions.find(a => a.paperId === paperId);
        if (existing) {
          return {
            actionsByUser: {
              ...state.actionsByUser,
              [userKey]: currentActions.map(a =>
              a.paperId === paperId ? { ...a, liked: !a.liked } : a
              ),
            },
          };
        }
        return {
          actionsByUser: {
            ...state.actionsByUser,
            [userKey]: [...currentActions, { paperId, liked: true, saved: false }],
          },
        };
      }),
      toggleSave: (paperId) => set((state) => {
        const userKey = getUserActionKey(get().user);
        if (!userKey) {
          return state;
        }
        const currentActions = state.actionsByUser[userKey] ?? [];
        const existing = currentActions.find(a => a.paperId === paperId);
        if (existing) {
          return {
            actionsByUser: {
              ...state.actionsByUser,
              [userKey]: currentActions.map(a =>
              a.paperId === paperId ? { ...a, saved: !a.saved } : a
              ),
            },
          };
        }
        return {
          actionsByUser: {
            ...state.actionsByUser,
            [userKey]: [...currentActions, { paperId, liked: false, saved: true }],
          },
        };
      }),
      markAsRead: (paperId) => set((state) => {
        const userKey = getUserActionKey(get().user);
        if (!userKey) {
          return state;
        }
        const currentActions = state.actionsByUser[userKey] ?? [];
        const existing = currentActions.find(a => a.paperId === paperId);
        if (existing) {
          return {
            actionsByUser: {
              ...state.actionsByUser,
              [userKey]: currentActions.map(a =>
              a.paperId === paperId ? { ...a, readAt: new Date().toISOString() } : a
              ),
            },
          };
        }
        return {
          actionsByUser: {
            ...state.actionsByUser,
            [userKey]: [
              ...currentActions,
              { paperId, liked: false, saved: false, readAt: new Date().toISOString() },
            ],
          },
        };
      }),
      getAction: (paperId) => {
        const userKey = getUserActionKey(get().user);
        if (!userKey) {
          return undefined;
        }
        const currentActions = get().actionsByUser[userKey] ?? [];
        return currentActions.find(a => a.paperId === paperId);
      },
      
      // UI State
      currentSummaryIndex: 0,
      setCurrentSummaryIndex: (index) => set({ currentSummaryIndex: index }),
    }),
    {
      name: 'gomguk-storage',
      version: 3,
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
      migrate: (persistedState) => {
        if (persistedState && typeof persistedState === 'object') {
          const { user: _user, actions: _actions, ...rest } = persistedState as GomgukStore & {
            actions?: UserAction[];
          };
          if (!('actionsByUser' in rest)) {
            return { ...rest, actionsByUser: {} } as GomgukStore;
          }
          return rest as GomgukStore;
        }
        return persistedState as GomgukStore;
      },
      partialize: (state) => ({
        prefs: state.prefs,
        actionsByUser: state.actionsByUser,
        currentSummaryIndex: state.currentSummaryIndex,
      }),
    }
  )
);
