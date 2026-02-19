import { useNavigate, useLocation } from "react-router-dom";
import { MoreHorizontal, Lock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import { LoginModal } from "@/components/LoginModal";
import { LegalModal } from "@/components/LegalModal";
import { useTrendingTags } from "@/contexts/TrendingTagsContext";

const TRENDING_VISIBLE = 5;

export function RightSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { user } = useStore();
    const [showAllTrends, setShowAllTrends] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [legalModalOpen, setLegalModalOpen] = useState(false);
    const [legalContentType, setLegalContentType] = useState<"terms" | "privacy" | "cookies" | "accessibility" | "advertising" | null>(null);

    const isLoggedIn = Boolean(user);

    const { trendingTagNames } = useTrendingTags();
    const tags = trendingTagNames ?? [];

    const handleLegalClick = (type: "terms" | "privacy" | "cookies" | "accessibility" | "advertising") => {
        setLegalContentType(type);
        setLegalModalOpen(true);
    };

    // Hide on login and onboarding pages
    if (location.pathname === "/login" || location.pathname === "/onboarding") {
        return null;
    }

    const DUMMY_TAGS = ["인공지능", "머신러닝", "딥러닝", "자연어처리", "컴퓨터비전"];

    const visibleTags = isLoggedIn
        ? (showAllTrends ? tags : tags.slice(0, TRENDING_VISIBLE))
        : DUMMY_TAGS;

    const handleTrendOptions = (tag: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: "트렌드 옵션",
            description: `"${tag}" 트렌드에 관심이 없으신가요?`,
        });
    };

    return (
        <aside className="hidden xl:flex flex-col w-[350px] min-h-screen p-4 gap-4 border-l sticky top-0 h-screen overflow-y-auto scrollbar-hide">
            {/* Trends Section: flex-shrink-0으로 카드가 내용만큼 늘어나고, 길면 aside 전체 스크롤 */}
            <div className="bg-card rounded-xl border p-4 relative min-h-[500px] mt-10 flex-shrink-0">
                <h2 className="font-display font-bold text-2xl mb-6 text-center text-foreground">Trending Topics</h2>
                <div className={`flex flex-col divide-y transition-all ${!isLoggedIn ? 'blur-sm pointer-events-none' : ''}`}>
                    {visibleTags.map((tag, index) => (
                        <div
                            key={tag}
                            role="button"
                            onClick={() => navigate(`/search?tag=${encodeURIComponent(tag)}`)}
                            className="flex items-center justify-between group cursor-pointer py-6"
                        >
                            <div className="flex items-center gap-4">
                                <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm leading-none pt-0.5 ${!isLoggedIn ? 'w-10 h-10 text-lg' : ''}`}>
                                    {index + 1}
                                </span>
                                <span className={`font-bold text-[hsl(var(--tag-trending))] group-hover:opacity-80 transition-colors leading-none pt-0.5 ${!isLoggedIn ? 'text-xl' : ''}`}>
                                    #{tag}
                                </span>
                            </div>

                            {/* Right side balance */}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                {!isLoggedIn && (
                                    <span className="text-sm font-medium">1.2k papers</span>
                                )}
                                {isLoggedIn ? (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleTrendOptions(tag, e)}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <ArrowUpRight className="h-5 w-5 opacity-50" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {isLoggedIn && tags.length > TRENDING_VISIBLE && (
                    <Button
                        variant="secondary"
                        className="w-full justify-center mt-6 py-6 font-bold text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowAllTrends((prev) => !prev)}
                    >
                        {showAllTrends ? "간단히 보기" : "더 보기"}
                    </Button>
                )}

                {/* Login Overlay - only visible when not logged in */}
                {!isLoggedIn && (
                    <div
                        className="absolute inset-0 cursor-pointer rounded-xl flex items-center justify-center bg-background/30 backdrop-blur-sm"
                        onClick={() => setLoginModalOpen(true)}
                        role="button"
                        aria-label="로그인하여 Trending Topics 보기"
                    >
                        <div className="text-center p-4 flex flex-col items-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 shadow-sm backdrop-blur-sm">
                                <Lock className="w-6 h-6 text-primary" />
                            </div>
                            <p className="font-semibold text-lg mb-2">로그인이 필요합니다</p>
                            <p className="text-sm text-muted-foreground text-center">
                                현재 인기있는 주제를 보려면
                                <br />
                                로그인을 해야합니다
                            </p>
                        </div>
                    </div>
                )}
            </div>


            {/* Footer */}
            <div className="px-4 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-8 flex-shrink-0">
                <span
                    className="hover:underline cursor-pointer"
                    onClick={() => handleLegalClick("terms")}
                >
                    이용약관
                </span>
                <span
                    className="hover:underline cursor-pointer"
                    onClick={() => handleLegalClick("privacy")}
                >
                    개인정보처리방침
                </span>
                <span
                    className="hover:underline cursor-pointer"
                    onClick={() => handleLegalClick("cookies")}
                >
                    쿠키 정책
                </span>
                <span
                    className="hover:underline cursor-pointer"
                    onClick={() => handleLegalClick("accessibility")}
                >
                    접근성
                </span>
                <span
                    className="hover:underline cursor-pointer"
                    onClick={() => handleLegalClick("advertising")}
                >
                    광고 정보
                </span>
                <div className="w-full mt-1">
                    © 2026 Gomguk Corp.
                </div>
            </div>

            {/* Login Modal */}
            <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} showNotice={true} />

            {/* Legal Modal */}
            <LegalModal open={legalModalOpen} onOpenChange={setLegalModalOpen} contentType={legalContentType} />
        </aside>
    );
}
