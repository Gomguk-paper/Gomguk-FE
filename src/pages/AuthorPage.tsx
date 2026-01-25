import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Globe, GraduationCap, Briefcase, FileText, TrendingUp, Award, Building2, Bell, Check } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import { authorsApi } from "@/api";
import { PaperCard } from "@/components/PaperCard";
import { TagChip } from "@/components/TagChip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export default function AuthorPage() {
    const { authorId } = useParams<{ authorId: string }>();
    const navigate = useNavigate();
    const { followedAuthors, toggleFollow } = useStore();
    const isFollowing = authorId ? followedAuthors[authorId] : false;
    const [sortMode, setSortMode] = useState<"citations" | "recent">("citations");

    // Restore scroll position
    useScrollRestoration(`author-${authorId}`);

    // Fetch author data from API
    const { data: author, isLoading: authorLoading } = useQuery({
        queryKey: ['author', authorId],
        queryFn: () => authorId ? authorsApi.getAuthorById(authorId) : Promise.reject('No author ID'),
        enabled: !!authorId,
    });

    // Fetch author's papers from API
    const { data: authorPapers = [], isLoading: papersLoading } = useQuery({
        queryKey: ['author-papers', authorId],
        queryFn: () => authorId ? authorsApi.getAuthorPapers(authorId) : Promise.reject('No author ID'),
        enabled: !!authorId,
    });

    // Sort papers
    const sortedPapers = useMemo(() => {
        const sorted = [...authorPapers];
        if (sortMode === "citations") {
            sorted.sort((a, b) => b.metrics.citations - a.metrics.citations);
        } else {
            sorted.sort((a, b) => b.year - a.year);
        }
        return sorted;
    }, [authorPapers, sortMode]);

    // Calculate tag distribution from author's papers
    const topicDistribution = useMemo(() => {
        const tagCounts: Record<string, number> = {};
        authorPapers.forEach(paper => {
            paper.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
    }, [authorPapers]);

    // Show loading state
    if (authorLoading || papersLoading) {
        return (
            <main className="min-h-screen mobile-content-padding bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-lg font-semibold">로딩 중...</div>
                </div>
            </main>
        );
    }

    if (!author) {
        return (
            <main className="min-h-screen mobile-content-padding bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">저자를 찾을 수 없습니다</h1>
                    <Button onClick={() => navigate("/")}>홈으로 돌아가기</Button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen mobile-content-padding bg-background">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b mobile-safe-area-pt md:hidden">
                <div className="flex items-center gap-3 p-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="font-display text-xl font-bold">{author.name}</h1>
                </div>
            </header>

            <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr p-4 space-y-6">
                {/* Profile Section */}
                {/* Profile Section */}
                <Card className="overflow-hidden border-none shadow-lg">
                    {/* Cover Gradient */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-teal-500 relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 left-4 text-white hover:bg-white/20 hover:text-white"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            Back
                        </Button>
                    </div>

                    <CardContent className="pt-0 relative px-6 pb-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Avatar - Negative margin to overlap cover */}
                            <div className="-mt-12 p-1 bg-background rounded-full">
                                <Avatar className="w-32 h-32 border-4 border-background shadow-md">
                                    <AvatarImage src={author.avatarUrl} alt={author.name} />
                                    <AvatarFallback className="text-3xl font-bold bg-muted">
                                        {author.name.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="flex-1 space-y-4 pt-4 md:pt-2">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-display font-bold text-foreground">
                                            {author.name}
                                        </h1>
                                        <div className="flex items-center gap-2 text-muted-foreground mt-1 text-lg">
                                            <Building2 className="w-4 h-4" />
                                            <span>{author.affiliations.join(" • ")}</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => authorId && toggleFollow(authorId)}
                                        className={`gap-2 min-w-[140px] shadow-sm transition-all ${isFollowing
                                                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                                : "bg-teal-600 hover:bg-teal-700 text-white"
                                            }`}
                                        size="lg"
                                    >
                                        {isFollowing ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                팔로우 중
                                            </>
                                        ) : (
                                            <>
                                                <Bell className="w-4 h-4" />
                                                팔로우
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {author.bio && (
                                    <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
                                        {author.bio}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 pt-1">
                                    {author.email && (
                                        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm font-normal">
                                            <Mail className="w-3.5 h-3.5" />
                                            {author.email}
                                        </Badge>
                                    )}
                                    {author.website && (
                                        <a href={author.website} target="_blank" rel="noopener noreferrer">
                                            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm font-normal hover:bg-secondary/80 cursor-pointer">
                                                <Globe className="w-3.5 h-3.5" />
                                                Website
                                            </Badge>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <div className="text-3xl font-bold text-foreground">{author.stats.totalPapers}</div>
                            <div className="text-sm text-muted-foreground font-medium">총 논문</div>
                        </CardContent>
                    </Card>

                    <Card className="border-teal-100 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-950/10">
                        <CardContent className="pt-6 text-center">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-teal-600 dark:text-teal-400" />
                            <div className="text-3xl font-bold text-teal-700 dark:text-teal-300">
                                {author.stats.totalCitations.toLocaleString()}
                            </div>
                            <div className="text-sm font-medium text-teal-600/80 dark:text-teal-400/80">총 인용 수</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Award className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <div className="text-3xl font-bold text-foreground">{author.stats.hIndex}</div>
                            <div className="text-sm text-muted-foreground font-medium">h-index</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Award className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <div className="text-3xl font-bold text-foreground">{author.stats.i10Index}</div>
                            <div className="text-sm text-muted-foreground font-medium">i10-index</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Research Topics */}
                {topicDistribution.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>주요 연구 주제</CardTitle>
                            <CardDescription>논문에서 가장 많이 다룬 주제</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {topicDistribution.map(({ tag, count }) => (
                                    <div key={tag} className="flex items-center gap-1">
                                        <TagChip tag={tag} />
                                        <span className="text-xs text-muted-foreground">({count})</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Education */}
                {author.education.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" />
                                학력
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {author.education.map((edu, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="text-sm font-semibold text-muted-foreground w-16 shrink-0">
                                        {edu.year}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold">{edu.degree} in {edu.field}</div>
                                        <div className="text-sm text-muted-foreground">{edu.institution}</div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Career */}
                {author.positions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                경력
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {author.positions.map((pos, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="text-sm font-semibold text-muted-foreground w-24 shrink-0">
                                        {pos.startYear} - {pos.endYear || "Present"}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold">{pos.title}</div>
                                        <div className="text-sm text-muted-foreground">{pos.institution}</div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Papers */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>논문 ({sortedPapers.length})</CardTitle>
                                <CardDescription>이 저자가 작성한 논문</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={sortMode === "citations" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSortMode("citations")}
                                >
                                    인용순
                                </Button>
                                <Button
                                    variant={sortMode === "recent" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSortMode("recent")}
                                >
                                    최신순
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {sortedPapers.length > 0 ? (
                            sortedPapers.map(paper => (
                                <PaperCard key={paper.id} paper={paper} />
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>등록된 논문이 없습니다</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
