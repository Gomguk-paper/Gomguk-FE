import apiClient from '@/lib/apiClient';
import type { RefreshResponse, OAuthLoginParams } from '@/lib/apiTypes';

export const authApi = {
    // Start OAuth login flow
    loginWithOAuth: (provider: string, params: OAuthLoginParams): void => {
        const queryParams = new URLSearchParams({
            redirect_uri: params.redirect_uri,
            remember: params.remember ? 'true' : 'false',
        });
        window.location.href = `/api/oauth/${provider}/login?${queryParams.toString()}`;
    },

    getGoogleLoginUrl: (redirectUri: string): string => {
        return `http://localhost:8000/api/oauth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
    },

    // Refresh access token
    refreshAccessToken: async (): Promise<RefreshResponse> => {
        const response = await apiClient.post<RefreshResponse>('/auth/refresh');
        return response.data;
    },

    // Logout
    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
        localStorage.removeItem('access_token');
    },
};
