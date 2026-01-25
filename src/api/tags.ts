import apiClient from '@/lib/apiClient';
import type { TagInfo, GetTrendingTagsParams } from '@/lib/apiTypes';

export const tagsApi = {
    // Get all tags with descriptions
    getTags: async (): Promise<TagInfo[]> => {
        const response = await apiClient.get<TagInfo[]>('/tags');
        return response.data;
    },

    // Get trending tags
    getTrendingTags: async (params?: GetTrendingTagsParams): Promise<TagInfo[]> => {
        const response = await apiClient.get<TagInfo[]>('/tags/trending', { params });
        return response.data;
    },
};
