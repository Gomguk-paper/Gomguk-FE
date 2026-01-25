import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserPrefs, StoredUser } from '@/core/lib/authStorage';

interface UserAction {
  paperId: string;
  liked: boolean;
  saved: boolean;
  readAt?: string;
}

export type NotificationType = "new_recommendation" | "tag_match" | "saved_update";

export interface Notification {
  id: string;
  type: NotificationType;
  paperId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
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

  // Filtering
  hiddenPapers: Record<string, boolean>;
  blockedAuthors: Record<string, boolean>;
  excludedTags: Record<string, boolean>;
  hidePaper: (paperId: string) => void;
  blockAuthor: (authorId: string) => void;
  excludeTag: (tag: string) => void;
  undoHidePaper: (paperId: string) => void;

  // Notifications
  notificationsByUser: Record<string, Notification[]>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  getNotifications: () => Notification[];
  getUnreadCount: () => number;

  // UI State
  currentSummaryIndex: number;
  setCurrentSummaryIndex: (index: number) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const getUserActionKey = (user: StoredUser | null) => {
  if (!user) {
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

      // Filtering
      hiddenPapers: {},
      blockedAuthors: {},
      excludedTags: {},
      hidePaper: (paperId) => set((state) => ({
        hiddenPapers: { ...state.hiddenPapers, [paperId]: true }
      })),
      undoHidePaper: (paperId) => set((state) => {
        const { [paperId]: _, ...rest } = state.hiddenPapers;
        return { hiddenPapers: rest };
      }),
      blockAuthor: (authorId) => set((state) => ({
        blockedAuthors: { ...state.blockedAuthors, [authorId]: true }
      })),
      excludeTag: (tag) => set((state) => ({
        excludedTags: { ...state.excludedTags, [tag]: true }
      })),

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

      // Notifications
      notificationsByUser: {},
      addNotification: (notification) => {
        const userKey = getUserActionKey(get().user);
        if (!userKey) {
          return;
        }
        const newNotification: Notification = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notificationsByUser: {
            ...state.notificationsByUser,
            [userKey]: [newNotification, ...(state.notificationsByUser[userKey] ?? [])].slice(0, 50), // 최대 50개 유지
          },
        }));
      },
      markNotificationAsRead: (notificationId) => {
        const userKey = getUserActionKey(get().user);
        if (!userKey) {
          return;
        }
        set((state) => ({
          notificationsByUser: {
            ...state.notificationsByUser,
            [userKey]: (state.notificationsByUser[userKey] ?? []).map(n =>
              n.id === notificationId ? { ...n, read: true } : n
            ),
          },
        }));
      },
      getNotifications: () => {
        const userKey = getUserActionKey(get().user);
        if (!userKey) {
          return [];
        }
        return get().notificationsByUser[userKey] ?? [];
      },
      getUnreadCount: () => {
        const userKey = getUserActionKey(get().user);
        if (!userKey) {
          return 0;
        }
        const notifications = get().notificationsByUser[userKey] ?? [];
        return notifications.filter(n => !n.read).length;
      },

      // UI State
      currentSummaryIndex: 0,
      setCurrentSummaryIndex: (index) => set({ currentSummaryIndex: index }),

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),
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
            return { ...rest, actionsByUser: {} } as GomgukStore;
          }
          return rest as GomgukStore;
        }
        return persistedState as GomgukStore;
      },
      partialize: (state) => ({
        prefs: state.prefs,
        actionsByUser: state.actionsByUser,
        notificationsByUser: state.notificationsByUser,
        currentSummaryIndex: state.currentSummaryIndex,
        theme: state.theme,
        hiddenPapers: state.hiddenPapers,
        blockedAuthors: state.blockedAuthors,
        excludedTags: state.excludedTags,
      }),
    }
  )
);
