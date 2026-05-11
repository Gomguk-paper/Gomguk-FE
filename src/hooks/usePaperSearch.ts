import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { papersApi } from "@/api";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";
import { useTrendingTags, TRENDING_TOP_COUNT_SEARCH } from "@/contexts/TrendingTagsContext";
import { convertPaperOutToPaper } from "@/lib/paperUtils";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useStore } from "@/store/useStore";


export type SortMode = "trending" | "recent" | "recommended";

const PAGE_SIZE = 20;

export function usePaperSearch() {
    const { user } = useStore();
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

    // 태그 이름→ID 해석이 끝났을 때만 태그 필터 적용
    const tagFilterReady = selectedTags.length === 0 || tagIds.length === selectedTags.length;

    // # 입력 중(태그 제안 모드)이면 BE 요청 차단
    const isHashMode = query.trim().startsWith('#');

    // 텍스트 검색어: 태그가 있거나 # 모드면 절대 전달하지 않음 (태그 검색과 텍스트 검색 완전 분리)
    const textQuery = (!isHashMode && selectedTags.length === 0) ? (query.trim() || undefined) : undefined;

    const infiniteQuery = useInfiniteQuery({
        queryKey: ['papers', 'search', sortMode, textQuery ?? '', tagIds],
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
                q: textQuery,
                tags: hasTagFilter ? tagIds : undefined,
            });
        },
        enabled: !!user && tagFilterReady && !isHashMode,
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
        isLoading: queryLoading,
        isError,
        error,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = infiniteQuery;

    const papersLoading = queryLoading || (selectedTags.length > 0 && !tagFilterReady);

    const rawItems = useMemo(
        () => papersData?.pages.flatMap(p => p.items) ?? [],
        [papersData?.pages]
    );

    // 태그 검색 시: BE가 제목/키워드로 섞어 보낼 수 있으므로, 요청한 tagIds를 논문이 실제로 보유한 경우만 유지 (태그 ID 기준)
    const filteredRawItems = useMemo(() => {
        if (tagIds.length === 0) return rawItems;
        return rawItems.filter(item => {
            const paperTagIds = (item.paper as { tags?: number[] }).tags ?? [];
            return tagIds.every(tid => paperTagIds.includes(tid));
        });
    }, [rawItems, tagIds]);

    const carouselPapers = useMemo(() => {
        return filteredRawItems.map(item => {
            const paper = convertPaperOutToPaper(item.paper, tagIdToName);
            if ((item.paper as any).source) {
                paper.venue = (item.paper as any).source;
            }
            return paper;
        });
    }, [filteredRawItems, tagIdToName]);

    // # 입력 중에는 결과 비움. 그 외에는 carouselPapers 그대로 (이미 filteredRawItems로 태그 필터됨)
    const displayedPapers = useMemo(() => {
        if (isHashMode) return [];
        return carouselPapers;
    }, [carouselPapers, isHashMode]);

    const beTotalCount = papersData?.pages[0]?.count ?? 0;
    const totalCount = selectedTags.length > 0 ? displayedPapers.length : beTotalCount;

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
        const isAdding = !selectedTags.includes(tag);
        const newSelectedTags = isAdding
            ? [...selectedTags, tag]
            : selectedTags.filter(t => t !== tag);

        if (isAdding) setQuery('');

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
        carouselPapers: displayedPapers,
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
        isError,
        error,
    };
}
