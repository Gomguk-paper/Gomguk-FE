import { Heart, Bookmark, Check, HelpCircle, Calendar, Users, TrendingUp, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Paper, summaries } from "@/data/papers";
import { useStore } from "@/store/useStore";
import { TagChip } from "./TagChip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { WhyThisModal } from "./WhyThisModal";
import { LoginModal } from "./LoginModal";
import { cn } from "@/lib/utils";

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
  const summary = summaries.find(s => s.paperId === paper.id);
  const isLiked = action?.liked || false;
  const isSaved = action?.saved || false;
  const isRead = !!action?.readAt;
  const canUseActions = Boolean(user);
  const authMessage = !user
    ? "로그인 후 좋아요/저장/읽음 기능을 사용할 수 있어요."
    : null;

  // 추상 미리보기 (2-3줄)
  const abstractPreview = paper.abstract.length > 150 
    ? paper.abstract.substring(0, 150) + "..."
    : paper.abstract;
  
  // 저자 표시 로직
  const shouldCollapseAuthors = paper.authors.length > 3;
  const displayedAuthors = shouldCollapseAuthors && !showAllAuthors
    ? paper.authors.slice(0, 3)
    : paper.authors;

  const handleActionClick = (action: () => void) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    action();
  };

  return (
    <>
      <article className={cn(
        "bg-card rounded-lg border shadow-card p-4 space-y-3 transition-all",
        isRead && "opacity-75"
      )}>
        {/* Header: Tags & Why */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {paper.tags.slice(0, 3).map(tag => (
              <TagChip key={tag} tag={tag} size="sm" />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs gap-1 h-7"
            onClick={() => setShowWhyModal(true)}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            왜 추천?
          </Button>
        </div>

        {/* Title */}
        <h3 
          className="font-display font-semibold text-lg leading-snug text-foreground cursor-pointer hover:text-primary transition-colors"
          onClick={onOpenSummary}
        >
          {paper.title}
        </h3>

        {/* Hook summary */}
        {summary && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            💡 {summary.hookOneLiner}
          </p>
        )}

        {/* Abstract Preview */}
        <Collapsible open={showAbstract} onOpenChange={setShowAbstract}>
          <div className="space-y-1">
            <p className={cn(
              "text-xs text-muted-foreground leading-relaxed",
              !showAbstract && "line-clamp-2"
            )}>
              {showAbstract ? paper.abstract : abstractPreview}
            </p>
            {paper.abstract.length > 150 && (
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
                    {author}{idx < displayedAuthors.length - 1 && ","}
                  </span>
                ))}
                {shouldCollapseAuthors && !showAllAuthors && (
                  <button 
                    onClick={() => setShowAllAuthors(true)}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    외 {paper.authors.length - 3}명
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
                {shouldCollapseAuthors && showAllAuthors && (
                  <button 
                    onClick={() => setShowAllAuthors(false)}
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

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1.5", isLiked && "text-liked")}
            onClick={() => handleActionClick(() => toggleLike(paper.id))}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span className="text-xs">좋아요</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1.5", isSaved && "text-saved")}
            onClick={() => handleActionClick(() => toggleSave(paper.id))}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
            <span className="text-xs">저장</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1.5", isRead && "text-accent")}
            onClick={() => handleActionClick(() => markAsRead(paper.id))}
          >
            <Check className={cn("w-4 h-4", isRead && "stroke-[3]")} />
            <span className="text-xs">읽음</span>
          </Button>

          <div className="ml-auto flex items-center gap-1">
            {paper.pdfUrl && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                asChild
              >
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="PDF 원문 보기 (새 탭에서 열림)"
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  PDF 보기
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={onOpenSummary}
            >
              요약 보기
            </Button>
          </div>
        </div>
        {!canUseActions && authMessage && (
          <p className="text-xs text-muted-foreground">{authMessage}</p>
        )}
      </article>

      <WhyThisModal 
        paper={paper} 
        open={showWhyModal} 
        onOpenChange={setShowWhyModal} 
      />

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        showNotice={true}
      />
    </>
  );
}
