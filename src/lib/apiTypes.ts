// Backend API Types based on OpenAPI specification

// ============================================
// Common Types
// ============================================

export enum Site {
    ARXIV = 'arxiv',
    GITHUB = 'github',
}

export interface ErrorBody {
    code: string;
    message: string;
}

export interface ErrorResponse {
    error: ErrorBody;
}

// ============================================
// Paper Types
// ============================================

export interface PaperOut {
    id: number;
    title: string;
    short: string;
    authors: string[];
    year: number;
    image_url: string;
    raw_url: string;
    source: string;
    tags?: number[];
    is_liked?: boolean;
    is_scrapped?: boolean;
    like_count?: number;
    scrap_count?: number;
    recommend_score?: number;
    trending_score?: number;
    freshness_score?: number;
}

export interface PaperItem {
    paper: PaperOut;
}

export interface PagedPapersResponse {
    items: PaperItem[];
    count: number;
}

export interface GetPapersParams {
    q?: string; // 제목 검색 (부분 일치)
    tag?: number; // 태그 id 필터 (단일, 레거시)
    tags?: number[]; // 태그 id 필터 (복수, AND 조건)
    source?: Site; // 출처 필터
    sort?: 'popular' | 'recent';
    limit?: number;
    offset?: number;
}

// ============================================
// Summary Types
// ============================================

export interface SummaryResponse {
    style: string;
    hook: string;
    points: string[];
    detailed: string;
}

export interface GetSummaryParams {
    style?: string;
}

// ============================================
// Tag Types
// ============================================

export interface TagOut {
    id: number;
    name: string;
    description: string | null;
    count: number;
}

export interface TagItem {
    tag: TagOut;
}

export interface PagedTagsResponse {
    items: TagItem[];
    count: number;
}

export interface GetTagsParams {
    limit?: number;
    offset?: number;
}

export interface TrendingTagIdsResponse {
    tag_ids: number[];
}

export interface GetTrendingTagsParams {
    limit?: number;
    candidate_paper_limit?: number;
}

// ============================================
// Auth Types
// ============================================

export interface MeResponse {
    id: number;
    provider: string;
    email: string;
    name: string;
    is_admin: boolean;
    profile_image: string | null;
    meta?: Record<string, any>;
}

export interface RefreshResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface OAuthLoginParams {
    redirect_uri: string;
    remember?: boolean;
}

// ============================================
// Admin/Add Types
// ============================================

export interface AddTagBody {
    name: string;
    description?: string;
}

export interface TagResponse {
    id: number;
    name: string;
    description: string;
    count: number;
    created_at: string;
}

export interface AddPaperBody {
    title: string;
    short: string;
    authors?: string[];
    published_at: string;
    image_url: string;
    raw_url: string;
    source: string;
    tag_ids?: number[];
}

export interface PaperResponse {
    id: number;
    title: string;
    short: string;
    authors: string[];
    published_at: string;
    image_url: string;
    raw_url: string;
    source: string;
    created_at: string;
}

export interface AddSummaryBody {
    paper_id: number;
    style?: string;
    hook: string;
    points: string[];
    detailed: string;
}

export interface AddPaperTagsBody {
    tag_ids: number[];
}

export interface AttachTagsResponse {
    paper_id: number;
    attached: number;
}

// ============================================
// Legacy Types (for backward compatibility)
// ============================================

export interface Paper {
    id: string;
    title: string;
    authors: string[];
    year: number;
    venue: string;
    tags: string[];
    abstract: string;
    pdfUrl: string;
    imageUrl?: string;
    metrics: {
        trendingScore: number;
        recencyScore: number;
        recommendScore: number;
        citations: number;
    };
}

export interface Summary {
    paperId: string;
    hookOneLiner: string;
    keyPoints: string[];
    detailed: string;
    evidenceScope: 'abstract' | 'intro' | 'full';
}

export interface Report {
    id: string;
    title: string;
    summary: string;
    tags: string[];
    relatedPaperIds: string[];
    imageUrl?: string;
}
