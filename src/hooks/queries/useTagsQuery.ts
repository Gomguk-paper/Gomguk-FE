import { useQuery } from "@tanstack/react-query";
import { tagsApi } from "@/api";
import { useMemo } from "react";

export const useTagsQuery = () => {
    const { data: tagsResponse, isLoading, error } = useQuery({
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
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });

    const tagMap = useMemo(() => {
        const map: Record<number, string> = {};
        if (tagsResponse) {
            tagsResponse.forEach(item => {
                map[item.tag.id] = item.tag.name;
            });
        }
        return map;
    }, [tagsResponse]);

    return { tagsResponse, tagMap, isLoading, error };
};
