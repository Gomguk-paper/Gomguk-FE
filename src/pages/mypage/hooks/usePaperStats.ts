import { useMemo } from "react";

export function usePaperStats(readPapers: { tags: string[] }[]) {
    const tagDistribution = useMemo(() => {
        const tagCounts: Record<string, number> = {};
        readPapers.forEach((paper) => {
            paper.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [readPapers]);

    return {
        tagDistribution,
    };
}
