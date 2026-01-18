import { useNavigate, useLocation } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { papers } from "@/data/papers";

export function RightSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide on login and onboarding pages
    if (location.pathname === "/login" || location.pathname === "/onboarding") {
        return null;
    }

    // Calculate tag counts
    const tagCounts: Record<string, number> = {};
    papers.forEach(paper => {
        paper.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    const trendingTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1]) // Sort by count desc
        .slice(0, 5) // Top 5
        .map(([tag, count]) => ({ tag, count }));

    // Mock recommended authors
    const recommendedAuthors = [
        { name: "Yann LeCun", handle: "@ylecun", avatar: null, fallback: "YL" },
        { name: "Andrej Karpathy", handle: "@karpathy", avatar: null, fallback: "AK" },
        { name: "Demis Hassabis", handle: "@demis", avatar: null, fallback: "DH" },
    ];

    return (
        <aside className="hidden xl:flex flex-col w-[350px] min-h-screen p-4 gap-4 border-l sticky top-0 h-screen overflow-y-auto scrollbar-hide">
            {/* Search Bar Placeholder (Optional, if we decided to move it here, but keeping it in main body for now) */}

            {/* Trends Section */}
            <div className="bg-card rounded-xl border p-4">
                <h2 className="font-display font-bold text-lg mb-4">나를 위한 트렌드</h2>
                <div className="space-y-4">
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
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button
                    variant="ghost"
                    className="w-full text-primary justify-start px-0 mt-4 hover:bg-transparent hover:underline"
                    onClick={() => navigate("/search")}
                >
                    더 보기
                </Button>
            </div>

            {/* Who to follow Section */}
            <div className="bg-card rounded-xl border p-4">
                <h2 className="font-display font-bold text-lg mb-4">팔로우 추천</h2>
                <div className="space-y-4">
                    {recommendedAuthors.map((author) => (
                        <div key={author.handle} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={author.avatar || undefined} />
                                    <AvatarFallback>{author.fallback}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-bold text-sm hover:underline cursor-pointer">{author.name}</div>
                                    <div className="text-xs text-muted-foreground">{author.handle}</div>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-full h-8 px-4 font-bold">
                                팔로우
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                <span className="hover:underline cursor-pointer">이용약관</span>
                <span className="hover:underline cursor-pointer">개인정보처리방침</span>
                <span className="hover:underline cursor-pointer">쿠키 정책</span>
                <span className="hover:underline cursor-pointer">접근성</span>
                <span className="hover:underline cursor-pointer">광고 정보</span>
                <div className="w-full mt-1">
                    © 2024 Gomguk Corp.
                </div>
            </div>
        </aside>
    );
}
