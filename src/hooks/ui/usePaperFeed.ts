import { useState, useMemo } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export const usePaperFeed = (sortedPapers: any[], isLoading: boolean) => {
    const [displayCount, setDisplayCount] = useState(10);
    const PAPERS_PER_PAGE = 10;

    const displayedPapers = useMemo(() => {
        return sortedPapers.slice(0, displayCount);
    }, [sortedPapers, displayCount]);

    const hasMore = displayCount < sortedPapers.length;

    const loadMore = () => {
        setDisplayCount(prev => Math.min(prev + PAPERS_PER_PAGE, sortedPapers.length));
    };

    const loadMoreRef = useInfiniteScroll({
        onLoadMore: loadMore,
        hasMore,
        isLoading,
    });

    return { displayedPapers, loadMoreRef, hasMore };
};
