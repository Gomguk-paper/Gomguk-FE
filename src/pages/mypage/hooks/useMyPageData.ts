import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useStore } from "@/store/useStore";
import { meApi, tagsApi } from "@/api";
import { convertPaperOutToPaper } from "@/lib/paperUtils";
import { UI_CONSTANTS } from "@/core/config/constants";

export function useMyPageData() {
    const { user, prefs } = useStore();

    const { data: tagsData } = useQuery({
        queryKey: ['all-tags'],
        queryFn: async () => {
            const allItems: { tag: { id: number; name: string } }[] = [];
            let offset = 0;
            const limit = UI_CONSTANTS.TAGS_FETCH_LIMIT;
            while (true) {
                const res = await tagsApi.getTags({ limit, offset });
                allItems.push(...res.items);
                if (allItems.length >= res.count || res.items.length < limit) break;
                offset += limit;
            }
            return allItems;
        },
        staleTime: 10 * 60 * 1000,
    });

    const tagIdToName = useMemo(() => {
        const map: Record<number, string> = {};
        if (tagsData) {
            tagsData.forEach(item => {
                map[item.tag.id] = item.tag.name;
            });
        }
        return map;
    }, [tagsData]);

    const papersLimit = UI_CONSTANTS.MYPAGE_PAPERS_LIMIT;
    const results = useQueries({
        queries: [
            { queryKey: ['my-liked-papers', user?.id], queryFn: () => meApi.getLikedPapers({ limit: papersLimit }), enabled: !!user },
            { queryKey: ['my-saved-papers', user?.id], queryFn: () => meApi.getSavedPapers({ limit: papersLimit }), enabled: !!user },
            { queryKey: ['my-read-papers', user?.id], queryFn: () => meApi.getReadPapers({ limit: papersLimit }), enabled: !!user },
        ],
    });

    const [likedQuery, savedQuery, readQuery] = results;

    const likedPapers = useMemo(() => {
        return (likedQuery.data?.items || []).map(p => convertPaperOutToPaper(p.paper, tagIdToName));
    }, [likedQuery.data, tagIdToName]);

    const savedPapers = useMemo(() => {
        return (savedQuery.data?.items || []).map(p => convertPaperOutToPaper(p.paper, tagIdToName));
    }, [savedQuery.data, tagIdToName]);

    const readPapers = useMemo(() => {
        return (readQuery.data?.items || []).map(p => convertPaperOutToPaper(p.paper, tagIdToName));
    }, [readQuery.data, tagIdToName]);

    const allPapers = useMemo(() => {
        const map = new Map();
        [...likedPapers, ...savedPapers, ...readPapers].forEach(p => map.set(p.id, p));
        return Array.from(map.values());
    }, [likedPapers, savedPapers, readPapers]);

    const papersLoading = likedQuery.isLoading || savedQuery.isLoading || readQuery.isLoading;

    return {
        user,
        prefs,
        allPapers,
        likedPapers,
        savedPapers,
        readPapers,
        papersLoading,
        tagIdToName
    };
}
