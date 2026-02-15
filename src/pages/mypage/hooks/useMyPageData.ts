import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useStore } from "@/store/useStore";
import { meApi, tagsApi } from "@/api";
// papers mock data import removed to fully switch to backend
import { convertPaperOutToPaper } from "@/lib/paperUtils";
import { type PaperOut } from "@/lib/apiTypes";

export function useMyPageData() {
    const { user, prefs } = useStore();

    // 1. 태그 정보 가져오기 (ID -> Name 매핑용)
    const { data: tagsData } = useQuery({
        queryKey: ['all-tags'],
        queryFn: async () => {
            const allItems: { tag: { id: number; name: string } }[] = [];
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

    // 2. Fetch User Data (Liked, Saved, Read)
    const results = useQueries({
        queries: [
            {
                queryKey: ['my-liked-papers', user?.id],
                queryFn: () => meApi.getLikedPapers({ limit: 100 }), // Fetch up to 100 for now
                enabled: !!user,
            },
            {
                queryKey: ['my-saved-papers', user?.id],
                queryFn: () => meApi.getSavedPapers({ limit: 100 }),
                enabled: !!user,
            },
            {
                queryKey: ['my-read-papers', user?.id],
                queryFn: () => meApi.getReadPapers({ limit: 100 }),
                enabled: !!user,
            },
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

    // Combined All Papers (for derived states if needed)
    const allPapers = useMemo(() => {
        const map = new Map();
        [...likedPapers, ...savedPapers, ...readPapers].forEach(p => map.set(p.id, p));
        return Array.from(map.values());
    }, [likedPapers, savedPapers, readPapers]);


    // Read Papers with Date (Mocking date as it's not in API response yet)
    // In a real scenario, API should return viewedAt.
    const readPapersWithDate = useMemo(() => {
        return readPapers.map((paper, index) => ({
            paper,
            // Mock date: sequential days ago for demo purposes, or current time
            // Since we don't have the date from backend, we can't show accurate history timeline yet.
            readAt: new Date().toISOString(),
            readDate: new Date(),
        }));
    }, [readPapers]);

    const actions = useMemo(() => {
        // Construct pseudo-actions for compatibility
        const acts: any[] = [];
        likedPapers.forEach(p => acts.push({ paperId: p.id, liked: true, saved: false }));
        savedPapers.forEach(p => acts.push({ paperId: p.id, liked: false, saved: true }));
        readPapers.forEach(p => acts.push({ paperId: p.id, readAt: new Date().toISOString() }));
        return acts;
    }, [likedPapers, savedPapers, readPapers]);

    const actionsWithDate = useMemo(() => actions.filter(a => a.readAt), [actions]);

    const papersLoading = likedQuery.isLoading || savedQuery.isLoading || readQuery.isLoading;

    return {
        user,
        prefs,
        allPapers,
        likedPapers,
        savedPapers,
        readPapers,
        actions,
        actionsWithDate,
        readPapersWithDate,
        papersLoading,
        tagIdToName
    };
}
