import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { useState } from "react";
import { LoginModal } from "@/components/LoginModal";

interface SummaryContentProps {
    summary: {
        paperId: string;
        hookOneLiner: string;
        keyPoints: string[];
        detailed: string;
        evidenceScope: "full" | "intro" | "abstract";
    };
    pdfUrl?: string;
    isLoading?: boolean;
}

export function SummaryContent({ summary, pdfUrl, isLoading = false }: SummaryContentProps) {
    const { getAction, toggleLike, toggleSave, user } = useStore();
    const [showLoginModal, setShowLoginModal] = useState(false);

    const action = getAction(summary.paperId);
    const isLiked = action?.liked || false;
    const isSaved = action?.saved || false;

    const handleActionClick = (actionFn: () => void) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        actionFn();
    };
    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                {/* 한줄 요약 스켈레톤 */}
                <div>
                    <Skeleton className="h-4 w-20 mb-3" />
                    <Skeleton className="h-8 w-full" />
                </div>

                {/* 핵심 포인트 스켈레톤 */}
                <div>
                    <Skeleton className="h-4 w-20 mb-4" />
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-3/4" />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-5/6" />
                        </div>
                    </div>
                </div>

                {/* 상세 설명 스켈레톤 */}
                <div>
                    <Skeleton className="h-4 w-20 mb-4" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* 한줄 요약: BE hook */}
            <div className="animate-fade-in">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    한줄 요약
                </span>
                <div className="text-2xl font-display font-medium mt-3 leading-relaxed prose prose-lg max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {`💡 ${summary.hookOneLiner}`}
                    </ReactMarkdown>
                </div>
            </div>

            {/* 핵심 포인트: BE points */}
            <div className="animate-fade-in">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    핵심 포인트
                </span>
                <ul className="mt-4 space-y-3">
                    {summary.keyPoints.map((point, i) => (
                        <li
                            key={i}
                            className="flex gap-3 items-start text-lg"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <span className="text-primary font-bold">{i + 1}.</span>
                            <div className="flex-1 prose prose-base max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath, remarkGfm]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {point}
                                </ReactMarkdown>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* 좋아요 / 저장 버튼 */}
                <div className="flex items-center gap-2 mt-6 justify-end border-t pt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "gap-2 text-muted-foreground transition-colors hover:text-liked hover:bg-red-50 active:bg-red-100",
                            isLiked && "text-liked hover:text-liked"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(() => toggleLike(summary.paperId));
                        }}
                    >
                        <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                        좋아요
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "gap-2 text-muted-foreground transition-colors hover:text-saved hover:bg-blue-50 active:bg-blue-100",
                            isSaved && "text-saved hover:text-saved"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(() => toggleSave(summary.paperId));
                        }}
                    >
                        <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
                        저장
                    </Button>
                </div>
            </div>

            {/* 정리: BE detailed */}
            <div className="animate-fade-in">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    정리
                </span>
                <div className="mt-4 text-base leading-relaxed text-foreground/90 prose prose-base max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {summary.detailed}
                    </ReactMarkdown>
                </div>
                {pdfUrl && (
                    <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-center">
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            📄 전체 논문 읽어보기
                        </a>
                    </div>
                )}
            </div>

            <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} showNotice={true} />
        </div>
    );
}
