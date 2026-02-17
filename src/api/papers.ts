import apiClient from '@/lib/apiClient';
import type {
    PaperOut,
    PagedPapersResponse,
    GetPapersParams
} from '@/lib/apiTypes';

/** FastAPI가 list[int] Query로 받으려면 tags=1&tags=2 형태로 보내야 함. URLSearchParams로 배열을 반복 키로 직렬화 */
function buildPaperListParams(params?: GetPapersParams): URLSearchParams {
    const sp = new URLSearchParams();
    if (!params) return sp;
    const { tags, ...rest } = params;
    Object.entries(rest).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        sp.append(key, String(value));
    });
    if (tags?.length) {
        tags.forEach((id) => sp.append('tags', String(id)));
    }
    return sp;
}

export const papersApi = {
    // Get all papers with optional filters
    getPapers: async (params?: GetPapersParams): Promise<PagedPapersResponse> => {
        const response = await apiClient.get<PagedPapersResponse>('/paper/', {
            params: buildPaperListParams(params),
        });
        return response.data;
    },

    // Get recommended paper feed
    getPaperFeed: async (params?: GetPapersParams): Promise<PagedPapersResponse> => {
        const response = await apiClient.get<PagedPapersResponse>('/paper/feed', { params });
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

    // Mark a paper as viewed
    markPaperViewed: async (paperId: number): Promise<void> => {
        await apiClient.put(`/paper/${paperId}/view`);
    },
};
