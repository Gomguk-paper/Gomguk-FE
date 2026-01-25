import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    rootMargin?: string;
}

export function useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading,
    rootMargin = '100px',
}: UseInfiniteScrollOptions) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && hasMore && !isLoading) {
                onLoadMore();
            }
        },
        [onLoadMore, hasMore, isLoading]
    );

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        const option = {
            root: null,
            rootMargin,
            threshold: 0,
        };

        observerRef.current = new IntersectionObserver(handleObserver, option);
        observerRef.current.observe(element);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [handleObserver, rootMargin]);

    return loadMoreRef;
}
