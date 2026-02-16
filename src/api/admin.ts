import apiClient from '@/lib/apiClient';
import type {
    AddTagBody,
    TagResponse,
    AddPaperBody,
    PaperResponse,
    AddSummaryBody,
    SummaryResponse,
    AddPaperTagsBody,
    AttachTagsResponse
} from '@/lib/apiTypes';

export const adminApi = {
    // Create a new tag
    createTag: async (body: AddTagBody): Promise<TagResponse> => {
        const response = await apiClient.post<TagResponse>('/add/tag', body);
        return response.data;
    },

    // Create a new paper
    createPaper: async (body: AddPaperBody): Promise<PaperResponse> => {
        const response = await apiClient.post<PaperResponse>('/add/paper', body);
        return response.data;
    },

    // Create a summary for a paper
    createSummary: async (body: AddSummaryBody): Promise<SummaryResponse> => {
        const response = await apiClient.post<SummaryResponse>('/add/summary', body);
        return response.data;
    },

    // Attach tags to a paper
    attachTagsToPaper: async (
        paperId: number,
        body: AddPaperTagsBody
    ): Promise<AttachTagsResponse> => {
        const response = await apiClient.post<AttachTagsResponse>(
            `/add/paper/${paperId}/tags`,
            body
        );
        return response.data;
    },
};
