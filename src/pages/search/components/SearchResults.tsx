import { PaperCard } from "@/components/PaperCard";
import { PaperCardSkeleton } from "@/components/PaperCardSkeleton";
import { Paper } from "@/models";

interface SearchResultsProps {
    isLoading: boolean;
    filteredCount: number;
    papers: Paper[]; // This should match carouselPapers type which is Paper[]
    onOpenSummary: (index: number) => void;
    showTitle?: boolean; // New prop to control "Search Results" title if needed logic differs?
    // Actually the title logic "Search Results" or "All Papers" depends on query/tags.
    // The parent passes the title string or boolean.
    title: string;
}

export function SearchResults({
    isLoading,
    filteredCount,
    papers,
    onOpenSummary,
    title,
}: SearchResultsProps) {
    return (
        <section className="p-4">
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-sm text-muted-foreground">
                    {title}
                </h2>
                <span className="text-xs text-muted-foreground">{isLoading ? "..." : `${filteredCount}개`}</span>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <PaperCardSkeleton key={i} />
                    ))}
                </div>
            ) : papers.length > 0 ? (
                <div className="space-y-4">
                    {papers.map((paper, index) => (
                        <PaperCard key={paper.id} paper={paper} onOpenSummary={() => onOpenSummary(index)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>검색 결과가 없습니다</p>
                    <p className="text-sm mt-1">다른 키워드로 시도해보세요</p>
                </div>
            )}
        </section>
    );
}
