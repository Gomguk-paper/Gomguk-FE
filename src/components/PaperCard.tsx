import {
  Heart,
  Bookmark,
  HelpCircle,
  FileText,
  ChevronUp,
  MoreVertical,
  Ban,
  EyeOff,
  Hash,
  Undo,
  Sparkles,
  ExternalLink,
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
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
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
    getAction,
    toggleLike,
    toggleSave,
    hidePaper,
    blockAuthor,
    excludeTag,
    hiddenPapers,
    blockedAuthors,
    excludedTags,
    undoHidePaper
  } = useStore();

  const [showHideUndo, setShowHideUndo] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAbstract, setShowAbstract] = useState(false);

  const action = getAction(paper.id);
  const summary = summaries.find((s) => s.paperId === paper.id);
  const isLiked = action?.liked || false;
  const isSaved = action?.saved || false;
  const canUseActions = Boolean(user);
  const authMessage = !user ? "로그인 후 좋아요/저장 기능을 사용할 수 있어요." : null;

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

  const isHidden = hiddenPapers[paper.id];
  const isBlockedAuthor = paper.authors.some(author => blockedAuthors[author]);
  const isExcludedTag = paper.tags.some(tag => excludedTags[tag]);

  if (isHidden) {
    return (
      <div className="bg-muted/50 rounded-lg border p-4 flex items-center justify-between animate-in fade-in duration-300">
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

  if (isBlockedAuthor || isExcludedTag) {
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
              <h3 className="font-display font-semibold text-lg leading-snug text-foreground hover:text-primary transition-colors mb-1">
                {paper.title}
              </h3>
              <div className="text-xs text-muted-foreground mb-2">
                {paper.authors.slice(0, 3).join(", ")}{paper.authors.length > 3 && " et al."}
                <span className="mx-1.5">·</span>
                {paper.year}
                <Badge variant="secondary" className="ml-2 px-1.5 py-0 h-5 font-semibold text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 align-middle">
                  {paper.venue}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1 -mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-100/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowWhyModal(true);
                    }}
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end" className="text-xs max-w-[200px]">
                  <p>이 논문은 최근 읽은 Transformer 관련 논문들과 유사하여 추천되었습니다.</p>
                  <p className="mt-1 text-[10px] text-muted-foreground font-semibold cursor-pointer underline">자세히 보기</p>
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
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Ban className="w-4 h-4 mr-2" />
                      저자 차단
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {paper.authors.map(author => (
                        <DropdownMenuItem key={author} onClick={(e) => {
                          e.stopPropagation();
                          blockAuthor(author);
                        }}>
                          {author}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Hash className="w-4 h-4 mr-2" />
                      관심 없는 주제
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
              <TagChip key={tag} tag={tag} size="sm" />
            ))}
          </div>

          <div className="space-y-1 mb-auto">
            {/* Hook summary */}
            {summary && (
              <div className="text-sm text-muted-foreground leading-relaxed mb-2 prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {`💡 ${summary.hookOneLiner}`}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Abstract Preview */}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none line-clamp-2">
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
              >
                {abstractPreview}
              </ReactMarkdown>
            </div>
          </div>

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
            </div>

            {/* Secondary Actions (Link) */}
            <div className="flex items-center gap-2">
              {paper.pdfUrl && (
                <Button variant="ghost" size="sm" className="text-xs min-h-touch border border-input hover:bg-secondary text-muted-foreground hover:text-foreground" asChild>
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="원문 보기 (새 탭에서 열림)"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    원문
                  </a>
                </Button>
              )}
            </div>
          </div>
          {!canUseActions && authMessage && (
            <p className="text-xs text-muted-foreground mt-2">{authMessage}</p>
          )}
        </div>
      </article>

      <WhyThisModal paper={paper} open={showWhyModal} onOpenChange={setShowWhyModal} />

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} showNotice={true} />
    </>
  );
}
