import { useMemo } from "react";
import { convertPaperOutToPaper } from "@/lib/paperUtils";
import type { PaperOut, PagedPapersResponse } from "@/lib/apiTypes";

interface UseRecommendedPapersProps {
    pages: PagedPapersResponse[] | undefined;
    tagMap: Record<number, string>;
}

export const useRecommendedPapers = ({ pages, tagMap }: UseRecommendedPapersProps) => {
    const sortedPapers = useMemo(() => {
        if (!pages) return [];
        return pages.flatMap(page =>
            page.items.map(item => convertPaperOutToPaper(item.paper, tagMap))
        );
    }, [pages, tagMap]);

    return { sortedPapers };
};
