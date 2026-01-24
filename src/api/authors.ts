import apiClient from '@/lib/apiClient';
import type { Author, Paper, GetAuthorsParams } from '@/lib/apiTypes';

export const authorsApi = {
    // Get all authors with optional filters
    getAuthors: async (params?: GetAuthorsParams): Promise<Author[]> => {
        const response = await apiClient.get<Author[]>('/authors', { params });
        return response.data;
    },

    // Get a single author by ID
    getAuthorById: async (id: string): Promise<Author> => {
        const response = await apiClient.get<Author>(`/authors/${id}`);
        return response.data;
    },

    // Get papers by a specific author
    getAuthorPapers: async (authorId: string): Promise<Paper[]> => {
        const response = await apiClient.get<Paper[]>(`/authors/${authorId}/papers`);
        return response.data;
    },
};
