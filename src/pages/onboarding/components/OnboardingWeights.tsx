import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { TagChip } from "@/components/TagChip";

interface OnboardingWeightsProps {
    selectedTags: string[];
    weights: Record<string, number>;
    onSetWeight: (tag: string, weight: number) => void;
}

export function OnboardingWeights({
    selectedTags,
    weights,
    onSetWeight,
}: OnboardingWeightsProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="font-display text-2xl font-bold">관심도를 설정하세요</h1>
                <p className="text-muted-foreground mt-2">각 분야별 관심 정도를 별점으로</p>
            </div>

            <div className="space-y-4">
                {selectedTags.map((tag) => (
                    <div
                        key={tag}
                        className="flex items-center gap-4 p-3 bg-card rounded-lg border"
                    >
                        <TagChip tag={tag} size="sm" />
                        <div className="flex-1" />
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((w) => (
                                <button
                                    key={w}
                                    onClick={() => onSetWeight(tag, w)}
                                    className="p-1"
                                >
                                    <Star
                                        className={cn(
                                            "w-5 h-5 transition-colors",
                                            w <= (weights[tag] || 3)
                                                ? "fill-primary text-primary"
                                                : "text-muted"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
