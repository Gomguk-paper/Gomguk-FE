import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, FileText, Users, Calendar, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

// Helper to clean abstract text
const cleanAbstract = (text: string) => {
  if (!text) return { cleaned: "", sentences: [] };

  // Remove LaTeX preamble like $\renewcommand...$
  let cleaned = text.replace(/\$\\renewcommand\{[^}]+\}\{[^}]+\}\$/g, "");

  // Remove common LaTeX commands and delimiters
  cleaned = cleaned.replace(/\\mathbb\{R\}/g, "R");
  cleaned = cleaned.replace(/\\Re/g, "R");
  cleaned = cleaned.replace(/\\varepsilon/g, "ε");
  cleaned = cleaned.replace(/\$/g, ""); // Strip dollar signs

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Split into sentences (simple approximation)
  // Match sentences ending with ., ?, ! followed by space or end of string
  const sentences = cleaned.match(/[^.?!]+[.?!]+(?=\s|$)|[^.?!]+$/g) || [cleaned];

  return {
    cleaned,
    sentences: sentences.map(s => s.trim()).filter(s => s.length > 0)
  };
};

export function SummaryCarousel({ papers, initialIndex = 0, open, onClose }: SummaryCarouselProps) {
  const [currentPaperIndex, setCurrentPaperIndex] = useState(initialIndex);
  const [currentStep, setCurrentStep] = useState<SummaryStep>("hook");
  const { markAsRead } = useStore();
  const navigate = useNavigate();

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
        // detailed 단계에서는 다음 논문으로 이동하지 않고 그대로 유지
        return "detailed";
      }
    });
  }, []);

  const goNextPaper = useCallback(() => {
    if (currentPaperIndex < papers.length - 1) {
      setCurrentPaperIndex(currentPaperIndex + 1);
      setCurrentStep("hook");
    }
  }, [currentPaperIndex, papers.length]);

  const goPrevPaper = useCallback(() => {
    if (currentPaperIndex > 0) {
      setCurrentPaperIndex(currentPaperIndex - 1);
      setCurrentStep("hook");
    }
  }, [currentPaperIndex]);

  const goToStep = useCallback((targetStep: SummaryStep) => {
    setCurrentStep(targetStep);
  }, []);

  const goToPaper = useCallback(
    (targetIndex: number) => {
      if (targetIndex >= 0 && targetIndex < papers.length) {
        setCurrentPaperIndex(targetIndex);
        setCurrentStep("hook");
      }
    },
    [papers.length]
  );

  // 키보드 이벤트 리스너 추가
  useEffect(() => {
    if (!open) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        goNextPaper();
        return;
      }
      if (e.key === "ArrowLeft") {
        goPrevPaper();
        return;
      }
      if (e.key !== "Escape" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") {
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [open, goNext, goNextPaper, goPrevPaper, onClose]);

  if (!open) return null;

  const paper = papers[currentPaperIndex];
  let summary = summaries.find((s) => s.paperId === paper.id);

  // Fallback for papers without manual summary
  if (!summary) {
    const { cleaned, sentences } = cleanAbstract(paper.abstract || "");
    summary = {
      paperId: paper.id,
      hookOneLiner: sentences.length > 0 ? sentences[0] : "요약 정보가 없습니다.",
      keyPoints: sentences.length > 0 ? [
        "자동 생성된 요약입니다.",
        sentences[1] || "원문을 참고해주세요.",
        sentences[2] || (sentences[1] ? "전체 내용은 원문을 참고해주세요." : "")
      ].filter(Boolean) : ["요약 정보가 없습니다."],
      detailed: cleaned || "요약 정보가 없습니다.",
      evidenceScope: "abstract"
    };
  }

  const steps: SummaryStep[] = ["hook", "keypoints", "detailed"];
  const stepIndex = steps.indexOf(currentStep);

  return (
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in"
      style={{ pointerEvents: "auto" }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
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
            <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
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
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {paper.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} tag={tag} size="sm" />
          ))}
        </div>

        {/* Title */}
        <h2 className="font-display text-xl font-semibold mb-4 text-foreground">{paper.title}</h2>

        {/* Paper Metadata */}
        <div className="space-y-3 mb-6 p-4 bg-secondary/30 rounded-lg border">
          {/* Authors */}
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0 flex flex-wrap gap-2">
              {paper.authors.map((authorName, idx) => (
                <span key={idx} className="text-sm px-2 py-0.5 text-foreground cursor-default">
                  {authorName}
                </span>
              ))}
            </div>
          </div>

          {/* Publication Info */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{paper.year}</span>
            </div>
            {paper.venue && (
              <div className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                {paper.venue}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                인용 {paper.metrics.citations.toLocaleString()}회
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium flex items-center gap-1">
              <Award className="w-3 h-3" />
              트렌딩 {paper.metrics.trendingScore.toFixed(1)}
            </div>
            <div className="px-2 py-1 bg-secondary text-muted-foreground text-xs rounded-full font-medium">
              최신도 {paper.metrics.recencyScore.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Summary content - all sections visible at once */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* 한줄 요약 */}
          <div className="animate-fade-in">
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              한줄 요약
            </span>
            <p className="text-2xl font-display font-medium mt-3 leading-relaxed">
              💡 {summary.hookOneLiner}
            </p>
          </div>

          {/* 핵심 포인트 */}
          <div className="animate-fade-in">
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              핵심 포인트
            </span>
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

          {/* 상세 설명 */}
          <div className="animate-fade-in">
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              상세 설명
            </span>
            <p className="mt-4 text-base leading-relaxed text-foreground/90">
              {summary.detailed}
            </p>
            <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
              <span className="text-xs text-muted-foreground">
                📚 요약 근거:{" "}
                {summary.evidenceScope === "full"
                  ? "전체 논문"
                  : summary.evidenceScope === "intro"
                    ? "서론 기반"
                    : "초록 기반"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation hint */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          화면을 클릭하거나 탭하여 다음 단계로 이동
        </p>
      </div>

      {/* Side navigation buttons - 논문 이동 (크게) */}
      <button
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 z-20",
          "p-4 rounded-full bg-background/90 backdrop-blur-sm border shadow-lg",
          "hover:bg-background hover:scale-110 transition-all min-h-touch min-w-touch",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
          "flex items-center justify-center",
          currentPaperIndex === 0 && "opacity-50"
        )}
        onClick={(e) => {
          e.stopPropagation();
          goPrevPaper();
        }}
        disabled={currentPaperIndex === 0}
        aria-label="이전 논문"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <ChevronLeft className="w-8 h-8 text-foreground" />
      </button>
      <button
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 z-20",
          "p-4 rounded-full bg-background/90 backdrop-blur-sm border shadow-lg",
          "hover:bg-background hover:scale-110 transition-all min-h-touch min-w-touch",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
          "flex items-center justify-center",
          currentPaperIndex === papers.length - 1 && "opacity-50"
        )}
        onClick={(e) => {
          e.stopPropagation();
          goNextPaper();
        }}
        disabled={currentPaperIndex === papers.length - 1}
        aria-label="다음 논문"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <ChevronRight className="w-8 h-8 text-foreground" />
      </button>

      {/* Bottom navigation - 논문 이동 */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-8">
        <div className="max-w-lg mx-auto px-6">
          <div className="bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between gap-4">
              {/* 이전 논문 */}
              <button
                className={cn(
                  "flex-1 flex items-center gap-2 px-4 py-3 rounded-lg",
                  "bg-secondary/50 hover:bg-secondary transition-colors",
                  "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-secondary/50",
                  "group"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  goPrevPaper();
                }}
                disabled={currentPaperIndex === 0}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <div className="flex-1 text-left min-w-0">
                  <div className="text-xs text-muted-foreground">이전 포스트</div>
                  {currentPaperIndex > 0 && (
                    <div className="text-sm font-medium truncate mt-0.5">
                      {papers[currentPaperIndex - 1].title}
                    </div>
                  )}
                </div>
              </button>

              {/* 다음 논문 */}
              <button
                className={cn(
                  "flex-1 flex items-center gap-2 px-4 py-3 rounded-lg",
                  "bg-secondary/50 hover:bg-secondary transition-colors",
                  "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-secondary/50",
                  "group"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  goNextPaper();
                }}
                disabled={currentPaperIndex === papers.length - 1}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <div className="flex-1 text-right min-w-0">
                  <div className="text-xs text-muted-foreground">다음 포스트</div>
                  {currentPaperIndex < papers.length - 1 && (
                    <div className="text-sm font-medium truncate mt-0.5">
                      {papers[currentPaperIndex + 1].title}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
