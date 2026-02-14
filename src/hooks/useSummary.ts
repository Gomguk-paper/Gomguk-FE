import { useQuery } from '@tanstack/react-query';
import { summariesApi } from '@/api';
import type { Summary } from '@/models';

/**
 * 백엔드 SummaryResponse.style을 프론트엔드 Summary.evidenceScope로 변환
 */
const styleToEvidenceScope = (style: string): Summary['evidenceScope'] => {
    switch (style) {
        case 'detailed':
            return 'full';
        case 'dc':
            return 'intro';
        case 'plain':
        default:
            return 'abstract';
    }
};

/**
 * 논문 ID로 요약 데이터를 백엔드 API에서 가져오는 커스텀 훅
 *
 * - GET /api/summary/{paper_id} 호출 (React Query 캐싱)
 * - 백엔드 응답 형식(hook/points/detailed)을 프론트엔드 형식(hookOneLiner/keyPoints/detailed)으로 변환
 * - paperId가 없거나 숫자가 아니면 API 호출하지 않음
 * - 에러(404 등) 시 summary를 null로 반환 (fallback은 컴포넌트에서 처리)
 */
export function useSummary(paperId: string | undefined) {
    const numericId = paperId ? Number(paperId) : undefined;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['summary', numericId],
        queryFn: () => summariesApi.getSummaryByPaperId(numericId!),
        enabled: !!numericId && !isNaN(numericId),
        staleTime: 5 * 60 * 1000, // 5분 캐시
        retry: 1,
    });

    const summary: Summary | null = data
        ? {
              paperId: paperId!,
              hookOneLiner: data.hook,
              keyPoints: data.points,
              detailed: data.detailed,
              evidenceScope: styleToEvidenceScope(data.style),
          }
        : null;

    return { summary, isLoading, isError };
}
