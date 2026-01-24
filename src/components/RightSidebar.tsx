import { useNavigate, useLocation } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { authorsApi, tagsApi } from "@/api";

export function RightSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [showAllTrends, setShowAllTrends] = useState(false);
    const [followedAuthors, setFollowedAuthors] = useState<Set<string>>(new Set());

    // Hide on login and onboarding pages
    if (location.pathname === "/login" || location.pathname === "/onboarding") {
        return null;
    }

    // Fetch trending tags from API
    const { data: trendingTagsData = [] } = useQuery({
        queryKey: ['tags', 'trending'],
        queryFn: () => tagsApi.getTrendingTags({ limit: 20 }),
    });

    const allTrendingTags = trendingTagsData.map(t => ({ tag: t.name, count: t.count || 0 }));
    const trendingTags = showAllTrends ? allTrendingTags : allTrendingTags.slice(0, 5);

    // Fetch recommended authors from API
    const { data: authors = [] } = useQuery({
        queryKey: ['authors', 'recommended'],
        queryFn: () => authorsApi.getAuthors({ recommended: true, limit: 3 }),
    });

    // Transform authors to match the component's expected format
    const recommendedAuthors = authors.map(author => ({
        id: author.id,
        name: author.name,
        handle: `@${author.id}`,
        avatar: author.avatarUrl || null,
        fallback: author.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    }));

    const handleFollowToggle = (handle: string) => {
        const newFollowed = new Set(followedAuthors);
        if (newFollowed.has(handle)) {
            newFollowed.delete(handle);
            toast({
                title: "팔로우 취소",
                description: "팔로우를 취소했습니다.",
            });
        } else {
            newFollowed.add(handle);
            toast({
                title: "팔로우",
                description: "팔로우했습니다.",
            });
        }
        setFollowedAuthors(newFollowed);
    };

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
            </div>

            {/* Who to follow Section */}
            <div className="bg-card rounded-xl border p-4">
                <h2 className="font-display font-bold text-lg mb-4">팔로우 추천</h2>
                <div className="space-y-4">
                    {recommendedAuthors.map((author) => (
                        <div key={author.handle} className="flex items-center justify-between">
                            <div
                                className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-secondary/30 -mx-2 px-2 py-1 rounded-lg transition-colors"
                                onClick={() => navigate(`/author/${author.id}`)}
                            >
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={author.avatar || undefined} />
                                    <AvatarFallback>{author.fallback}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-bold text-sm hover:underline cursor-pointer">{author.name}</div>
                                    <div className="text-xs text-muted-foreground">{author.handle}</div>
                                </div>
                            </div>
                            <Button
                                variant={followedAuthors.has(author.handle) ? "secondary" : "outline"}
                                size="sm"
                                className="rounded-full h-8 px-4 font-bold"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFollowToggle(author.handle);
                                }}
                            >
                                {followedAuthors.has(author.handle) ? "팔로잉" : "팔로우"}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                <span
                    className="hover:underline cursor-pointer"
                    onClick={() => toast({ title: "이용약관", description: "준비 중입니다." })}
                >
                    이용약관
                </span>
                <span
                    className="hover:underline cursor-pointer"
                    onClick={() => toast({ title: "개인정보처리방침", description: "준비 중입니다." })}
                >
                    개인정보처리방침
                </span>
                <span
                    className="hover:underline cursor-pointer"
                    onClick={() => toast({ title: "쿠키 정책", description: "준비 중입니다." })}
                >
                    쿠키 정책
                </span>
                <span
                    className="hover:underline cursor-pointer"
                    onClick={() => toast({ title: "접근성", description: "준비 중입니다." })}
                >
                    접근성
                </span>
                <span
                    className="hover:underline cursor-pointer"
                    onClick={() => toast({ title: "광고 정보", description: "준비 중입니다." })}
                >
                    광고 정보
                </span>
                <div className="w-full mt-1">
                    © 2024 Gomguk Corp.
                </div>
            </div>
        </aside>
    );
}
