import { Heart, Bookmark, Lightbulb, Undo } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { TagChip } from "@/components/TagChip";
import { LoginModal } from "@/components/LoginModal";
import { cn } from "@/lib/utils";
import { UI_CONSTANTS } from "@/core/config/constants";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import type { Paper } from "@/models";
import { usePaperCard } from "./usePaperCard";
import { HeaderActions } from "./HeaderActions";

interface PaperCardProps {
    paper: Paper;
    onOpenSummary?: () => void;
}

export function DesktopCard({ paper, onOpenSummary }: PaperCardProps) {
    const {
        showLoginModal,
        setShowLoginModal,
        hideToastPhase,
        isHidden,
        isExcludedTag,
        isLiked,
        isSaved,
        titleText,
        canUseActions,
        authMessage,
        recommendationReason,
        isTrendingTag,
        summaryContent,
        imageUrl,
        handleActionClick,
        handleCardClick,
        toggleLike,
        toggleSave,
        undoHidePaper,
        hidePaper,
        excludeTag,
    } = usePaperCard({ paper, onOpenSummary });

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
                className="bg-card rounded-lg border shadow-card transition-all cursor-pointer overflow-hidden flex flex-col md:flex-row md:gap-5 md:p-4"
                onClick={handleCardClick}
            >
                {/* Image Section (4:3 aspect ratio) */}
                {imageUrl && (
                    <div className="w-full md:w-[28%] flex-shrink-0">
                        <div className="bg-muted relative aspect-[2/1] md:aspect-[4/3] w-full md:rounded-lg overflow-hidden">
                            <img
                                src={imageUrl}
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
                        <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold text-lg leading-snug text-foreground hover:text-primary transition-colors mb-1 min-h-[1.5rem]">
                                {titleText}
                            </h3>
                            <div className="flex items-center text-xs text-muted-foreground mb-2">
                                <span className="truncate min-w-0">
                                    {paper.authors.slice(0, 3).join(", ")}{paper.authors.length > 3 && " et al."}
                                </span>
                                <span className="flex-shrink-0 ml-1.5 whitespace-nowrap">
                                    · {paper.year}
                                </span>
                            </div>
                        </div>

                        {/* Desktop always shows actions in header */}
                        <div className="flex items-center gap-1 -mr-2 mt-0.5 flex-shrink-0">
                            <HeaderActions
                                paper={paper}
                                recommendationReason={recommendationReason}
                                hidePaper={hidePaper}
                                excludeTag={excludeTag}
                                isOverlay={false}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {paper.tags.slice(0, UI_CONSTANTS.PAPER.MAX_DISPLAYED_TAGS).map((tag) => (
                            <TagChip key={tag} tag={tag} size="sm" trending={isTrendingTag(tag)} />
                        ))}
                    </div>

                    {/* Summary Preview */}
                    {summaryContent && (
                        <div className="flex gap-4 mb-auto items-start">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <Lightbulb className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="text-sm text-muted-foreground leading-normal prose prose-sm max-w-none line-clamp-2 [&_p]:m-0">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath, remarkGfm]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {`${summaryContent ?? ""}`}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Actions - Standard Padding */}
                    <div className="flex flex-wrap items-center gap-2 py-4 md:py-0 border-t md:border-t-0 md:pt-0 mt-4 md:mt-auto">
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
