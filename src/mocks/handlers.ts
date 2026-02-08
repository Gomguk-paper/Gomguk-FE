import { http, HttpResponse, passthrough } from 'msw';
import {
    mockReports,
    mockAuthors,
    mockTagDescriptions,
    mockAllTags,
    mockPapers,
} from './data/mockData';

// MSW handlers - 백엔드에서 미구현된 API만 mock 처리
// ✅ 구현된 API (실제 서버로 통과): /api/paper, /api/summary, /api/auth, /api/me, /api/oauth
// ⚠️ 미구현 API (mock 처리): /api/authors, /api/reports, /api/tags

export const handlers = [
    // ============================================
    // 미구현 API - Authors (Mock)
    // ============================================

    // GET /api/authors - 저자 목록 조회
    http.get('/api/authors', ({ request }) => {
        try {
            const url = new URL(request.url);
            const recommended = url.searchParams.get('recommended');
            const limit = url.searchParams.get('limit');

            if (!mockAuthors) throw new Error('mockAuthors not initialized');

            let filtered = [...mockAuthors];

            // Filter recommended authors
            if (recommended === 'true') {
                filtered = filtered
                    .sort((a, b) => b.stats.totalCitations - a.stats.totalCitations)
                    .slice(0, parseInt(limit || '5'));
            } else if (limit) {
                filtered = filtered.slice(0, parseInt(limit));
            }

            return HttpResponse.json(filtered);
        } catch (error) {
            console.error('[MSW] Error in GET /api/authors:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),

    // GET /api/authors/:id - 특정 저자 정보 조회
    http.get('/api/authors/:id', ({ params }) => {
        try {
            const { id } = params;
            if (!mockAuthors) throw new Error('mockAuthors not initialized');

            const author = mockAuthors.find(a => a.id === id);

            if (!author) {
                return HttpResponse.json(
                    { error: 'Author not found' },
                    { status: 404 }
                );
            }

            return HttpResponse.json(author);
        } catch (error) {
            console.error('[MSW] Error in GET /api/authors/:id:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),

    // GET /api/authors/:id/papers - 저자의 논문 목록
    http.get('/api/authors/:id/papers', ({ params }) => {
        try {
            const { id } = params;
            if (!mockAuthors || !mockPapers) throw new Error('Data not initialized');

            const author = mockAuthors.find(a => a.id === id);

            if (!author) {
                return HttpResponse.json(
                    { error: 'Author not found' },
                    { status: 404 }
                );
            }

            // Filter papers that include the author's name
            const authorLastName = author.name.split(' ')[1]?.toLowerCase();
            const authorFullName = author.name.toLowerCase();

            const authorPapers = mockPapers.filter(paper =>
                paper.authors.some(a => {
                    const aLower = a.toLowerCase();
                    return aLower.includes(authorLastName || authorFullName) || aLower === authorFullName;
                })
            );

            return HttpResponse.json(authorPapers);
        } catch (error) {
            console.error('[MSW] Error in GET /api/authors/:id/papers:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),

    // ============================================
    // 미구현 API - Reports (Mock)
    // ============================================

    // GET /api/reports - 기술 리포트 목록
    http.get('/api/reports', ({ request }) => {
        try {
            const url = new URL(request.url);
            const limit = url.searchParams.get('limit');
            const tag = url.searchParams.get('tag');

            if (!mockReports) throw new Error('mockReports not initialized');

            let filtered = [...mockReports];

            // Filter by tag
            if (tag) {
                filtered = filtered.filter(report =>
                    report.tags.some(t => t.toLowerCase() === tag.toLowerCase())
                );
            }

            // Limit results
            if (limit) {
                filtered = filtered.slice(0, parseInt(limit));
            }

            return HttpResponse.json(filtered);
        } catch (error) {
            console.error('[MSW] Error in GET /api/reports:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),

    // GET /api/reports/:id - 특정 리포트 조회
    http.get('/api/reports/:id', ({ params }) => {
        try {
            const { id } = params;
            if (!mockReports) throw new Error('mockReports not initialized');

            const report = mockReports.find(r => r.id === id);

            if (!report) {
                return HttpResponse.json(
                    { error: 'Report not found' },
                    { status: 404 }
                );
            }

            return HttpResponse.json(report);
        } catch (error) {
            console.error('[MSW] Error in GET /api/reports/:id:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),

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
