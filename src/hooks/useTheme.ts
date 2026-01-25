import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function useTheme() {
    const { theme, setTheme } = useStore();

    useEffect(() => {
        // Disable transitions temporarily
        const css = document.createElement('style');
        css.appendChild(
            document.createTextNode(
                `* {
                    -webkit-transition: none !important;
                    -moz-transition: none !important;
                    -o-transition: none !important;
                    -ms-transition: none !important;
                    transition: none !important;
                }`
            )
        );
        document.head.appendChild(css);

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

        // Force reflow
        (() => window.getComputedStyle(document.body))();

        // Wait for next frame to re-enable transitions
        setTimeout(() => {
            document.head.removeChild(css);
        }, 1);
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
