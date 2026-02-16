import { useQuery } from '@tanstack/react-query';
import { summariesApi } from '@/api/summaries';
import { SummaryResponse } from '@/lib/apiTypes';

export const useSummaryQuery = (paperId: number | string) => {
    const id = typeof paperId === 'string' ? parseInt(paperId, 10) : paperId;
    const isValidId = !isNaN(id) && id > 0;

    return useQuery<SummaryResponse>({
        queryKey: ['summary', id],
        queryFn: () => summariesApi.getSummaryByPaperId(id),
        enabled: isValidId,
        retry: (failureCount, error: any) => {
            // Don't retry on 404s
            if (error.response?.status === 404) return false;
            return failureCount < 1;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
