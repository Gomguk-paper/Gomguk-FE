import { useQuery } from "@tanstack/react-query";
import { tagsApi } from "@/api";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";
import { useMemo } from "react";

/**
 * 트렌딩 목록의 유일한 소스: GET /tags/trending 의 tag_ids.
 * tag_ids 순서를 그대로 유지하고, id → name 만 전체 태그 목록으로 해석.
 */
export function useTrendingTagNames(limit: number = 20) {
    const {
        data: trendingData,
        isLoading: trendingLoading,
    } = useQuery({
        queryKey: ["tags", "trending", limit],
        queryFn: () => tagsApi.getTrendingTagIds({ limit }),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const { tagMap, isLoading: tagsLoading } = useTagsQuery();

    const tagIds = trendingData?.tag_ids ?? [];

    const trendingTagNames = useMemo(() => {
        if (!tagIds.length) return [];
        return tagIds
            .map((id) => tagMap[id])
            .filter((name): name is string => Boolean(name));
    }, [tagIds, tagMap]);

    const isLoading = trendingLoading || tagsLoading;

    return { trendingTagNames, isLoading };
}
