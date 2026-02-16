import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { useOnboarding } from "@/pages/onboarding/hooks/useOnboarding";
import { OnboardingTags } from "@/pages/onboarding/components/OnboardingTags";
import { OnboardingWeights } from "@/pages/onboarding/components/OnboardingWeights";
import { OnboardingLevel } from "@/pages/onboarding/components/OnboardingLevel";

export default function Onboarding() {
  const {
    step,
    selectedTags,
    tagWeights,
    level,
    fromSettings,
    toggleTag,
    setWeight,
    setLevel,
    nextStep,
    prevStep,
    handleSkip,
    canProceed,
  } = useOnboarding();

  return (
    <main className="min-h-screen flex flex-col p-6 bg-background">
      {/* Skip Button */}
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="gap-2 text-muted-foreground"
        >
          <X className="w-4 h-4" />
          건너뛰기
        </Button>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {(fromSettings ? ["tags", "weights"] : ["tags", "weights", "level"]).map(
          (s, i) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                ["tags", "weights", "level"].indexOf(step) >= i
                  ? "bg-primary"
                  : "bg-muted"
              )}
            />
          )
        )}
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full">
        {step === "tags" && (
          <OnboardingTags
            selectedTags={selectedTags}
            onToggle={toggleTag}
          />
        )}

        {step === "weights" && (
          <OnboardingWeights
            selectedTags={selectedTags}
            weights={tagWeights}
            onSetWeight={setWeight}
          />
        )}

        {step === "level" && (
          <OnboardingLevel
            currentLevel={level}
            onSelect={setLevel}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8 max-w-lg mx-auto w-full">
        {step !== "tags" && (
          <Button variant="outline" onClick={prevStep} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            이전
          </Button>
        )}
        <Button
          className="flex-1 gap-2"
          onClick={nextStep}
          disabled={!canProceed()}
        >
          {step === "level" || (fromSettings && step === "weights")
            ? "완료"
            : "다음"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </main>
  );
}
