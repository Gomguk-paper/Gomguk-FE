import { useNavigate, useLocation } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { tagsApi } from "@/api";
import { useStore } from "@/store/useStore";
import { LoginModal } from "@/components/LoginModal";
import { LegalModal } from "@/components/LegalModal";

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

    // Fetch trending tags from API (Hook must be called before any early return)
    const { data: trendingTagsResponse } = useQuery({
        queryKey: ['tags', 'trending'],
        queryFn: () => tagsApi.getTags({ limit: 20 }),
    });

    const handleLegalClick = (type: "terms" | "privacy" | "cookies" | "accessibility" | "advertising") => {
        setLegalContentType(type);
        setLegalModalOpen(true);
    };

    // Hide on login and onboarding pages
    if (location.pathname === "/login" || location.pathname === "/onboarding") {
        return null;
    }

    const trendingTagsData = trendingTagsResponse?.items || [];
    const allTrendingTags = trendingTagsData.map(item => ({ tag: item.tag.name, count: item.tag.count || 0 }));
    const trendingTags = showAllTrends ? allTrendingTags : allTrendingTags.slice(0, 5);

    const handleTrendOptions = (tag: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: "트렌드 옵션",
            description: `"${tag}" 트렌드에 관심이 없으신가요?`,
        });
    };

    return (
        <aside className="hidden xl:flex flex-col w-[350px] min-h-screen p-4 gap-4 border-l sticky top-0 h-screen overflow-y-auto scrollbar-hide">
            {/* Search Bar Placeholder (Optional, if we decided to move it here, but keeping it in main body for now) */}

            {/* Trends Section */}
            <div className="bg-card rounded-xl border p-4 relative">
                <h2 className="font-display font-bold text-lg mb-4">나를 위한 트렌드</h2>
                <div className={`space-y-4 transition-all ${!isLoggedIn ? 'blur-sm pointer-events-none' : ''}`}>
                    {trendingTags.map(({ tag, count }, index) => (
                        <div
                            key={tag}
                            role="button"
                            onClick={() => navigate(`/search?tag=${tag}`)}
                            className="flex items-center justify-between group cursor-pointer"
                        >
                            <div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    {index + 1} · 컴퓨터 과학
                                </div>
                                <div className="font-bold pt-0.5 group-hover:underline">#{tag}</div>
                                <div className="text-xs text-muted-foreground pt-0.5">{count} papers</div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={(e) => handleTrendOptions(tag, e)}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                {allTrendingTags.length > 5 && (
                    <Button
                        variant="ghost"
                        className="w-full text-primary justify-start px-0 mt-4 hover:bg-transparent hover:underline"
                        onClick={() => setShowAllTrends(!showAllTrends)}
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
                        aria-label="로그인하여 나를 위한 트렌드 보기"
                    >
                        <div className="text-center p-4">
                            <p className="font-semibold text-lg mb-2">🔒 로그인이 필요합니다</p>
                            <p className="text-sm text-muted-foreground">개인화된 트렌드를 보려면 로그인하세요</p>
                        </div>
                    </div>
                )}
            </div>


            {/* Footer */}
            <div className="px-4 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-8">
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
