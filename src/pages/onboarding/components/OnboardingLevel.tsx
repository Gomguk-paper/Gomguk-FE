import { cn } from "@/lib/utils";
import { levels } from "../hooks/useOnboarding";

interface OnboardingLevelProps {
    currentLevel: string;
    onSelect: (level: typeof levels[number]["value"]) => void;
}

export function OnboardingLevel({ currentLevel, onSelect }: OnboardingLevelProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="font-display text-2xl font-bold">당신은 누구신가요?</h1>
                <p className="text-muted-foreground mt-2">맞춤형 요약 난이도를 조절해요</p>
            </div>

            <div className="space-y-3">
                {levels.map((l) => (
                    <button
                        key={l.value}
                        onClick={() => onSelect(l.value)}
                        className={cn(
                            "w-full p-4 rounded-lg border text-left transition-all",
                            currentLevel === l.value
                                ? "border-primary bg-primary/5 ring-2 ring-primary"
                                : "border-border bg-card hover:border-primary/50"
                        )}
                    >
                        <div className="font-medium">{l.label}</div>
                        <div className="text-sm text-muted-foreground">{l.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
