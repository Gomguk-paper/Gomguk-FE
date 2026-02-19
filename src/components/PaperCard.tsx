import type { Paper } from "@/models";
import { useStore } from "@/store/useStore";
import { MobileCard } from "./paper-card/MobileCard";
import { DesktopCard } from "./paper-card/DesktopCard";
import { useEffect, useState } from "react";

interface PaperCardProps {
  paper: Paper;
  onOpenSummary?: () => void;
}

export function PaperCard({ paper, onOpenSummary }: PaperCardProps) {
  const { prefs } = useStore();
  const [isMobileWidth, setIsMobileWidth] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hideToastPhase, setHideToastPhase] = useState<"show" | "fade" | "gone">("show");
  const hideToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: summaryFromApi } = useSummaryQuery(paper.id);
  const { isTrendingTag } = useTrendingTags();
  const action = getAction(paper.id);
  const isLiked = action?.liked || false;
  const isSaved = action?.saved || false;
  /** 맨 위 텍스트: BE hook 연동 (API → paper.summary) */
  const hookText = summaryFromApi?.hook ?? paper.summary?.hook ?? "";
  const canUseActions = Boolean(user);
  const authMessage = !user ? "로그인 후 좋아요/저장 기능을 사용할 수 있어요." : null;

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

  const isHidden = hiddenPapers[paper.id];
  const isExcludedTag = paper.tags.some(tag => excludedTags[tag]);

  // 숨기기 토스트: 2.5초 표시 후 페이드아웃 → 사라짐
  useEffect(() => {
    const checkWidth = () => {
      setIsMobileWidth(window.innerWidth < 768); // Tailwind 'md' breakpoint
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Determine which card to render
  // 1. If user forces mobile layout -> MobileCard
  // 2. If screen is small (< md) -> MobileCard
  // 3. Otherwise -> DesktopCard
  const showMobileCard = prefs?.layoutMode === 'mobile' || isMobileWidth;

  if (showMobileCard) {
    return <MobileCard paper={paper} onOpenSummary={onOpenSummary} />;
  }

  return (
    <>
      <article
        className={cn(
          "bg-card rounded-lg border shadow-card transition-all cursor-pointer overflow-hidden",
          // Responsive layout: flex-col on mobile, flex-row on desktop
          "flex flex-col md:flex-row md:gap-5 md:p-4"
        )}
        onClick={handleCardClick}
      >
        {/* Image Section */}
        {paper.imageUrl && (
          <div className="w-full md:w-[28%] flex-shrink-0">
            <div className="bg-muted relative aspect-[3/2] md:aspect-[4/3] w-full md:rounded-lg overflow-hidden">
              <img
                src={resolveImageUrl(paper.imageUrl)}
                alt={`${paper.title || "논문"} figure`}
                className="w-full h-full object-cover absolute inset-0"
              />
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-4 md:p-0">

          {/* Header: 맨 위 = BE hook / Actions & Why */}
          <div className="flex justify-between items-start gap-2 mb-1">
            <div className="flex-1">
              <h3 className="font-display font-semibold text-lg leading-snug text-foreground hover:text-primary transition-colors mb-1 min-h-[1.5rem] prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                  {hookText || paper.title || "논문제목이 없습니다"}
                </ReactMarkdown>
              </h3>
              <div className="text-xs text-muted-foreground mb-2">
                {paper.authors.slice(0, 3).join(", ")}{paper.authors.length > 3 && " et al."}
                <span className="mx-1.5">·</span>
                {paper.year}
              </div>
            </div>

            <div className="flex items-center gap-1 -mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end" className="text-xs max-w-[220px]">
                  <p>{recommendationReason}</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    hidePaper(paper.id);
                  }}>
                    <EyeOff className="w-4 h-4 mr-2" />
                    이 논문 숨기기
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Hash className="w-4 h-4 mr-2" />
                      태그 차단
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {paper.tags.map(tag => (
                        <DropdownMenuItem key={tag} onClick={(e) => {
                          e.stopPropagation();
                          excludeTag(tag);
                        }}>
                          {tag}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {paper.tags.slice(0, UI_CONSTANTS.PAPER.MAX_DISPLAYED_TAGS).map((tag) => (
              <TagChip
                key={tag}
                tag={tag}
                size="sm"
                interest={prefs?.tags?.some((pt) => pt.name.toLowerCase() === tag.toLowerCase())}
                trending={isTrendingTag(tag)}
              />
            ))}
          </div>

          {/* 태그 아래: 논문 실제 제목 (좋아요/북마크 위), 없으면 "논문제목이 없습니다" */}
          <div className="flex gap-3 mb-auto items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none line-clamp-2 [&_p]:m-0">
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
              >
                {paper.title || "논문제목이 없습니다"}
              </ReactMarkdown>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t md:border-t-0 md:pt-0 mt-auto">
            {/* Primary Actions (좋아요/저장/읽음) */}
            {/* Primary Actions (좋아요/저장/읽음) */}
            <div className="flex items-center gap-1 flex-1 justify-end -mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 text-muted-foreground hover:text-liked hover:bg-red-50", isLiked && "text-liked hover:text-liked bg-red-50")}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(() => toggleLike(paper.id));
                    }}
                  >
                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>좋아요</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 text-muted-foreground hover:text-saved hover:bg-blue-50", isSaved && "text-saved hover:text-saved bg-blue-50")}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(() => toggleSave(paper.id));
                    }}
                  >
                    <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>저장</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Secondary Actions (Link) - Removed */}
            <div className="flex items-center gap-2">
            </div>
          </div>
          {!canUseActions && authMessage && (
            <p className="text-xs text-muted-foreground mt-2">{authMessage}</p>
          )}
        </div>
      </article>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} showNotice={true} />
    </>
  );
}
