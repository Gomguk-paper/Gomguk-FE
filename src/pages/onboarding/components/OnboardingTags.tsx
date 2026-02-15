import { allTags } from "@/data/papers";
import { TagChip } from "@/components/TagChip";
import { UI_CONSTANTS } from "@/core/config/constants";

interface OnboardingTagsProps {
    selectedTags: string[];
    onToggle: (tag: string) => void;
}

export function OnboardingTags({ selectedTags, onToggle }: OnboardingTagsProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="font-display text-2xl font-bold">관심 분야를 선택하세요</h1>
                <p className="text-muted-foreground mt-2">
                    최소 {UI_CONSTANTS.PAPER.MIN_TAGS_FOR_ONBOARDING}개를 선택해주세요
                </p>
            </div>

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

            <p className="text-sm text-muted-foreground">
                선택됨: {selectedTags.length}개
            </p>
        </div>
    );
}
