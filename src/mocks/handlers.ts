import { http, HttpResponse, passthrough } from 'msw';
import {
    mockTagDescriptions,
    mockAllTags,
    mockPapers,
} from './data/mockData';

// MSW handlers - 백엔드에서 미구현된 API만 mock 처리
// ✅ 구현된 API (실제 서버로 통과): /api/paper, /api/summary, /api/auth, /api/me, /api/oauth
// ⚠️ 미구현 API (mock 처리): /api/tags

export const handlers = [
    // ============================================
    // 미구현 API - Tags (Mock - 선택적)
    // ============================================

    // 백엔드에 GET /api/tags가 있다면 이 핸들러는 제거하세요
    // 지금은 미구현으로 가정하고 mock 처리
    http.get('/api/tags/trending', ({ request }) => {
        try {
            const url = new URL(request.url);
            const limit = url.searchParams.get('limit');

            if (!mockPapers) throw new Error('mockPapers not initialized');

            // Calculate tag counts
            const tagCounts: Record<string, number> = {};
            mockPapers.forEach(paper => {
                paper.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            });

            // Sort by count
            let trending = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => ({
                    name: tag,
                    description: mockTagDescriptions[tag] || `${tag} 관련 논문`,
                    count,
                }));

            // Limit results
            if (limit) {
                trending = trending.slice(0, parseInt(limit));
            }

            return HttpResponse.json(trending);
        } catch (error) {
            console.error('[MSW] Error in GET /api/tags/trending:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),

    // ============================================
    // 구현된 API는 실제 백엔드로 통과
    // ============================================
    // /api/paper/* - 실제 백엔드
    // /api/summary/* - 실제 백엔드
    // /api/auth/* - 실제 백엔드
    // /api/me/* - 실제 백엔드
    // /api/oauth/* - 실제 백엔드
    // /api/add/* - 실제 백엔드
];
