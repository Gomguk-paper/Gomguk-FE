import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Paper } from "@/models";

interface SummaryNavigationProps {
    currentPaperIndex: number;
    papers: Paper[];
    isMobileMode: boolean;
    isDesktopMode: boolean;
    onPrev: () => void;
    onNext: () => void;
}

export function SummaryNavigation({
    currentPaperIndex,
    papers,
    isMobileMode,
    isDesktopMode,
    onPrev,
    onNext
}: SummaryNavigationProps) {
    return (
        <>
            {/* Side navigation buttons - 데스크탑 전용 (모바일 모드일 때 숨김) */}
            {!isMobileMode && (
                <>
                    <button
                        className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 z-20",
                            "p-4 rounded-full bg-background/90 backdrop-blur-sm border shadow-lg",
                            "hover:bg-background hover:scale-110 transition-all min-h-touch min-w-touch",
                            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
                            "hidden md:flex items-center justify-center",
                            currentPaperIndex === 0 && "opacity-50"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            onPrev();
                        }}
                        disabled={currentPaperIndex === 0}
                        aria-label="이전 논문"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                    >
                        <ChevronLeft className="w-8 h-8 text-foreground" />
                    </button>
                    <button
                        className={cn(
                            "absolute right-4 top-1/2 -translate-y-1/2 z-20",
                            "p-4 rounded-full bg-background/90 backdrop-blur-sm border shadow-lg",
                            "hover:bg-background hover:scale-110 transition-all min-h-touch min-w-touch",
                            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
                            "hidden md:flex items-center justify-center",
                            currentPaperIndex === papers.length - 1 && "opacity-50"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            onNext();
                        }}
                        disabled={currentPaperIndex === papers.length - 1}
                        aria-label="다음 논문"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                    >
                        <ChevronRight className="w-8 h-8 text-foreground" />
                    </button>
                </>
            )}

            {/* Bottom navigation - 모바일 전용 (모바일 모드이거나 화면이 작을 때) */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 z-20 pb-8 pointer-events-none",
                isMobileMode ? "block" : isDesktopMode ? "hidden" : "md:hidden"
            )}>
                <div className="max-w-md mx-auto px-4 pointer-events-auto">
                    <div className="bg-background/95 backdrop-blur-sm border rounded-2xl shadow-lg p-2">
                        <div className="flex items-center justify-between gap-2">
                            {/* 이전 논문 */}
                            <button
                                className={cn(
                                    "flex-1 flex items-center gap-3 px-3 py-2 rounded-xl",
                                    "hover:bg-secondary/80 transition-colors",
                                    "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                                    "group min-w-0"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPrev();
                                }}
                                disabled={currentPaperIndex === 0}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                                <div className="flex-1 text-left min-w-0">
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">PREV</div>
                                    <div className="text-xs font-medium truncate mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                        {currentPaperIndex > 0 ? papers[currentPaperIndex - 1].title : "이전 포스트"}
                                    </div>
                                </div>
                            </button>

                            <div className="w-px h-8 bg-border/50 shrink-0" />

                            {/* 다음 논문 */}
                            <button
                                className={cn(
                                    "flex-1 flex items-center justify-end gap-3 px-3 py-2 rounded-xl",
                                    "hover:bg-secondary/80 transition-colors",
                                    "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                                    "group min-w-0"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNext();
                                }}
                                disabled={currentPaperIndex === papers.length - 1}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                <div className="flex-1 text-right min-w-0">
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">NEXT</div>
                                    <div className="text-xs font-medium truncate mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                        {currentPaperIndex < papers.length - 1 ? papers[currentPaperIndex + 1].title : "다음 포스트"}
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
