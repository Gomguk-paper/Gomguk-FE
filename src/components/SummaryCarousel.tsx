import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Paper, summaries } from "@/data/papers";
import { TagChip } from "./TagChip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

interface SummaryCarouselProps {
  papers: Paper[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

type SummaryStep = "hook" | "keypoints" | "detailed";

export function SummaryCarousel({ papers, initialIndex = 0, open, onClose }: SummaryCarouselProps) {
  const [currentPaperIndex, setCurrentPaperIndex] = useState(initialIndex);
  const [currentStep, setCurrentStep] = useState<SummaryStep>("hook");
  const { markAsRead } = useStore();

  useEffect(() => {
    if (open) {
      setCurrentPaperIndex(initialIndex);
      setCurrentStep("hook");
    }
  }, [open, initialIndex]);

  // 모달이 열리거나 논문이 변경될 때 자동으로 읽음 처리
  useEffect(() => {
    if (open && papers[currentPaperIndex]) {
      markAsRead(papers[currentPaperIndex].id);
    }
  }, [open, currentPaperIndex, papers, markAsRead]);

  if (!open) return null;

  const paper = papers[currentPaperIndex];
  const summary = summaries.find(s => s.paperId === paper.id);

  if (!summary) return null;

  const goNext = () => {
    if (currentStep === "hook") {
      setCurrentStep("keypoints");
    } else if (currentStep === "keypoints") {
      setCurrentStep("detailed");
    } else {
      // Move to next paper
      if (currentPaperIndex < papers.length - 1) {
        setCurrentPaperIndex(prev => prev + 1);
        setCurrentStep("hook");
      } else {
        onClose();
      }
    }
  };

  const goPrev = () => {
    if (currentStep === "detailed") {
      setCurrentStep("keypoints");
    } else if (currentStep === "keypoints") {
      setCurrentStep("hook");
    } else {
      // Move to previous paper
      if (currentPaperIndex > 0) {
        setCurrentPaperIndex(prev => prev - 1);
        setCurrentStep("detailed");
      }
    }
  };

  const steps: SummaryStep[] = ["hook", "keypoints", "detailed"];
  const stepIndex = steps.indexOf(currentStep);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {papers.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all",
                i === currentPaperIndex ? "w-8 bg-primary" : "w-4 bg-muted"
              )}
            />
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div 
        className="h-full flex flex-col justify-center px-6 pt-16 pb-24 max-w-lg mx-auto"
        onClick={goNext}
      >
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {paper.tags.slice(0, 3).map(tag => (
            <TagChip key={tag} tag={tag} size="sm" />
          ))}
        </div>

        {/* Title */}
        <h2 className="font-display text-xl font-semibold mb-6 text-foreground">
          {paper.title}
        </h2>

        {/* Step indicator */}
        <div className="flex gap-2 mb-4">
          {steps.map((step, i) => (
            <div
              key={step}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                i <= stepIndex ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Summary content based on step */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === "hook" && (
            <div className="animate-fade-in">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">한줄 요약</span>
              <p className="text-2xl font-display font-medium mt-3 leading-relaxed">
                💡 {summary.hookOneLiner}
              </p>
            </div>
          )}

          {currentStep === "keypoints" && (
            <div className="animate-fade-in">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">핵심 포인트</span>
              <ul className="mt-4 space-y-3">
                {summary.keyPoints.map((point, i) => (
                  <li 
                    key={i} 
                    className="flex gap-3 items-start text-lg"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <span className="text-primary font-bold">{i + 1}.</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentStep === "detailed" && (
            <div className="animate-fade-in">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">상세 설명</span>
              <p className="mt-4 text-base leading-relaxed text-foreground/90">
                {summary.detailed}
              </p>
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                <span className="text-xs text-muted-foreground">
                  📚 요약 근거: {summary.evidenceScope === "full" ? "전체 논문" : summary.evidenceScope === "intro" ? "서론 기반" : "초록 기반"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation hint */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          탭하여 다음으로
        </p>
      </div>

      {/* Side navigation buttons */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card shadow-lg opacity-50 hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        disabled={currentPaperIndex === 0 && currentStep === "hook"}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card shadow-lg opacity-50 hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); goNext(); }}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
