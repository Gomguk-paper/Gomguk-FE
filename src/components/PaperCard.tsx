import {
  Heart,
  Bookmark,
  Check,
  HelpCircle,
  FileText,
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

  const action = getAction(paper.id);
  const summary = summaries.find((s) => s.paperId === paper.id);
  const isLiked = action?.liked || false;
  const isSaved = action?.saved || false;
  const isRead = !!action?.readAt;
  const canUseActions = Boolean(user);
  const authMessage = !user ? "로그인 후 좋아요/저장/읽음 기능을 사용할 수 있어요." : null;

  const abstractPreview =
    paper.abstract.length > UI_CONSTANTS.PAPER.ABSTRACT_PREVIEW_LENGTH
      ? paper.abstract.substring(0, UI_CONSTANTS.PAPER.ABSTRACT_PREVIEW_LENGTH) + "..."
      : paper.abstract;

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
          "bg-card rounded-lg border shadow-card p-4 transition-all cursor-pointer",
          // Responsive layout: flex-col on mobile, flex-row on desktop
          "flex flex-col md:flex-row md:gap-5",
          isRead && "opacity-75"
        )}
        onClick={handleCardClick}
      >
        {/* Image Section */}
        {paper.imageUrl && (
          <div className="w-full md:w-[40%] flex-shrink-0 mb-3 md:mb-0">
            <div className="rounded-lg overflow-hidden bg-muted aspect-video md:aspect-[4/3] relative">
              <img
                src={paper.imageUrl}
                alt={`${paper.title} figure`}
                className="w-full h-full object-cover absolute inset-0"
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
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 flex flex-col gap-3 h-full">
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

          <div className="space-y-1">
            {/* Title */}
            <h3 className="font-display font-semibold text-lg leading-snug text-foreground hover:text-primary transition-colors">
              {paper.title}
            </h3>

            {/* Hook summary */}
            {summary && (
              <p className="text-sm text-muted-foreground leading-relaxed">💡 {summary.hookOneLiner}</p>
            )}
          </div>

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

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t md:border-t-0 md:pt-0 mt-auto">
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
            </div>
          </div>
          {!canUseActions && authMessage && (
            <p className="text-xs text-muted-foreground">{authMessage}</p>
          )}
        </div>
      </article>

      <WhyThisModal paper={paper} open={showWhyModal} onOpenChange={setShowWhyModal} />

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} showNotice={true} />
    </>
  );
}
