import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface UsePaperFeedOptions {
    papers: any[];
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
}

export const usePaperFeed = ({
    papers,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}: UsePaperFeedOptions) => {
    const loadMoreRef = useInfiniteScroll({
        onLoadMore: fetchNextPage,
        hasMore: hasNextPage,
        isLoading: isFetchingNextPage,
    });

    return { displayedPapers: papers, loadMoreRef, hasMore: hasNextPage, isFetchingNextPage };
};
