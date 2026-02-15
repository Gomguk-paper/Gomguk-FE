import { useMemo } from "react";
import {
    format,
    startOfWeek,
    subWeeks,
} from "date-fns";
import { ko } from "date-fns/locale/ko";

export function usePaperStats(
    readPapersWithDate: { paper: any; readAt: string; readDate: Date }[]
) {
    // 주별 읽기 통계
    const weeklyStats = useMemo(() => {
        const now = new Date();
        const weeksAgo = 4;
        const stats: { week: string; count: number }[] = [];

        for (let i = weeksAgo - 1; i >= 0; i--) {
            const weekStart = startOfWeek(subWeeks(now, i), { locale: ko });
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            const count = readPapersWithDate.filter((item) => {
                const readDate = item.readDate;
                return readDate >= weekStart && readDate <= weekEnd;
            }).length;

            stats.push({
                week: format(weekStart, "M/d", { locale: ko }),
                count,
            });
        }

        return stats;
    }, [readPapersWithDate]);

    // 태그별 읽기 분포
    const tagDistribution = useMemo(() => {
        const tagCounts: Record<string, number> = {};

        readPapersWithDate.forEach(({ paper }) => {
            paper.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // 상위 5개만 표시
    }, [readPapersWithDate]);

    return {
        weeklyStats,
        tagDistribution,
    };
}
