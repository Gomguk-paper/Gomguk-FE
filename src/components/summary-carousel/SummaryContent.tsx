import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";

interface SummaryContentProps {
    summary: {
        hookOneLiner: string;
        keyPoints: string[];
        detailed: string;
        evidenceScope: "full" | "intro" | "abstract";
    };
    pdfUrl?: string;
    isLoading?: boolean;
}

/** 논문 본문을 앱 내 뷰어에서 볼 수 있는 URL. arxiv abs → PDF URL로 변환 */
function getViewerUrl(pdfUrl: string): string {
    const trimmed = pdfUrl.trim();
    const absMatch = trimmed.match(/arxiv\.org\/abs\/([^/?#]+)/i);
    if (absMatch) return `https://arxiv.org/pdf/${absMatch[1]}.pdf`;
    if (trimmed.includes("arxiv.org/pdf/")) return trimmed;
    return trimmed;
}

export function SummaryContent({ summary, pdfUrl, isLoading = false }: SummaryContentProps) {
    const [viewerOpen, setViewerOpen] = useState(false);
    const viewerSrc = useMemo(() => (pdfUrl ? getViewerUrl(pdfUrl) : ""), [pdfUrl]);

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
            {/* 한줄 요약 */}
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

            {/* 핵심 포인트 */}
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
            </div>

            {/* 정리 (detailed) */}
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
                    <>
                        <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-center">
                            <button
                                type="button"
                                className="text-sm font-medium text-primary hover:underline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setViewerOpen(true);
                                }}
                            >
                                📄 전체 논문 읽어보기
                            </button>
                        </div>
                        <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
                            <DialogContent
                                className="max-w-[95vw] w-full h-[90vh] p-0 gap-0 overflow-hidden flex flex-col"
                                onPointerDownOutside={(e) => e.stopPropagation()}
                            >
                                <DialogTitle className="sr-only">논문 본문 뷰어</DialogTitle>
                                <div className="flex items-center justify-end gap-2 px-3 py-2 border-b bg-muted/30 shrink-0">
                                    <a
                                        href={viewerSrc}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline"
                                    >
                                        새 탭에서 열기
                                    </a>
                                </div>
                                <iframe
                                    title="논문 본문"
                                    src={viewerSrc}
                                    className="w-full flex-1 min-h-0 border-0 rounded-b-lg"
                                />
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>
        </div>
    );
}
