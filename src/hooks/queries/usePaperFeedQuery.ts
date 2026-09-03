import { useInfiniteQuery } from "@tanstack/react-query";
import { papersApi } from "@/api";
import { useStore } from "@/store/useStore";

const PAGE_SIZE = 20;

export const usePaperFeedQuery = () => {
    // 비로그인도 조회 가능. 로그인 전후로 추천 결과가 달라지므로 사용자 id를 키에 포함해 재조회한다.
    const userId = useStore((s) => s.user?.id ?? null);

    return useInfiniteQuery({
        queryKey: ['paper-feed', userId],
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
