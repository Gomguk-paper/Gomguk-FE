import { useInfiniteQuery } from "@tanstack/react-query";
import { papersApi } from "@/api";

const PAGE_SIZE = 20;

export const usePaperFeedQuery = () => {
    return useInfiniteQuery({
        queryKey: ['paper-feed'],
        queryFn: ({ pageParam = 0 }) =>
            papersApi.getPaperFeed({ limit: PAGE_SIZE, offset: pageParam }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const totalFetched = allPages.reduce((sum, page) => sum + page.items.length, 0);
            if (lastPage.items.length < PAGE_SIZE || totalFetched >= lastPage.count) {
                return undefined;
            }
            return totalFetched;
        },
        retry: 1,
        staleTime: 1000 * 60 * 5,
    });
};
