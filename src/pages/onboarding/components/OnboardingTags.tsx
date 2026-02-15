import { useMemo } from "react";
import { TagChip } from "@/components/TagChip";
import { UI_CONSTANTS } from "@/core/config/constants";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";

interface OnboardingTagsProps {
    selectedTags: string[];
    onToggle: (tag: string) => void;
}

export function OnboardingTags({ selectedTags, onToggle }: OnboardingTagsProps) {
    const { tagsResponse, isLoading } = useTagsQuery();

    const allTags = useMemo(() => {
        if (!tagsResponse) return [];
        return tagsResponse.map(item => item.tag.name);
    }, [tagsResponse]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="font-display text-2xl font-bold">관심 분야를 선택하세요</h1>
                <p className="text-muted-foreground mt-2">
                    최소 {UI_CONSTANTS.PAPER.MIN_TAGS_FOR_ONBOARDING}개를 선택해주세요
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-8 w-20 bg-secondary rounded-full animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                        <TagChip
                            key={tag}
                            tag={tag}
                            selected={selectedTags.includes(tag)}
                            onClick={() => onToggle(tag)}
                        />
                    ))}
                </div>
            )}

            <p className="text-sm text-muted-foreground">
                선택됨: {selectedTags.length}개
            </p>
        </div>
    );
}
