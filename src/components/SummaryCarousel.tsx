import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, FileText, Users, Calendar, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Paper, summaries } from "@/data/papers";
import { TagChip } from "./TagChip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

interface SummaryCarouselProps {
  papers: Paper[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

type SummaryStep = "hook" | "keypoints" | "detailed";

// Helper to clean abstract text - preserves $...$ math delimiters for KaTeX rendering
const cleanAbstract = (text: string) => {
  if (!text) return { cleaned: "", sentences: [] };

  let cleaned = text;

  // 1) Remove $\renewcommand...$  or $\newcommand...$ preambles
  //    Match from $\ (re)newcommand all the way to the closing $
  //    This handles nested braces like $\renewcommand{\Re}{\mathbb{R}}$
  cleaned = cleaned.replace(/\$\\(?:re)?newcommand[^$]*\$/g, "");

  // 2) Also handle \renewcommand / \newcommand without $ wrapping (nested braces)
  cleaned = cleaned.replace(/\\(?:re)?newcommand\s*\{(?:[^{}]|\{[^{}]*\})*\}\s*(?:\[[^\]]*\])?\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, "");

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Split into sentences while respecting $...$ math blocks
  // Temporarily replace math blocks to avoid splitting inside them
  const mathBlocks: string[] = [];
  const withPlaceholders = cleaned.replace(/\$\$[\s\S]*?\$\$|\$[^$]+?\$/g, (match) => {
    mathBlocks.push(match);
    return `__MATH_${mathBlocks.length - 1}__`;
  });

  const rawSentences = withPlaceholders.match(/[^.?!]+[.?!]+(?=\s|$)|[^.?!]+$/g) || [withPlaceholders];

  // Restore math blocks in sentences
  const sentences = rawSentences.map(s => {
    let restored = s.trim();
    restored = restored.replace(/__MATH_(\d+)__/g, (_, idx) => mathBlocks[parseInt(idx)]);
    return restored;
  }).filter(s => s.length > 0);

  // Restore math blocks in cleaned text
  let restoredCleaned = withPlaceholders;
  restoredCleaned = restoredCleaned.replace(/__MATH_(\d+)__/g, (_, idx) => mathBlocks[parseInt(idx)]);

  return {
    cleaned: restoredCleaned,
    sentences
  };
};

export function SummaryCarousel({ papers, initialIndex = 0, open, onClose }: SummaryCarouselProps) {
  const [currentPaperIndex, setCurrentPaperIndex] = useState(initialIndex);
  const [currentStep, setCurrentStep] = useState<SummaryStep>("hook");
  const [isAuthorsExpanded, setIsAuthorsExpanded] = useState(false);
  const { markAsRead, prefs } = useStore();
  const navigate = useNavigate();
  const layoutMode = prefs?.layoutMode || "auto";
  const isMobileMode = layoutMode === "mobile";
  const isDesktopMode = layoutMode === "desktop";

  useEffect(() => {
    if (open) {
      setCurrentPaperIndex(initialIndex);
      setCurrentStep("hook");
      setIsAuthorsExpanded(false);
      // 모달이 열릴 때 body 스크롤 막기
      document.body.style.overflow = 'hidden';
    } else {
      // 모달이 닫힐 때 body 스크롤 복원
      document.body.style.overflow = '';
    }
    
    // cleanup function
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, initialIndex]);

  useEffect(() => {
    setIsAuthorsExpanded(false);
  }, [currentPaperIndex]);

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
  const manualSummary = summaries.find((s) => s.paperId === paper.id);

  // Generate English summary from abstract (always available)
  const { cleaned, sentences } = cleanAbstract(paper.abstract || "");
  const englishSummary = {
    paperId: paper.id,
    hookOneLiner: sentences.length > 0 ? sentences[0] : "No summary available.",
    keyPoints: sentences.length > 1 ? sentences.slice(1, 4) : ["Please refer to the original text for details."],
    detailed: cleaned || "No summary available.",
    evidenceScope: "abstract" as const
  };

  // Decide which summary to use
  // If manual Korean summary exists, prefer it. Otherwise use English (abstract-based).
  const summary = manualSummary || englishSummary;

  // If user wants Korean but none exists, strictly they get English fallback.
  // We could add a visual indicator later.


  const steps: SummaryStep[] = ["hook", "keypoints", "detailed"];
  const stepIndex = steps.indexOf(currentStep);

  return (
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in"
      style={{ pointerEvents: "auto" }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Close button & controls - 최상위 z-index */}
      <div className="absolute top-4 right-4 z-[60] flex items-center gap-2">
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
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          className="h-9 w-9 rounded-full border-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div
        className="absolute inset-0 overflow-y-auto scrollbar-hide"
      >
        <div
          className="min-h-full flex flex-col justify-center px-6 pt-24 pb-36 max-w-lg mx-auto"
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
                {(isAuthorsExpanded ? paper.authors : paper.authors.slice(0, 5)).map((authorName, idx) => (
                  <span key={idx} className="text-sm px-2 py-0.5 text-foreground cursor-default">
                    {authorName}
                  </span>
                ))}
                {!isAuthorsExpanded && paper.authors.length > 5 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAuthorsExpanded(true);
                    }}
                    className="text-sm px-2 py-0.5 text-muted-foreground hover:text-primary font-medium transition-colors"
                  >
                    +{paper.authors.length - 5}명 더보기
                  </button>
                )}
                {isAuthorsExpanded && paper.authors.length > 5 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAuthorsExpanded(false);
                    }}
                    className="text-sm px-2 py-0.5 text-muted-foreground hover:text-primary font-medium transition-colors"
                  >
                    접기
                  </button>
                )}
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
          <div className="space-y-6">
            {/* 한줄 요약 */}
            <div className="animate-fade-in">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                한줄 요약
              </span>
              <div className="text-2xl font-display font-medium mt-3 leading-relaxed prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {`💡 ${summary.hookOneLiner}`}
                </ReactMarkdown>
              </div>
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
                    <div className="flex-1 prose prose-base max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {point}
                      </ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* 상세 설명 */}
            <div className="animate-fade-in">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                상세 설명
              </span>
              <div className="mt-4 text-base leading-relaxed text-foreground/90 prose prose-base max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {summary.detailed}
                </ReactMarkdown>
              </div>
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
      </div>

      {/* Side navigation buttons - 데스크탑 전용 (모바일 모드일 때 숨김) */}
      {!isMobileMode && (
        <>
          <button
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 z-20",
              "p-4 rounded-full bg-background/90 backdrop-blur-sm border shadow-lg",
              "hover:bg-background hover:scale-110 transition-all min-h-touch min-w-touch",
              "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
              "hidden md:flex items-center justify-center",
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
              "hidden md:flex items-center justify-center",
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
        </>
      )}

      {/* Bottom navigation - 모바일 전용 (모바일 모드이거나 화면이 작을 때) */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 z-20 pb-8 pointer-events-none",
        isMobileMode ? "block" : isDesktopMode ? "hidden" : "md:hidden"
      )}>
        <div className="max-w-md mx-auto px-4 pointer-events-auto">
          <div className="bg-background/95 backdrop-blur-sm border rounded-2xl shadow-lg p-2">
            <div className="flex items-center justify-between gap-2">
              {/* 이전 논문 */}
              <button
                className={cn(
                  "flex-1 flex items-center gap-3 px-3 py-2 rounded-xl",
                  "hover:bg-secondary/80 transition-colors",
                  "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                  "group min-w-0"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  goPrevPaper();
                }}
                disabled={currentPaperIndex === 0}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">PREV</div>
                  <div className="text-xs font-medium truncate mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    {currentPaperIndex > 0 ? papers[currentPaperIndex - 1].title : "이전 포스트"}
                  </div>
                </div>
              </button>

              <div className="w-px h-8 bg-border/50 shrink-0" />

              {/* 다음 논문 */}
              <button
                className={cn(
                  "flex-1 flex items-center justify-end gap-3 px-3 py-2 rounded-xl",
                  "hover:bg-secondary/80 transition-colors",
                  "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                  "group min-w-0"
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
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">NEXT</div>
                  <div className="text-xs font-medium truncate mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    {currentPaperIndex < papers.length - 1 ? papers[currentPaperIndex + 1].title : "다음 포스트"}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
