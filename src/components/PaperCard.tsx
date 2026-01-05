import { Heart, Bookmark, Check, HelpCircle } from "lucide-react";
import { Paper, summaries } from "@/data/papers";
import { useStore } from "@/store/useStore";
import { TagChip } from "./TagChip";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { WhyThisModal } from "./WhyThisModal";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaperCardProps {
  paper: Paper;
  onOpenSummary?: () => void;
}

export function PaperCard({ paper, onOpenSummary }: PaperCardProps) {
  const { user, getAction, toggleLike, toggleSave, markAsRead } = useStore();
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const navigate = useNavigate();
  
  const action = getAction(paper.id);
  const summary = summaries.find(s => s.paperId === paper.id);
  const isLiked = action?.liked || false;
  const isSaved = action?.saved || false;
  const isRead = !!action?.readAt;
  const canUseActions = Boolean(user);
  const authMessage = !user
    ? "로그인 후 좋아요/저장/읽음 기능을 사용할 수 있어요."
    : null;

  const handleActionClick = (action: () => void) => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }
    action();
  };

  const handleLoginConfirm = () => {
    setShowLoginAlert(false);
    navigate("/login");
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

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{paper.authors[0]}{paper.authors.length > 1 && ` 외 ${paper.authors.length - 1}명`}</span>
          <span>•</span>
          <span>{paper.venue} {paper.year}</span>
          <span>•</span>
          <span>인용 {paper.metrics.citations.toLocaleString()}</span>
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

          <Button
            variant="outline"
            size="sm"
            className="ml-auto text-xs"
            onClick={onOpenSummary}
          >
            요약 보기
          </Button>
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

      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그인이 필요합니다</AlertDialogTitle>
            <AlertDialogDescription>
              이 기능을 사용하려면 로그인이 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLoginConfirm}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
