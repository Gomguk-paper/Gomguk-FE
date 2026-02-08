import apiClient from '@/lib/apiClient';
import type {
    PaperOut,
    PagedPapersResponse,
    GetPapersParams
} from '@/lib/apiTypes';

export const papersApi = {
    // Get all papers with optional filters
    getPapers: async (params?: GetPapersParams): Promise<PagedPapersResponse> => {
        const response = await apiClient.get<PagedPapersResponse>('/paper/', { params });
        return response.data;
    },

    // Get a single paper by ID
    getPaperById: async (id: number): Promise<PaperOut> => {
        const response = await apiClient.get<PaperOut>(`/paper/${id}`);
        return response.data;
    },

    // Like a paper
    likePaper: async (paperId: number): Promise<void> => {
        await apiClient.put(`/paper/${paperId}/like`);
    },

    // Unlike a paper
    unlikePaper: async (paperId: number): Promise<void> => {
        await apiClient.delete(`/paper/${paperId}/like`);
    },

    // Scrap a paper
    scrapPaper: async (paperId: number): Promise<void> => {
        await apiClient.put(`/paper/${paperId}/scrap`);
    },

    // Unscrap a paper
    unscrapPaper: async (paperId: number): Promise<void> => {
        await apiClient.delete(`/paper/${paperId}/scrap`);
    },
};
