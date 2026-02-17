import { History, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagChip } from "@/components/TagChip";

interface SearchRecommendationsProps {
    history: string[];
    handleSearch: (term: string) => void;
    removeHistory: (term: string) => void;
    trendingTags: string[];
    isTrendingTag: (tag: string) => boolean;
    selectedTags: string[];
    handleTagClick: (tag: string) => void;
}

export function SearchRecommendations({
    history,
    handleSearch,
    removeHistory,
    trendingTags,
    isTrendingTag,
    selectedTags,
    handleTagClick,
}: SearchRecommendationsProps) {
    return (
        <div className="space-y-6">
            {/* Search History */}
            {history.length > 0 && (
                <section className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-display font-semibold text-sm text-muted-foreground">
                            최근 검색어
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => {
                                // Clear all history
                                history.forEach(term => removeHistory(term));
                            }}
                        >
                            전체 삭제
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {history.map((term) => (
                            <div
                                key={term}
                                className="group flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                                onClick={() => handleSearch(term)}
                            >
                                <History className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-sm text-foreground">{term}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeHistory(term);
                                    }}
                                    className="ml-1 p-0.5 rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Popular Tags */}
            <section className="p-4 pt-0">
                <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3">
                    인기 태그
                </h2>
                <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag) => (
                        <TagChip
                            key={tag}
                            tag={tag}
                            selected={selectedTags.includes(tag)}
                            trending={isTrendingTag(tag)}
                            onClick={() => handleTagClick(tag)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
