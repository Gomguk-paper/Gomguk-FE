import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/store/useStore";
import { papersApi, tagsApi } from "@/api";
import { papers } from "@/data/papers";
import { convertPaperOutToPaper } from "@/lib/paperUtils";
import { type PaperOut } from "@/lib/apiTypes";

export function useMyPageData() {
    const { user, actionsByUser, prefs } = useStore();
    const userKey = user?.id ?? null;
    const actions = useMemo(() => userKey ? (actionsByUser[userKey] ?? []) : [], [userKey, actionsByUser]);

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

    // 2. 관련된 모든 논문 ID 추출 (좋아요/저장/읽음)
    const allRelatedPaperIds = useMemo(() => {
        const ids = new Set<string>();
        actions.forEach(a => ids.add(a.paperId));
        return Array.from(ids);
    }, [actions]);

    // 3. 논문 상세 정보 가져오기
    const { data: fetchedPapers, isLoading: papersLoading } = useQuery({
        queryKey: ['papers-details', allRelatedPaperIds],
        queryFn: async () => {
            const numericIds = allRelatedPaperIds.filter(id => !isNaN(Number(id)));

            if (numericIds.length === 0) return [];

            const promises = numericIds.map(id =>
                papersApi.getPaperById(Number(id))
                    .catch(() => null)
            );

            const results = await Promise.all(promises);
            return results.filter((p): p is PaperOut => p !== null);
        },
        enabled: allRelatedPaperIds.length > 0,
    });

    // 4. PaperOut -> Frontend Paper 변환 (Mock 데이터와 병합)
    const allPapers = useMemo(() => {
        const realPapers = (fetchedPapers || []).map(p => convertPaperOutToPaper(p, tagIdToName));
        return [...papers, ...realPapers];
    }, [fetchedPapers, tagIdToName]);

    const likedPapers = useMemo(() => {
        const likedIds = actions.filter((a) => a.liked).map((a) => a.paperId);
        return allPapers.filter((p) => likedIds.includes(p.id));
    }, [actions, allPapers]);

    const savedPapers = useMemo(() => {
        const savedIds = actions.filter((a) => a.saved).map((a) => a.paperId);
        return allPapers.filter((p) => savedIds.includes(p.id));
    }, [actions, allPapers]);

    const readPapers = useMemo(() => {
        const readIds = actions.filter((a) => a.readAt).map((a) => a.paperId);
        return allPapers.filter((p) => readIds.includes(p.id));
    }, [actions, allPapers]);

    const actionsWithDate = useMemo(() => actions.filter(a => a.readAt), [actions]);

    const readPapersWithDate = useMemo(() => {
        return actionsWithDate
            .map((action) => {
                const paper = allPapers.find((p) => p.id === action.paperId);
                if (!paper) return null;
                // date-fns parseISO needs to be imported or we check where it comes from
                // We need to import parseISO from date-fns in this file if not present
                return {
                    paper,
                    readAt: action.readAt!,
                    readDate: new Date(action.readAt!), // simple constructor or parseISO
                };
            })
            .filter(
                (item): item is { paper: any; readAt: string; readDate: Date } =>
                    item !== null
            );
    }, [actionsWithDate, allPapers]);

    return {
        user,
        prefs,
        allPapers,
        likedPapers,
        savedPapers,
        readPapers,
        actions,
        actionsWithDate,
        readPapersWithDate, // Added this
        papersLoading,
        tagIdToName
    };
}
