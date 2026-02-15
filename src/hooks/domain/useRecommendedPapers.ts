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
            ? papers.filter((p: any) => p && !String(p.id).startsWith('p')) // Filter out mock papers
            : [];

        // Server side sorting is now used via /papers/feed
        return validPapers;
    }, [papers]);

    return { sortedPapers };
};
