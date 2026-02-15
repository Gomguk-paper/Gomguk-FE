import { useMemo } from "react";
import { convertPaperOutToPaper } from "@/lib/paperUtils";
import type { PaperOut } from "@/lib/apiTypes";

interface UseRecommendedPapersProps {
    papersResponse: { items: { paper: PaperOut }[] } | undefined;
    tagMap: Record<number, string>;
    prefs: any; // Using 'any' for now to match current usage, should ideally be typed
}

export const useRecommendedPapers = ({ papersResponse, tagMap, prefs }: UseRecommendedPapersProps) => {
    // Extract and convert papers from the response
    const papers = useMemo(() => {
        if (!papersResponse?.items) {
            return [];
        }
        return papersResponse.items.map(item => convertPaperOutToPaper(item.paper, tagMap));
    }, [papersResponse, tagMap]);

    // Sort papers by personalized score
    const sortedPapers = useMemo(() => {
        // Defensive check: ensure papers have metrics
        const validPapers = Array.isArray(papers)
            ? papers.filter((p: any) => p && p.metrics && !String(p.id).startsWith('p')) // Filter out mock papers
            : [];

        return [...validPapers].sort((a: any, b: any) => {
            const scoreA = (a.metrics?.trendingScore || 0) + (a.metrics?.recencyScore || 0);
            const scoreB = (b.metrics?.trendingScore || 0) + (b.metrics?.recencyScore || 0);

            let weightedScoreA = scoreA;
            let weightedScoreB = scoreB;

            if (prefs?.tags) {
                prefs.tags.forEach(({ name, weight }: any) => {
                    if (a.tags?.some((t: string) => t.toLowerCase() === name.toLowerCase())) {
                        weightedScoreA += weight * 10;
                    }
                    if (b.tags?.some((t: string) => t.toLowerCase() === name.toLowerCase())) {
                        weightedScoreB += weight * 10;
                    }
                });
            }

            return weightedScoreB - weightedScoreA;
        });
    }, [papers, prefs]);

    return { sortedPapers };
};
