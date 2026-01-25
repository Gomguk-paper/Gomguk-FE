import apiClient from '@/lib/apiClient';
import type { Paper, GetPapersParams } from '@/lib/apiTypes';

export const papersApi = {
    // Get all papers with optional filters
    getPapers: async (params?: GetPapersParams): Promise<Paper[]> => {
        const response = await apiClient.get<Paper[]>('/papers', { params });
        return response.data;
    },

    // Get a single paper by ID
    getPaperById: async (id: string): Promise<Paper> => {
        const response = await apiClient.get<Paper>(`/papers/${id}`);
        return response.data;
    },
};
