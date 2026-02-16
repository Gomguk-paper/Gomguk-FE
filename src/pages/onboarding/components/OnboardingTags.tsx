import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { TagChip } from "@/components/TagChip";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";

interface OnboardingTagsProps {
    selectedTags: string[];
    onToggle: (tag: string) => void;
}

export function OnboardingTags({ selectedTags, onToggle }: OnboardingTagsProps) {
    const { tagsResponse, isLoading } = useTagsQuery();
    const [searchQuery, setSearchQuery] = useState("");

    const allTags = useMemo(() => {
        if (!tagsResponse) return [];
        return tagsResponse.map(item => item.tag.name);
    }, [tagsResponse]);

    const filteredTags = useMemo(() => {
        if (!searchQuery.trim()) return allTags;
        const q = searchQuery.toLowerCase();
        return allTags.filter(tag => tag.toLowerCase().includes(q));
    }, [allTags, searchQuery]);

    return (
        <div className="space-y-4 animate-fade-in">
            <div>
                <h1 className="font-display text-2xl font-bold">관심 분야를 선택하세요</h1>
                <p className="text-muted-foreground mt-2">
                    최소 1개를 선택해주세요
                </p>
            </div>

            {/* 태그 검색 */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="태그 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* 선택된 태그 표시 */}
            {selectedTags.length > 0 && !searchQuery && (
                <div>
                    <p className="text-xs text-muted-foreground mb-2">선택됨 ({selectedTags.length}개)</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                            <TagChip
                                key={tag}
                                tag={tag}
                                selected
                                onClick={() => onToggle(tag)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 태그 목록 */}
            {isLoading ? (
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-8 w-20 bg-secondary rounded-full animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-2 max-h-[50vh] overflow-y-auto scrollbar-hide">
                    {filteredTags.map((tag) => (
                        <TagChip
                            key={tag}
                            tag={tag}
                            selected={selectedTags.includes(tag)}
                            onClick={() => onToggle(tag)}
                        />
                    ))}
                    {filteredTags.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4">
                            "{searchQuery}"에 해당하는 태그가 없습니다
                        </p>
                    )}
                </div>
            )}

            {searchQuery && (
                <p className="text-sm text-muted-foreground">
                    선택됨: {selectedTags.length}개
                </p>
            )}
        </div>
    );
}
