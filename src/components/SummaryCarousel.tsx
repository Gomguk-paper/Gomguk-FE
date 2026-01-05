import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, FileText } from "lucide-react";
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

  const goNext = useCallback(() => {
    setCurrentStep((step) => {
      if (step === "hook") {
        return "keypoints";
      } else if (step === "keypoints") {
        return "detailed";
      } else {
        // detailed 단계에서 다음 논문으로 이동
        setCurrentPaperIndex((idx) => {
          if (idx < papers.length - 1) {
            return idx + 1;
          } else {
            onClose();
            return idx;
          }
        });
        return "hook";
      }
    });
  }, [papers.length, onClose]);

  const goPrev = useCallback(() => {
    setCurrentStep((step) => {
      if (step === "detailed") {
        return "keypoints";
      } else if (step === "keypoints") {
        return "hook";
      } else {
        // hook 단계에서 이전 논문으로 이동
        setCurrentPaperIndex((idx) => {
          if (idx > 0) {
            return idx - 1;
          }
          return idx;
        });
        return "detailed";
      }
    });
  }, []);

  const goToStep = useCallback((targetStep: SummaryStep) => {
    setCurrentStep(targetStep);
  }, []);

  const goToPaper = useCallback((targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < papers.length) {
      setCurrentPaperIndex(targetIndex);
      setCurrentStep("hook"); // 논문 변경 시 첫 단계로 리셋
    }
  }, [papers.length]);

  // 키보드 이벤트 리스너 추가
  useEffect(() => {
    if (!open) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC 키는 모달 닫기
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // 나머지 모든 키는 다음으로 이동
      goNext();
    };

    window.addEventListener("keydown", handleKeyPress);
    
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [open, goNext, onClose]);

  if (!open) return null;

  const paper = papers[currentPaperIndex];
  const summary = summaries.find(s => s.paperId === paper.id);

  if (!summary) return null;

  const steps: SummaryStep[] = ["hook", "keypoints", "detailed"];
  const stepIndex = steps.indexOf(currentStep);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {papers.map((paper, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                goToPaper(i);
              }}
              className={cn(
                "h-1 rounded-full transition-all cursor-pointer hover:h-1.5",
                i === currentPaperIndex ? "w-8 bg-primary" : "w-4 bg-muted"
              )}
              aria-label={`${i + 1}번째 논문으로 이동: ${paper.title}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {paper.pdfUrl && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PDF 원문 보기 (새 탭에서 열림)"
              >
                <FileText className="w-5 h-5" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
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
            <button
              key={step}
              onClick={(e) => {
                e.stopPropagation(); // 부모의 onClick(goNext) 방지
                goToStep(step);
              }}
              className={cn(
                "h-1 flex-1 rounded-full transition-all cursor-pointer hover:h-1.5",
                i <= stepIndex ? "bg-primary" : "bg-muted"
              )}
              aria-label={`${step === "hook" ? "한줄 요약" : step === "keypoints" ? "핵심 포인트" : "상세 설명"} 단계로 이동`}
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
          진행 상태 바를 클릭하거나 탭하여 단계 이동
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
