import { useEffect, useRef, useState } from "react";
import { X, MessageSquareText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Paper } from "@/models";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { cleanAbstract } from "@/lib/textUtils";
import { resolveImageUrl } from "@/lib/imageUtils";
import { useSummaryQuery } from "@/hooks/queries/useSummaryQuery";
import { useTrendingTags } from "@/contexts/TrendingTagsContext";

// Import new components and hooks
import { SummaryMetadata } from "./summary-carousel/SummaryMetadata";
import { SummaryContent } from "./summary-carousel/SummaryContent";
import { SummaryNavigation } from "./summary-carousel/SummaryNavigation";
import { useSummaryNavigation } from "./summary-carousel/useSummaryNavigation";
import { PaperChatbot } from "./summary-carousel/PaperChatbot";

interface SummaryCarouselProps {
  papers: Paper[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function SummaryCarousel({ papers, initialIndex = 0, open, onClose }: SummaryCarouselProps) {
  const { markAsRead, prefs } = useStore();
  const { isTrendingTag } = useTrendingTags();

  // Custom hook for navigation logic
  const {
    currentPaperIndex,
    goNextStep,
    goNextPaper,
    goPrevPaper
  } = useSummaryNavigation(papers, initialIndex, open, onClose);

  // Chatbot toggle state
  const [isChatOpen, setIsChatOpen] = useState(false);

  const currentPaper = papers[currentPaperIndex];

  // Fetch summary from API
  const { data: apiSummary, isLoading } = useSummaryQuery(currentPaper?.id);

  const layoutMode = prefs?.layoutMode || "auto";
  const isMobileMode = layoutMode === "mobile";
  const isDesktopMode = layoutMode === "desktop";

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Mark as read when paper changes
  useEffect(() => {
    if (open && papers[currentPaperIndex]) {
      markAsRead(papers[currentPaperIndex].id);
    }
  }, [open, currentPaperIndex, papers, markAsRead]);

  // Reset scroll position and chat state when paper changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    // setIsChatOpen(false); // 선택사항: 논문 넘길때 챗봇 닫기 (유지하려면 주석 처리)
  }, [currentPaperIndex]);

  if (!open) return null;

  const paper = papers[currentPaperIndex];

  // API 실패 시: paper.summary(목록 API 임베딩) 우선, 없으면 abstract 기반 fallback
  const { cleaned, sentences } = cleanAbstract(paper.abstract || "");
  const fallbackSummary = {
    paperId: paper.id,
    hookOneLiner: paper.summary?.hook || sentences[0] || "요약을 불러올 수 없습니다.",
    keyPoints: Array.isArray(paper.summary?.points) && paper.summary.points.length > 0
      ? paper.summary.points
      : sentences.length > 1
        ? sentences.slice(1, 4)
        : [],
    detailed: paper.summary?.detailed || cleaned || "요약을 불러올 수 없습니다.",
    evidenceScope: "abstract" as const,
  };

  // BE points를 항상 string[]로 정규화 (빈 배열/다른 형식/snake_case 대비)
  const normalizePoints = (raw: unknown): string[] => {
    if (Array.isArray(raw)) return raw.filter((p): p is string => typeof p === "string");
    if (typeof raw === "string" && raw.trim()) return [raw];
    return [];
  };

  const summary = apiSummary
    ? {
      paperId: paper.id,
      hookOneLiner: apiSummary.hook ?? "",
      keyPoints: normalizePoints(
        apiSummary.points ??
        (apiSummary as unknown as Record<string, unknown>).key_points ??
        (apiSummary as unknown as Record<string, unknown>).keyPoints
      ),
      detailed: apiSummary.detailed ?? "",
      evidenceScope: "full" as const,
    }
    : fallbackSummary;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in"
      style={{ pointerEvents: "auto" }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Top right controls */}
      <div className="absolute top-4 right-4 z-[60] flex items-center gap-2">
        {/* Chat Toggle Button */}
        <Button
          variant={isChatOpen ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsChatOpen(!isChatOpen);
          }}
          className={`h-9 px-3 rounded-full border-2 transition-colors ${!isChatOpen ? 'hover:bg-primary/10 hover:text-primary hover:border-primary' : ''} shadow-sm`}
        >
          <MessageSquareText className="w-4 h-4 mr-1.5" />
          <span className="text-sm font-medium">{isChatOpen ? '챗봇 닫기' : 'AI 챗봇'}</span>
        </Button>

        {/* Close button */}
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          className="h-9 w-9 rounded-full border-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors bg-background"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto scrollbar-hide"
      >
        <div
          className={`min-h-full flex px-6 pt-24 pb-36 mx-auto transition-all duration-300 ${
            isChatOpen && !isMobileMode ? 'max-w-6xl flex-row gap-8 items-start' : 'max-w-lg flex-col justify-center'
          }`}
          onClick={goNextStep}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Left Side (Paper Summary) */}
          <div className={`flex flex-col w-full transition-all duration-300 ${isChatOpen && !isMobileMode ? 'w-1/2' : ''}`}>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {paper.tags.slice(0, 3).map((tag) => (
                <TagChip
                  key={tag}
                  tag={tag}
                  size="sm"
                  interest={prefs?.tags?.some((pt) => pt.name.toLowerCase() === tag.toLowerCase())}
                  trending={isTrendingTag(tag)}
                />
              ))}
            </div>

            {/* Title - 마크다운/LaTeX 수식 지원 */}
            <div className="font-display text-xl font-semibold mb-4 text-foreground [&_.katex]:text-inherit [&_.katex]:text-base">
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => <span className="block">{children}</span>,
                }}
              >
                {paper.title || "논문제목이 없습니다"}
              </ReactMarkdown>
            </div>

            {/* Image Section */}
            {paper.imageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden border bg-muted">
                <img
                  src={resolveImageUrl(paper.imageUrl)}
                  alt={paper.title || "논문 figure"}
                  className="w-full h-auto object-cover max-h-[400px]"
                />
              </div>
            )}

            {/* New Sub-components */}
            <SummaryMetadata paper={paper} />

            <SummaryContent paper={paper} summary={summary} pdfUrl={paper.pdfUrl} isLoading={isLoading} />

            {/* Navigation hint */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              화살표를 클릭하여 다음 논문으로 이동
            </p>
          </div>

          {/* Right Side (Chatbot) */}
          {isChatOpen && (
            <div 
              className={`flex flex-col w-full ${isMobileMode ? 'mt-12 h-[600px]' : 'w-1/2 h-[calc(100vh-12rem)] sticky top-24'}`}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <PaperChatbot />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <SummaryNavigation
        currentPaperIndex={currentPaperIndex}
        papers={papers}
        isMobileMode={isMobileMode}
        isDesktopMode={isDesktopMode}
        onPrev={goPrevPaper}
        onNext={goNextPaper}
      />
    </div>
  );
}
