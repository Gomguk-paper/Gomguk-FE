import apiClient from '@/lib/apiClient';
import type { SummaryResponse, GetSummaryParams } from '@/lib/apiTypes';

export const summariesApi = {
    // Get summary for a specific paper
    getSummaryByPaperId: async (
        paperId: number,
        params?: GetSummaryParams
    ): Promise<SummaryResponse> => {
        const response = await apiClient.get<SummaryResponse>(
            `/summary/${paperId}`,
            { params }
        );
        return response.data;
    },
};
