import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserPrefs, StoredUser } from '@/core/lib/authStorage';
import { papersApi } from '@/api/papers';

interface UserAction {
  paperId: string;
  liked: boolean;
  saved: boolean;
  readAt?: string;
}

export interface StoreNotification {
  type: string;
  paperId: string;
  title: string;
  message: string;
  createdAt?: string;
  read?: boolean;
}

export type Theme = 'light' | 'dark' | 'system';

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

  // Notifications
  notifications: StoreNotification[];
  addNotification: (notification: StoreNotification) => void;
  getNotifications: () => StoreNotification[];

  // Filtering
  hiddenPapers: Record<string, boolean>;
  excludedTags: Record<string, boolean>;
  hidePaper: (paperId: string) => void;
  excludeTag: (tag: string) => void;
  undoHidePaper: (paperId: string) => void;
  unexcludeTag: (tag: string) => void;

  // Following
  followedAuthors: Record<string, boolean>;
  toggleFollow: (authorId: string) => void;

  // UI State
  currentSummaryIndex: number;
  setCurrentSummaryIndex: (index: number) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Mobile Menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const getUserActionKey = (user: StoredUser | null) => {
  if (!user) {
    return null;
  }
  return user.id;
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

      // Notifications
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { ...notification, createdAt: new Date().toISOString() }]
      })),
      getNotifications: () => get().notifications,

      // Filtering
      hiddenPapers: {},
      excludedTags: {},
      hidePaper: (paperId) => set((state) => ({
        hiddenPapers: { ...state.hiddenPapers, [paperId]: true }
      })),
      undoHidePaper: (paperId) => set((state) => {
        const { [paperId]: _, ...rest } = state.hiddenPapers;
        return { hiddenPapers: rest };
      }),
      excludeTag: (tag) => set((state) => ({
        excludedTags: { ...state.excludedTags, [tag]: true }
      })),
      unexcludeTag: (tag) => set((state) => {
        const { [tag]: _, ...rest } = state.excludedTags;
        return { excludedTags: rest };
      }),

      // Following
      followedAuthors: {},
      toggleFollow: (authorId) => set((state) => {
        const currentFollow = state.followedAuthors[authorId] || false;
        return {
          followedAuthors: {
            ...state.followedAuthors,
            [authorId]: !currentFollow,
          }
        };
      }),

      toggleLike: (paperId) => {
        const state = get();
        const userKey = getUserActionKey(state.user);
        if (!userKey) return;

        // Optimistic UI update
        set((state) => {
          const currentActions = state.actionsByUser[userKey] ?? [];
          const existing = currentActions.find(a => a.paperId === paperId);

          // API Call (Fire and forget)
          const paperIdNum = parseInt(paperId, 10);
          if (!isNaN(paperIdNum)) {
            if (existing && existing.liked) {
              papersApi.unlikePaper(paperIdNum).catch(console.error);
            } else {
              papersApi.likePaper(paperIdNum).catch(console.error);
            }
          }

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
        });
      },
      toggleSave: (paperId) => {
        const state = get();
        const userKey = getUserActionKey(state.user);
        if (!userKey) return;

        set((state) => {
          const currentActions = state.actionsByUser[userKey] ?? [];
          const existing = currentActions.find(a => a.paperId === paperId);

          // API Call
          const paperIdNum = parseInt(paperId, 10);
          if (!isNaN(paperIdNum)) {
            if (existing && existing.saved) {
              papersApi.unscrapPaper(paperIdNum).catch(console.error);
            } else {
              papersApi.scrapPaper(paperIdNum).catch(console.error);
            }
          }

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
        });
      },
      markAsRead: (paperId) => {
        const state = get();
        const userKey = getUserActionKey(state.user);
        if (!userKey) return;

        // API Call
        const paperIdNum = parseInt(paperId, 10);
        if (!isNaN(paperIdNum)) {
          papersApi.markPaperViewed(paperIdNum).catch(console.error);
        }

        set((state) => {
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
        });
      },
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

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Mobile Menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
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
            setItem: () => { },
            removeItem: () => { },
          };
        }
      }),
      migrate: (persistedState) => {
        if (persistedState && typeof persistedState === 'object') {
          const { user: _user, actions: _actions, ...rest } = persistedState as Record<string, any>;
          if (!('actionsByUser' in rest)) {
            return { ...rest, actionsByUser: {}, notifications: [] } as GomgukStore;
          }
          if (!('notifications' in rest)) {
            return { ...rest, notifications: [] } as GomgukStore;
          }
          return rest as GomgukStore;
        }
        return persistedState as GomgukStore;
      },
      partialize: (state) => ({
        prefs: state.prefs,
        actionsByUser: state.actionsByUser,
        currentSummaryIndex: state.currentSummaryIndex,
        theme: state.theme,
        hiddenPapers: state.hiddenPapers,
        excludedTags: state.excludedTags,
        followedAuthors: state.followedAuthors,
        notifications: state.notifications,
      }),
    }
  )
);
