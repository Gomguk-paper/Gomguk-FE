import { useQuery } from "@tanstack/react-query";
import { papersApi } from "@/api";

export const usePaperFeedQuery = () => {
    return useQuery({
        queryKey: ['paper-feed'],
        queryFn: () => papersApi.getPaperFeed({ limit: 50, offset: 0 }),
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
