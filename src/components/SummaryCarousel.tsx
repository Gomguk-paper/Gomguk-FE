import { useEffect } from "react";
import { X } from "lucide-react";
import { Paper } from "@/models";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { cleanAbstract } from "@/lib/textUtils";
import { resolveImageUrl } from "@/lib/imageUtils";
import { useSummaryQuery } from "@/hooks/queries/useSummaryQuery";

// Import new components and hooks
import { SummaryMetadata } from "./summary-carousel/SummaryMetadata";
import { SummaryContent } from "./summary-carousel/SummaryContent";
import { SummaryNavigation } from "./summary-carousel/SummaryNavigation";
import { useSummaryNavigation } from "./summary-carousel/useSummaryNavigation";

interface SummaryCarouselProps {
  papers: Paper[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function SummaryCarousel({ papers, initialIndex = 0, open, onClose }: SummaryCarouselProps) {
  const { markAsRead, prefs } = useStore();

  // Custom hook for navigation logic
  const {
    currentPaperIndex,
    goNextStep,
    goNextPaper,
    goPrevPaper
  } = useSummaryNavigation(papers, initialIndex, open, onClose);

  const currentPaper = papers[currentPaperIndex];

  // Fetch summary from API
  const { data: apiSummary, isLoading } = useSummaryQuery(currentPaper?.id);

  const layoutMode = prefs?.layoutMode || "auto";
  const isMobileMode = layoutMode === "mobile";
  const isDesktopMode = layoutMode === "desktop";

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

  if (!open) return null;

  const paper = papers[currentPaperIndex];

  // Generate English summary from abstract (Fallback)
  const { cleaned, sentences } = cleanAbstract(paper.abstract || "");
  const fallbackSummary = {
    paperId: paper.id,
    hookOneLiner: sentences.length > 0 ? sentences[0] : "No summary available.",
    keyPoints: sentences.length > 1 ? sentences.slice(1, 4) : ["Please refer to the original text for details."],
    detailed: cleaned || "No summary available.",
    evidenceScope: "abstract" as const
  };

  // Use API summary if available, otherwise use fallback
  const summary = apiSummary ? {
    paperId: paper.id,
    hookOneLiner: apiSummary.hook,
    keyPoints: apiSummary.points,
    detailed: apiSummary.detailed,
    evidenceScope: "full" as const // Assuming API returns full summary
  } : fallbackSummary;


  return (
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in"
      style={{ pointerEvents: "auto" }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <div className="absolute top-4 right-4 z-[60] flex items-center gap-2">
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
      <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
        <div
          className="min-h-full flex flex-col justify-center px-6 pt-24 pb-36 max-w-lg mx-auto"
          onClick={goNextStep}
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

          {/* Image Section */}
          {paper.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden border bg-muted">
              <img
                src={resolveImageUrl(paper.imageUrl)}
                alt={paper.title}
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </div>
          )}

          {/* New Sub-components */}
          <SummaryMetadata paper={paper} />

          <SummaryContent summary={summary} pdfUrl={paper.pdfUrl} isLoading={isLoading} />

          {/* Navigation hint */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            화살표를 클릭하여 다음 논문으로 이동
          </p>
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
