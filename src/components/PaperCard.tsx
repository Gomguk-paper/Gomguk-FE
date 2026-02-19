import {
  Heart,
  Bookmark,
  MoreVertical,
  EyeOff,
  Hash,
  Undo,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import type { Paper } from "@/models";
import { useStore } from "@/store/useStore";
import { useSummaryQuery } from "@/hooks/queries/useSummaryQuery";
import { useTrendingTags } from "@/contexts/TrendingTagsContext";
import { TagChip } from "./TagChip";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect, useRef } from "react";
import { LoginModal } from "./LoginModal";
import { cn } from "@/lib/utils";
import { UI_CONSTANTS } from "@/core/config/constants";
import { resolveImageUrl } from "@/lib/imageUtils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

interface PaperCardProps {
  paper: Paper;
  onOpenSummary?: () => void;
}

export function PaperCard({ paper, onOpenSummary }: PaperCardProps) {
  const {
    user,
    prefs,
    getAction,
    toggleLike,
    toggleSave,
    hidePaper,
    excludeTag,
    hiddenPapers,
    excludedTags,
    undoHidePaper
  } = useStore();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hideToastPhase, setHideToastPhase] = useState<"show" | "fade" | "gone">("show");
  const hideToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: summaryFromApi } = useSummaryQuery(paper.id);
  const { isTrendingTag } = useTrendingTags();
  const action = getAction(paper.id);
  const isLiked = action?.liked || false;
  const isSaved = action?.saved || false;
  const titleText = summaryFromApi?.hook ?? paper.summary?.hook ?? paper.title ?? "";
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
    if (!isHidden) {
      hideToastTimerRef.current && clearTimeout(hideToastTimerRef.current);
      hideToastTimerRef.current = null;
      return;
    }
    setHideToastPhase("show");
    hideToastTimerRef.current = setTimeout(() => {
      setHideToastPhase("fade");
      hideToastTimerRef.current = setTimeout(() => {
        setHideToastPhase("gone");
        hideToastTimerRef.current = null;
      }, 100);
    }, 1500);
    return () => {
      if (hideToastTimerRef.current) clearTimeout(hideToastTimerRef.current);
      hideToastTimerRef.current = null;
    };
  }, [isHidden]);

  // 추천 이유 계산 (tooltip용)
  const recommendationReason = useMemo(() => {
    if (prefs?.tags) {
      const matchedTags = paper.tags.filter(t =>
        prefs.tags.some(pt => pt.name.toLowerCase() === t.toLowerCase())
      );
      if (matchedTags.length > 0) {
        const highestWeight = prefs.tags
          .filter(pt => matchedTags.some(t => t.toLowerCase() === pt.name.toLowerCase()))
          .sort((a, b) => b.weight - a.weight)[0];
        if (highestWeight) {
          return `당신이 #${highestWeight.name}에 관심도 ${highestWeight.weight}를 설정했어요`;
        }
      }
    }
    if (paper.metrics.trendingScore >= 90) {
      return "이번 주 급상승 논문이에요";
    }
    if (paper.metrics.recencyScore >= 80) {
      return "최근에 발표된 따끈따끈한 연구예요";
    }
    return "해당 분야의 중요한 논문으로 선정되었어요";
  }, [paper, prefs]);

  if (isHidden) {
    if (hideToastPhase === "gone") return null;
    return (
      <div
        className={cn(
          "bg-muted/50 rounded-lg border p-4 flex items-center justify-between transition-opacity duration-300",
          hideToastPhase === "show" && "animate-in fade-in duration-300",
          hideToastPhase === "fade" && "animate-out fade-out duration-300 opacity-0"
        )}
      >
        <span className="text-sm text-muted-foreground">논문이 숨겨졌습니다.</span>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            undoHidePaper(paper.id);
          }}
          className="gap-1 h-8"
        >
          <Undo className="w-3 h-3" />
          실행 취소
        </Button>
      </div>
    );
  }

  if (isExcludedTag) {
    return null;
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
                alt={`${paper.title} figure`}
                className="w-full h-full object-cover absolute inset-0"
              />
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-4 md:p-0">

          {/* Header: Title & Actions & Why */}
          <div className="flex justify-between items-start gap-2 mb-1">
            <div className="flex-1">
              <h3 className="font-display font-semibold text-lg leading-snug text-foreground hover:text-primary transition-colors mb-1 min-h-[1.5rem]">
                {titleText}
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
              <TagChip key={tag} tag={tag} size="sm" trending={isTrendingTag(tag)} />
            ))}
          </div>

          {/* 요약 미리보기: paper.summary 또는 API 응답 */}
          {(paper.summary?.points?.length ? paper.summary.points[0] : paper.summary?.hook ?? summaryFromApi?.hook) && (
            <div className="flex gap-3 mb-auto items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none line-clamp-2 [&_p]:m-0">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {`${paper.summary?.points?.[0] ?? paper.summary?.hook ?? summaryFromApi?.hook ?? ""}`}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t md:border-t-0 md:pt-0 mt-auto">
            {/* Primary Actions (좋아요/저장/읽음) */}
            <div className="flex items-center gap-1 flex-1 justify-end">
              <Button
                variant="ghost"
                size="sm"
                className={cn("min-h-touch px-2", isLiked && "text-liked")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(() => toggleLike(paper.id));
                }}
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn("min-h-touch px-2", isSaved && "text-saved")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(() => toggleSave(paper.id));
                }}
              >
                <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
              </Button>
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
