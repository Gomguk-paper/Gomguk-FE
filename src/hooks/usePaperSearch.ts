import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { papersApi } from "@/api";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";
import { useTrendingTags, TRENDING_TOP_COUNT_SEARCH } from "@/contexts/TrendingTagsContext";
import { convertPaperOutToPaper } from "@/lib/paperUtils";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";


export type SortMode = "trending" | "recent" | "recommended";

const PAGE_SIZE = 20;

export function usePaperSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTags = searchParams.getAll("tag");

    const [query, setQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
    const [sortMode, setSortMode] = useState<SortMode>("trending");
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);

    // Search History
    const { history, addHistory, removeHistory } = useSearchHistory();

    // 인기 태그와 동일한 태그 소스 사용 (이름↔ID 매칭 보장)
    const { tagsResponse } = useTagsQuery();
    const tagItems = tagsResponse || [];
    const allTags = useMemo(() => tagItems.map((t: { tag: { name: string } }) => t.tag.name), [tagItems]);

    const tagNameToId = useMemo(() => {
        const map = new Map<string, number>();
        tagItems.forEach((item: { tag: { id: number; name: string } }) => {
            map.set(item.tag.name, item.tag.id);
        });
        return map;
    }, [tagItems]);

    const tagIdToName = useMemo(() => {
        const map: Record<number, string> = {};
        tagItems.forEach((item: { tag: { id: number; name: string } }) => {
            map[item.tag.id] = item.tag.name;
        });
        return map;
    }, [tagItems]);

    const tagIds = useMemo(() => {
        const ids = selectedTags
            .map(name => tagNameToId.get(name))
            .filter((id): id is number => id !== undefined);
        return [...ids].sort((a, b) => a - b);
    }, [selectedTags, tagNameToId]);

    // 검색 인기 태그 = Context 트렌딩 상위 N개 (단일 소스)
    const { trendingTagNames, isTrendingTag } = useTrendingTags();
    const trendingTags = trendingTagNames.slice(0, TRENDING_TOP_COUNT_SEARCH);

    // 백엔드 offset 기반 무한 스크롤. 태그 선택 시에는 항상 getPapers+tags 사용 (feed는 태그 필터 미지원)
    const infiniteQuery = useInfiniteQuery({
        queryKey: ['papers', 'search', sortMode, query.trim(), tagIds],
        queryFn: ({ pageParam = 0 }) => {
            const hasTagFilter = tagIds.length > 0;
            if (sortMode === 'recommended' && !hasTagFilter) {
                return papersApi.getPaperFeed({ limit: PAGE_SIZE, offset: pageParam });
            }
            const backendSort = sortMode === 'trending' ? 'popular' : 'recent';
            return papersApi.getPapers({
                sort: backendSort,
                limit: PAGE_SIZE,
                offset: pageParam,
                q: query.trim() || undefined,
                tags: hasTagFilter ? tagIds : undefined,
            });
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const totalFetched = allPages.reduce((sum, p) => sum + p.items.length, 0);
            if (lastPage.items.length < PAGE_SIZE || totalFetched >= lastPage.count) {
                return undefined;
            }
            return totalFetched;
        },
        staleTime: 1000 * 60 * 2,
    });

    const {
        data: papersData,
        isLoading: papersLoading,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = infiniteQuery;

    const rawItems = useMemo(
        () => papersData?.pages.flatMap(p => p.items) ?? [],
        [papersData?.pages]
    );

    const carouselPapers = useMemo(() => {
        return rawItems.map(item => {
            const paper = convertPaperOutToPaper(item.paper, tagIdToName);
            if ((item.paper as any).source) {
                paper.venue = (item.paper as any).source;
            }
            return paper;
        });
    }, [rawItems, tagIdToName]);

    const totalCount = papersData?.pages[0]?.count ?? 0;

    const loadMoreRef = useInfiniteScroll({
        onLoadMore: () => fetchNextPage(),
        hasMore: hasNextPage ?? false,
        isLoading: isFetchingNextPage,
    });

    // Sync selectedTags with URL parameters
    useEffect(() => {
        const tagsFromUrl = searchParams.getAll("tag");
        const tagsStr = JSON.stringify(tagsFromUrl);
        const selectedStr = JSON.stringify(selectedTags);
        if (tagsStr !== selectedStr) {
            setSelectedTags(tagsFromUrl);
        }
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleTagClick = (tag: string) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];

        setSelectedTags(newSelectedTags);
        if (newSelectedTags.length === 0) {
            setSearchParams({});
        } else {
            const params = new URLSearchParams();
            newSelectedTags.forEach(t => params.append("tag", t));
            setSearchParams(params);
        }
    };

    const handleSearch = (term: string) => {
        if (!term.trim()) return;
        addHistory(term);
        setQuery(term);
    };

    const openCarousel = (index: number) => {
        setSelectedPaperIndex(index);
        setCarouselOpen(true);
    };

    return {
        query,
        setQuery,
        selectedTags,
        handleTagClick,
        sortMode,
        setSortMode,
        papersLoading,
        carouselPapers,
        openCarousel,
        carouselOpen,
        setCarouselOpen,
        selectedPaperIndex,
        history,
        addHistory,
        removeHistory,
        handleSearch,
        trendingTags,
        isTrendingTag,
        allTags,
        totalCount,
        loadMoreRef,
        hasNextPage: hasNextPage ?? false,
        isFetchingNextPage,
    };
}
