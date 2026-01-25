import { http, HttpResponse } from 'msw';
import {
    mockPapers,
    mockSummaries,
    mockReports,
    mockAuthors,
    mockTagDescriptions,
    mockAllTags,
} from './data/mockData';
import type { GetPapersParams, GetAuthorsParams, GetTrendingTagsParams, GetReportsParams } from '@/lib/apiTypes';

export const handlers = [
    // GET /api/papers - 논문 목록 조회
    http.get('/api/papers', ({ request }) => {
        try {
            const url = new URL(request.url);
            const tag = url.searchParams.get('tag');
            const sort = url.searchParams.get('sort') as 'trending' | 'recent' | 'citations' | null;
            const limit = url.searchParams.get('limit');

            // Check if mockPapers is defined
            if (!mockPapers) {
                console.error('mockPapers is undefined in handler');
                throw new Error('Database initialization error');
            }

            let filtered = [...mockPapers];

            // Filter by tag
            if (tag) {
                filtered = filtered.filter(paper =>
                    paper.tags.some(t => t.toLowerCase() === tag.toLowerCase())
                );
            }

            // Sort papers
            if (sort === 'trending') {
                filtered.sort((a, b) => b.metrics.trendingScore - a.metrics.trendingScore);
            } else if (sort === 'recent') {
                filtered.sort((a, b) => b.metrics.recencyScore - a.metrics.recencyScore);
            } else if (sort === 'citations') {
                filtered.sort((a, b) => b.metrics.citations - a.metrics.citations);
            } else {
                // Default: combination of trending and recency
                filtered.sort((a, b) =>
                    (b.metrics.trendingScore + b.metrics.recencyScore) -
                    (a.metrics.trendingScore + a.metrics.recencyScore)
                );
            }

            // Limit results
            if (limit) {
                filtered = filtered.slice(0, parseInt(limit));
            }

            return HttpResponse.json(filtered);
        } catch (error) {
            console.error('Error in GET /api/papers:', error);
            return HttpResponse.json(
                { error: 'Internal Server Error', details: String(error) },
                { status: 500 }
            );
        }
    }),

    // GET /api/papers/:id - 특정 논문 상세 조회
    http.get('/api/papers/:id', ({ params }) => {
        try {
            const { id } = params;
            if (!mockPapers) throw new Error('mockPapers not initialized');

            const paper = mockPapers.find(p => p.id === id);

            if (!paper) {
                return HttpResponse.json(
                    { error: 'Paper not found' },
                    { status: 404 }
                );
            }

            return HttpResponse.json(paper);
        } catch (error) {
            console.error('Error in GET /api/papers/:id:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),

    // GET /api/summaries/:paperId - 논문 요약 조회
    http.get('/api/summaries/:paperId', ({ params }) => {
        try {
            const { paperId } = params;
            if (!mockSummaries) throw new Error('mockSummaries not initialized');

            const summary = mockSummaries.find(s => s.paperId === paperId);

            if (!summary) {
                return HttpResponse.json(
                    { error: 'Summary not found' },
                    { status: 404 }
                );
            }

            return HttpResponse.json(summary);
        } catch (error) {
            console.error('Error in GET /api/summaries/:paperId:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),

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
            console.error('Error in GET /api/reports:', error);
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
            console.error('Error in GET /api/reports/:id:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),

    // GET /api/authors - 저자 목록 조회
    http.get('/api/authors', ({ request }) => {
        try {
            const url = new URL(request.url);
            const recommended = url.searchParams.get('recommended');
            const limit = url.searchParams.get('limit');

            if (!mockAuthors) throw new Error('mockAuthors not initialized');

            let filtered = [...mockAuthors];

            // Limit results
            if (limit) {
                filtered = filtered.slice(0, parseInt(limit));
            }

            return HttpResponse.json(filtered);
        } catch (error) {
            console.error('Error in GET /api/authors:', error);
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
            console.error('Error in GET /api/authors/:id:', error);
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
            // Safe access to author name parts
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
            console.error('Error in GET /api/authors/:id/papers:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),

    // GET /api/tags - 태그 목록 및 설명
    http.get('/api/tags', () => {
        try {
            if (!mockAllTags || !mockPapers) throw new Error('Data not initialized');

            const tagsWithInfo = mockAllTags.map(tag => ({
                name: tag,
                description: mockTagDescriptions[tag] || `${tag} 관련 논문`,
                count: mockPapers.filter(p => p.tags.includes(tag)).length,
            }));

            return HttpResponse.json(tagsWithInfo);
        } catch (error) {
            console.error('Error in GET /api/tags:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),

    // GET /api/tags/trending - 트렌딩 태그
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
            console.error('Error in GET /api/tags/trending:', error);
            return HttpResponse.json({ error: String(error) }, { status: 500 });
        }
    }),
];
