import { RefObject } from "react";
import { PaperCard } from "@/components/PaperCard";
import { PaperCardSkeleton } from "@/components/PaperCardSkeleton";
import { Paper } from "@/models";

interface SearchResultsProps {
    isLoading: boolean;
    filteredCount: number;
    papers: Paper[];
    onOpenSummary: (index: number) => void;
    title: string;
    loadMoreRef?: RefObject<HTMLDivElement | null>;
    isFetchingNextPage?: boolean;
}

export function SearchResults({
    isLoading,
    filteredCount,
    papers,
    onOpenSummary,
    title,
    loadMoreRef,
    isFetchingNextPage,
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
                <>
                    <div className="space-y-4">
                        {papers.map((paper, index) => (
                            <PaperCard key={paper.id} paper={paper} onOpenSummary={() => onOpenSummary(index)} />
                        ))}
                    </div>
                    {/* 무한 스크롤 트리거 */}
                    <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-4">
                        {isFetchingNextPage && (
                            <div className="text-sm text-muted-foreground">더 불러오는 중...</div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>검색 결과가 없습니다</p>
                    <p className="text-sm mt-1">다른 키워드로 시도해보세요</p>
                </div>
            )}
        </section>
    );
}
