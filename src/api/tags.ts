import apiClient from '@/lib/apiClient';
import type { PagedTagsResponse, GetTagsParams } from '@/lib/apiTypes';

export const tagsApi = {
    // Get all tags with pagination
    getTags: async (params?: GetTagsParams): Promise<PagedTagsResponse> => {
        const response = await apiClient.get<PagedTagsResponse>('/tags/', { params });
        return response.data;
    },
};
