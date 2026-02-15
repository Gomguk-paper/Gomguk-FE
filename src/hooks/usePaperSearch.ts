import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { papersApi, tagsApi } from "@/api";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { convertPaperOutToPaper } from "@/lib/paperUtils";
import { Paper } from "@/models";


export type SortMode = "trending" | "recent" | "recommended";

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

    // Fetch papers based on sortMode
    const { data: papersData, isLoading: papersLoading } = useQuery({
        queryKey: ['papers', sortMode],
        queryFn: () => {
            if (sortMode === 'recommended') {
                return papersApi.getPaperFeed({ limit: 50, offset: 0 });
            }
            const backendSort = sortMode === 'trending' ? 'popular' : 'recent';
            return papersApi.getPapers({ sort: backendSort, limit: 50, offset: 0 });
        },
    });
    const papers = papersData?.items || [];

    // Fetch tags
    const { data: tagsData } = useQuery({
        queryKey: ['all-tags'],
        queryFn: async () => {
            const allItems: { tag: { id: number; name: string; description: string | null; count: number } }[] = [];
            let offset = 0;
            const limit = 500;
            while (true) {
                const res = await tagsApi.getTags({ limit, offset });
                allItems.push(...res.items);
                if (allItems.length >= res.count || res.items.length < limit) break;
                offset += limit;
            }
            return allItems;
        },
        staleTime: 5 * 60 * 1000,
    });

    const tagItems = tagsData || [];
    const allTags = useMemo(() => tagItems.map(t => t.tag.name), [tagItems]);

    // Create mappings
    const tagNameToId = useMemo(() => {
        const map = new Map<string, number>();
        tagItems.forEach(item => {
            map.set(item.tag.name, item.tag.id);
        });
        return map;
    }, [tagItems]);

    const tagIdToName = useMemo(() => {
        const map: Record<number, string> = {};
        tagItems.forEach(item => {
            map[item.tag.id] = item.tag.name;
        });
        return map;
    }, [tagItems]);

    // Sync selectedTags with URL parameters
    useEffect(() => {
        const tagsFromUrl = searchParams.getAll("tag");
        const tagsStr = JSON.stringify(tagsFromUrl);
        const selectedStr = JSON.stringify(selectedTags);
        if (tagsStr !== selectedStr) {
            setSelectedTags(tagsFromUrl);
        }
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter and Sort Papers
    const filteredPapers = useMemo(() => {
        let result = [...papers];

        // Filter by search query
        if (query) {
            const q = query.toLowerCase();
            result = result.filter(
                (item) =>
                    item.paper.title.toLowerCase().includes(q) ||
                    item.paper.short.toLowerCase().includes(q)
            );
        }

        // Filter by selected tags
        if (selectedTags.length > 0) {
            const selectedTagIds = selectedTags
                .map(tagName => tagNameToId.get(tagName))
                .filter((id): id is number => id !== undefined);

            if (selectedTagIds.length > 0) {
                result = result.filter(item => {
                    const paperTagIds = item.paper.tags || [];
                    return selectedTagIds.some(selectedId => paperTagIds.includes(selectedId));
                });
            }
        }

        // No frontend sorting - trust backend order
        return result;
    }, [papers, query, selectedTags, tagNameToId]);

    // Convert for display
    const carouselPapers = useMemo(() => {
        return filteredPapers.map(item => {
            const paper = convertPaperOutToPaper(item.paper, tagIdToName);
            if ((item.paper as any).source) {
                paper.venue = (item.paper as any).source;
            }
            return paper;
        });
    }, [filteredPapers, tagIdToName]);

    const handleTagClick = (tag: string) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];

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

    const trendingTags = allTags.slice(0, 8);

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
        allTags
    };
}
