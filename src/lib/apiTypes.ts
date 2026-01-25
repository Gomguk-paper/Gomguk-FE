// Re-export types from models for API responses
export type { Paper, Summary, Report } from '@/models';
export type { Author, EducationEntry, PositionEntry } from '@/data/authors';

// API Response wrappers
export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// API Request parameters
export interface GetPapersParams {
    tag?: string;
    sort?: 'trending' | 'recent' | 'citations';
    limit?: number;
    page?: number;
}

export interface GetAuthorsParams {
    recommended?: boolean;
    limit?: number;
}

export interface GetTrendingTagsParams {
    limit?: number;
}

export interface GetReportsParams {
    limit?: number;
    tag?: string;
}

// Tag with description
export interface TagInfo {
    name: string;
    description: string;
    count?: number;
}
