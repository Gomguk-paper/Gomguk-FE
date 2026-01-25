import apiClient from '@/lib/apiClient';
import type { Summary } from '@/lib/apiTypes';

export const summariesApi = {
    // Get summary for a specific paper
    getSummaryByPaperId: async (paperId: string): Promise<Summary> => {
        const response = await apiClient.get<Summary>(`/summaries/${paperId}`);
        return response.data;
    },
};
