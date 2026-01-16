import {
  Heart,
  Bookmark,
  Check,
  HelpCircle,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Paper, summaries } from "@/data/papers";
import { useStore } from "@/store/useStore";
import { TagChip } from "./TagChip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { WhyThisModal } from "./WhyThisModal";
import { LoginModal } from "./LoginModal";
import { cn } from "@/lib/utils";
import { UI_CONSTANTS } from "@/core/config/constants";

interface PaperCardProps {
  paper: Paper;
  onOpenSummary?: () => void;
}

export function PaperCard({ paper, onOpenSummary }: PaperCardProps) {
  const { user, getAction, toggleLike, toggleSave, markAsRead } = useStore();
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAbstract, setShowAbstract] = useState(false);
  const [showAllAuthors, setShowAllAuthors] = useState(false);

  const action = getAction(paper.id);
  const summary = summaries.find((s) => s.paperId === paper.id);
  const isLiked = action?.liked || false;
  const isSaved = action?.saved || false;
  const isRead = !!action?.readAt;
  const canUseActions = Boolean(user);
  const authMessage = !user ? "로그인 후 좋아요/저장/읽음 기능을 사용할 수 있어요." : null;

  // 추상 미리보기 (2-3줄)
  const abstractPreview =
    paper.abstract.length > UI_CONSTANTS.PAPER.ABSTRACT_PREVIEW_LENGTH
      ? paper.abstract.substring(0, UI_CONSTANTS.PAPER.ABSTRACT_PREVIEW_LENGTH) + "..."
      : paper.abstract;

  // 저자 표시 로직
  const shouldCollapseAuthors = paper.authors.length > UI_CONSTANTS.PAPER.MAX_DISPLAYED_AUTHORS;
  const displayedAuthors =
    shouldCollapseAuthors && !showAllAuthors
      ? paper.authors.slice(0, UI_CONSTANTS.PAPER.MAX_DISPLAYED_AUTHORS)
      : paper.authors;

  const handleActionClick = (action: () => void) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    action();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // 버튼이나 링크 클릭 시에는 카드 클릭 이벤트 무시
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("a") ||
      (e.target as HTMLElement).closest('[role="button"]')
    ) {
      return;
    }
    if (onOpenSummary) {
      onOpenSummary();
    }
  };

  return (
    <>
      <article
        className={cn(
          "bg-card rounded-lg border shadow-card p-4 space-y-3 transition-all cursor-pointer",
          isRead && "opacity-75"
        )}
        onClick={handleCardClick}
      >
        {/* Image */}
        {paper.imageUrl && (
          <div className="w-full h-48 rounded-lg overflow-hidden mb-3 bg-muted flex items-center justify-center">
            <img
              src={paper.imageUrl}
              alt={`${paper.title} figure`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // 이미지 로드 실패 시 아이콘 표시
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                if (target.parentElement) {
                  target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-muted-foreground">
                      <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          </div>
        )}

        {/* Header: Tags & Why */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {paper.tags.slice(0, UI_CONSTANTS.PAPER.MAX_DISPLAYED_TAGS).map((tag) => (
              <TagChip key={tag} tag={tag} size="sm" />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs gap-1 h-7"
            onClick={(e) => {
              e.stopPropagation();
              setShowWhyModal(true);
            }}
          >
            <HelpCircle className="w-3.5 h-3.5" />왜 추천?
          </Button>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-lg leading-snug text-foreground hover:text-primary transition-colors">
          {paper.title}
        </h3>

        {/* Hook summary */}
        {summary && (
          <p className="text-sm text-muted-foreground leading-relaxed">💡 {summary.hookOneLiner}</p>
        )}

        {/* Abstract Preview */}
        <Collapsible open={showAbstract} onOpenChange={setShowAbstract}>
          <div className="space-y-1">
            <p
              className={cn(
                "text-xs text-muted-foreground leading-relaxed",
                !showAbstract && "line-clamp-2"
              )}
            >
              {showAbstract ? paper.abstract : abstractPreview}
            </p>
            {paper.abstract.length > UI_CONSTANTS.PAPER.ABSTRACT_PREVIEW_LENGTH && (
              <CollapsibleTrigger asChild>
                <button className="text-xs text-primary hover:underline flex items-center gap-1">
                  {showAbstract ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      접기
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3" />
                      더보기
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
            )}
          </div>
        </Collapsible>

        {/* Authors */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {displayedAuthors.map((author, idx) => (
                  <span key={idx} className="text-muted-foreground">
                    {author}
                    {idx < displayedAuthors.length - 1 && ","}
                  </span>
                ))}
                {shouldCollapseAuthors && !showAllAuthors && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllAuthors(true);
                    }}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    외 {paper.authors.length - UI_CONSTANTS.PAPER.MAX_DISPLAYED_AUTHORS}명
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
                {shouldCollapseAuthors && showAllAuthors && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllAuthors(false);
                    }}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    접기
                    <ChevronUp className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{paper.year}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <Badge variant="outline" className="text-xs py-0 px-2 h-5">
              {paper.venue}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>인용 {paper.metrics.citations.toLocaleString()}</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="secondary" className="text-xs py-0 px-2 h-5">
              트렌딩 {paper.metrics.trendingScore}
            </Badge>
            <Badge variant="secondary" className="text-xs py-0 px-2 h-5">
              최신도 {paper.metrics.recencyScore}
            </Badge>
          </div>
        </div>

        {/* Actions - Mobile Optimized */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
          {/* Primary Actions (좋아요/저장/읽음) */}
          <div className="flex items-center gap-1 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 min-h-touch", isLiked && "text-liked")}
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(() => toggleLike(paper.id));
              }}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              <span className="text-xs hidden sm:inline">좋아요</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 min-h-touch", isSaved && "text-saved")}
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(() => toggleSave(paper.id));
              }}
            >
              <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
              <span className="text-xs hidden sm:inline">저장</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 min-h-touch", isRead && "text-accent")}
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(() => markAsRead(paper.id));
              }}
            >
              <Check className={cn("w-4 h-4", isRead && "stroke-[3]")} />
              <span className="text-xs hidden sm:inline">읽음</span>
            </Button>
          </div>

          {/* Secondary Actions (PDF/요약) */}
          <div className="flex items-center gap-2">
            {paper.pdfUrl && (
              <Button variant="outline" size="sm" className="text-xs min-h-touch" asChild>
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="PDF 원문 보기 (새 탭에서 열림)"
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  PDF
                </a>
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              className="text-xs min-h-touch"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenSummary) onOpenSummary();
              }}
            >
              요약 보기
            </Button>
          </div>
        </div>
        {!canUseActions && authMessage && (
          <p className="text-xs text-muted-foreground">{authMessage}</p>
        )}
      </article>

      <WhyThisModal paper={paper} open={showWhyModal} onOpenChange={setShowWhyModal} />

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} showNotice={true} />
    </>
  );
}
