import { useMemo } from "react";
import { convertPaperOutToPaper } from "@/lib/paperUtils";
import type { PaperOut, PaperItem, PagedPapersResponse } from "@/lib/apiTypes";

interface UseRecommendedPapersProps {
    pages: PagedPapersResponse[] | undefined;
    tagMap: Record<number, string>;
}

export const useRecommendedPapers = ({ pages, tagMap }: UseRecommendedPapersProps) => {
    const sortedPapers = useMemo(() => {
        if (!pages) return [];
        return pages.flatMap(page =>
            page.items.map((item: PaperItem | Record<string, unknown>) => {
                const rawPaper = "paper" in item && item.paper != null ? item.paper : item;
                return convertPaperOutToPaper(rawPaper as PaperOut, tagMap);
            })
        );
    }, [pages, tagMap]);

    return { sortedPapers };
};
