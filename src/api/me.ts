import apiClient from '@/lib/apiClient';
import type { MeResponse, PagedPapersResponse } from '@/lib/apiTypes';

interface PaginationParams {
    limit?: number;
    offset?: number;
}

export const meApi = {
    // Get my user info
    getMe: async (): Promise<MeResponse> => {
        const response = await apiClient.get<MeResponse>('/me/');
        return response.data;
    },

    // Get liked papers
    getLikedPapers: async (params?: PaginationParams): Promise<PagedPapersResponse> => {
        const response = await apiClient.get<PagedPapersResponse>('/me/papers/liked', { params });
        return response.data;
    },

    // Get saved (scrapped) papers
    getSavedPapers: async (params?: PaginationParams): Promise<PagedPapersResponse> => {
        const response = await apiClient.get<PagedPapersResponse>('/me/papers/saved', { params });
        return response.data;
    },

    // Get recently read papers
    getReadPapers: async (params?: PaginationParams): Promise<PagedPapersResponse> => {
        const response = await apiClient.get<PagedPapersResponse>('/me/papers/read', { params });
        return response.data;
    },

    // 온보딩 태그 선호도 저장
    setOnboardingTags: async (tagPreferences: Record<string, number>): Promise<void> => {
        await apiClient.put('/me/onboarding-tags', { tag_preferences: tagPreferences });
    },

    // 계정 탈퇴 (DELETE /me/)
    withdraw: async (): Promise<void> => {
        await apiClient.delete('/me/');
    },
};
