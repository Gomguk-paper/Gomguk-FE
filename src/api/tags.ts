import apiClient from '@/lib/apiClient';
import type { PagedTagsResponse, GetTagsParams, TrendingTagIdsResponse, GetTrendingTagsParams } from '@/lib/apiTypes';

export const tagsApi = {
    // Get all tags with pagination
    getTags: async (params?: GetTagsParams): Promise<PagedTagsResponse> => {
        const response = await apiClient.get<PagedTagsResponse>('/tags/', { params });
        return response.data;
    },

    // Get trending tag ids (ordered by trending score)
    getTrendingTagIds: async (params?: GetTrendingTagsParams): Promise<TrendingTagIdsResponse> => {
        const response = await apiClient.get<TrendingTagIdsResponse>('/tags/trending', { params });
        return response.data;
    },
};
