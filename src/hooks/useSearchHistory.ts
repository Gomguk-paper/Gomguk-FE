import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'search_history';

export const useSearchHistory = () => {
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (error) {
                console.error('Failed to parse search history:', error);
                setHistory([]);
            }
        }
    }, []);

    const saveHistory = useCallback((newHistory: string[]) => {
        setHistory(newHistory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    }, []);

    const addHistory = useCallback((term: string) => {
        if (!term.trim()) return;

        setHistory((prev) => {
            const newHistory = [term, ...prev.filter((t) => t !== term)].slice(0, 10);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    const removeHistory = useCallback((term: string) => {
        setHistory((prev) => {
            const newHistory = prev.filter((t) => t !== term);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return { history, addHistory, removeHistory, clearHistory };
};
