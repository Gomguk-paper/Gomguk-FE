import { useQuery } from "@tanstack/react-query";
import { papersApi } from "@/api";

export const usePapersQuery = () => {
    return useQuery({
        queryKey: ['papers'],
        queryFn: () => papersApi.getPapers({ limit: 100, offset: 0 }),
        retry: 1,
    });
};
