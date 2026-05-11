import { useQuery } from "@tanstack/react-query";
import { tagsApi } from "@/api";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";
import { useMemo } from "react";
import { useStore } from "@/store/useStore";

/**
 * 트렌딩 목록의 유일한 소스: GET /tags/trending 의 tag_ids.
 * tag_ids 순서를 그대로 유지하고, id → name 만 전체 태그 목록으로 해석.
 * /tags/trending 엔드포인트가 없을 경우(404 등) count 기준 상위 태그로 폴백.
 */
export function useTrendingTagNames(limit: number = 20) {
    const { user } = useStore();
    const {
        data: trendingData,
        isLoading: trendingLoading,
        isError: trendingError,
    } = useQuery({
        queryKey: ["tags", "trending", limit],
        queryFn: () => tagsApi.getTrendingTagIds({ limit }),
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false, // 404면 재시도하지 않음
    });

    const { tagMap, tagsResponse, isLoading: tagsLoading } = useTagsQuery();

    const trendingTagNames = useMemo(() => {
        // /tags/trending 성공 시: 순서 그대로 사용
        if (!trendingError && trendingData?.tag_ids?.length) {
            return trendingData.tag_ids
                .map((id) => tagMap[id])
                .filter((name): name is string => Boolean(name));
        }

        // 폴백: count 기준 상위 N개 태그 이름 반환
        if (!tagsResponse) return [];
        return [...tagsResponse]
            .sort((a, b) => b.tag.count - a.tag.count)
            .slice(0, limit)
            .map((item) => item.tag.name);
    }, [trendingError, trendingData, tagMap, tagsResponse, limit]);

    const isLoading = trendingLoading || tagsLoading;

    return { trendingTagNames, isLoading };
}
