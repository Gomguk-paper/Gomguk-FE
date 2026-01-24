import { useEffect, useRef } from 'react';

/**
 * Hook to save and restore scroll position for a specific page
 * @param key - Unique key for the page (e.g., 'home', 'search', 'mypage')
 * @param enabled - Whether to enable scroll restoration (default: true)
 */
export function useScrollRestoration(key: string, enabled = true) {
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (!enabled) return;

        // Restore scroll position when component mounts
        const savedPosition = sessionStorage.getItem(`scroll_${key}`);
        if (savedPosition) {
            const position = parseInt(savedPosition, 10);
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                window.scrollTo(0, position);
            }, 0);
        }

        // Save scroll position when scrolling
        const handleScroll = () => {
            // Debounce the save operation
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                sessionStorage.setItem(`scroll_${key}`, window.scrollY.toString());
            }, 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [key, enabled]);
}
