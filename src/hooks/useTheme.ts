import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function useTheme() {
    const { theme, setTheme } = useStore();

    useEffect(() => {
        const root = document.documentElement;

        // Remove both classes first
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            // Check system preference
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemPrefersDark) {
                root.classList.add('dark');
            }
        } else {
            // Apply user's choice
            root.classList.add(theme);
        }
    }, [theme]);

    // Listen for system theme changes when theme is set to 'system'
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            if (e.matches) {
                root.classList.add('dark');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Get the actual applied theme (resolving 'system')
    const resolvedTheme = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;

    return {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
    };
}
