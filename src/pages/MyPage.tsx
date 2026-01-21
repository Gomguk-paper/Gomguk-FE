import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Heart,
  Bookmark,
  History,
  ChevronRight,
  Calendar,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { papers } from "@/data/papers";
import { useStore } from "@/store/useStore";
import { PaperCard } from "@/components/PaperCard";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { clearStoredUser } from "@/lib/authStorage";
import {
  format,
  isToday,
  isThisWeek,
  isThisMonth,
  parseISO,
  startOfDay,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale/ko";

export default function MyPage() {
  const navigate = useNavigate();
  const { user, actionsByUser, prefs, setUser } = useStore();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const userKey = user?.provider ?? null;
  const actions = userKey ? (actionsByUser[userKey] ?? []) : [];

  // 로그인하지 않은 사용자가 마이페이지에 접근하면 모달 표시
  useEffect(() => {
    if (!user) {
      setLoginModalOpen(true);
    }
  }, [user]);

  const likedPapers = useMemo(() => {
    const likedIds = actions.filter((a) => a.liked).map((a) => a.paperId);
    return papers.filter((p) => likedIds.includes(p.id));
  }, [actions]);

  const savedPapers = useMemo(() => {
    const savedIds = actions.filter((a) => a.saved).map((a) => a.paperId);
    return papers.filter((p) => savedIds.includes(p.id));
  }, [actions]);

  type DateFilter = "all" | "today" | "week" | "month";
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  // 읽은 논문을 날짜 정보와 함께 가져오기
  const readPapersWithDate = useMemo(() => {
    const readActions = actions.filter((a) => a.readAt);
    return readActions
      .map((action) => {
        const paper = papers.find((p) => p.id === action.paperId);
        if (!paper) return null;
        return {
          paper,
          readAt: action.readAt!,
          readDate: parseISO(action.readAt!),
        };
      })
      .filter(
        (item): item is { paper: (typeof papers)[0]; readAt: string; readDate: Date } =>
          item !== null
      );
  }, [actions]);

  // 날짜 필터 적용
  const filteredReadPapers = useMemo(() => {
    let filtered = [...readPapersWithDate];

    if (dateFilter === "today") {
      filtered = filtered.filter((item) => isToday(item.readDate));
    } else if (dateFilter === "week") {
      filtered = filtered.filter((item) => isThisWeek(item.readDate));
    } else if (dateFilter === "month") {
      filtered = filtered.filter((item) => isThisMonth(item.readDate));
    }

    // 최신순 정렬
    return filtered.sort((a, b) => b.readDate.getTime() - a.readDate.getTime());
  }, [readPapersWithDate, dateFilter]);

  // 날짜별 그룹화
  const groupedReadPapers = useMemo(() => {
    const groups: Record<string, typeof filteredReadPapers> = {};

    filteredReadPapers.forEach((item) => {
      const dateKey = format(startOfDay(item.readDate), "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    // 날짜별로 정렬 (최신순)
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredReadPapers]);

  const readPapers = useMemo(() => {
    const readIds = actions.filter((a) => a.readAt).map((a) => a.paperId);
    return papers.filter((p) => readIds.includes(p.id));
  }, [actions]);

  // 주별 읽기 통계
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const weeksAgo = 4;
    const stats: { week: string; count: number }[] = [];

    for (let i = weeksAgo - 1; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { locale: ko });
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const count = readPapersWithDate.filter((item) => {
        const readDate = item.readDate;
        return readDate >= weekStart && readDate <= weekEnd;
      }).length;

      stats.push({
        week: format(weekStart, "M/d", { locale: ko }),
        count,
      });
    }

    return stats;
  }, [readPapersWithDate]);

  // 태그별 읽기 분포
  const tagDistribution = useMemo(() => {
    const tagCounts: Record<string, number> = {};

    readPapersWithDate.forEach(({ paper }) => {
      paper.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // 상위 5개만 표시
  }, [readPapersWithDate]);

  // 시간대별 읽기 통계
  const hourlyStats = useMemo(() => {
    const hourCounts: Record<number, number> = {};

    readPapersWithDate.forEach(({ readDate }) => {
      const hour = readDate.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourCounts[i] || 0,
    }));
  }, [readPapersWithDate]);

  const chartConfig = {
    count: {
      label: "읽은 논문 수",
      color: "hsl(220, 60%, 50%)",
    },
  };

  // 명확한 색상 팔레트
  const COLORS = [
    "hsl(220, 60%, 50%)", // 파란색 (primary)
    "hsl(175, 60%, 45%)", // 청록색 (accent)
    "hsl(30, 80%, 55%)", // 주황색
    "hsl(340, 65%, 60%)", // 분홍색
    "hsl(200, 75%, 55%)", // 하늘색
  ];

  // 주별 통계용 색상 (그라데이션 효과)
  const getBarColor = (index: number, total: number) => {
    const colors = [
      "hsl(220, 60%, 50%)",
      "hsl(220, 60%, 55%)",
      "hsl(220, 60%, 60%)",
      "hsl(220, 60%, 65%)",
    ];
    return colors[index % colors.length];
  };

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    navigate("/login");
  };

  const renderMyPageHeader = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold p-4">마이페이지</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4 p-4">
        <Avatar className="w-16 h-16 shrink-0">
          {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {user?.name?.[0] || "G"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-base truncate">{user?.name || ""}</h2>
          {prefs && (
            <p className="text-sm text-muted-foreground">
              관심 분야 {prefs.tags.length}개 •{" "}
              {prefs.level === "undergraduate"
                ? "학부생"
                : prefs.level === "graduate"
                  ? "대학원생"
                  : prefs.level === "researcher"
                    ? "연구자"
                    : "실무자"}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{likedPapers.length}</div>
          <div className="text-xs text-muted-foreground">좋아요</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{savedPapers.length}</div>
          <div className="text-xs text-muted-foreground">저장</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{readPapers.length}</div>
          <div className="text-xs text-muted-foreground">읽음</div>
        </div>
      </div>
    </>
  );

  return (
    <main className="min-h-screen mobile-content-padding bg-background">
      {/* Mobile Header - Hidden on Desktop */}
      <header className="bg-card border-b mobile-safe-area-pt md:hidden">
        <div className="p-4 max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr">
          {renderMyPageHeader()}
        </div>
      </header>

      <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr">
        {/* Desktop Header Area - Hidden on Mobile */}
        <div className="hidden md:block p-4">{renderMyPageHeader()}</div>
        {/* Settings Link */}
        <button
          onClick={() => navigate("/onboarding")}
          className="w-full flex items-center justify-between p-4 bg-card border-b hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span>관심 분야 다시 설정하기</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Tabs */}
        <Tabs defaultValue="saved" className="p-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="saved" className="gap-1.5">
              <Bookmark className="w-4 h-4" />
              저장
            </TabsTrigger>
            <TabsTrigger value="liked" className="gap-1.5">
              <Heart className="w-4 h-4" />
              좋아요
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="w-4 h-4" />
              히스토리
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5">
              <BarChart3 className="w-4 h-4" />
              통계
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-4 space-y-4">
            {savedPapers.length > 0 ? (
              savedPapers.map((paper) => <PaperCard key={paper.id} paper={paper} />)
            ) : (
              <EmptyState icon={Bookmark} message="저장한 논문이 없어요" />
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-4 space-y-4">
            {likedPapers.length > 0 ? (
              likedPapers.map((paper) => <PaperCard key={paper.id} paper={paper} />)
            ) : (
              <EmptyState icon={Heart} message="좋아요한 논문이 없어요" />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-4">
            {readPapersWithDate.length > 0 ? (
              <>
                {/* 날짜 필터 */}
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="today">오늘</SelectItem>
                      <SelectItem value="week">이번 주</SelectItem>
                      <SelectItem value="month">이번 달</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {filteredReadPapers.length}개
                  </span>
                </div>

                {/* 날짜별 그룹화된 논문 목록 */}
                {groupedReadPapers.length > 0 ? (
                  <div className="space-y-6">
                    {groupedReadPapers.map(([dateKey, items]) => {
                      const date = parseISO(dateKey);
                      const isTodayDate = isToday(date);
                      const dateLabel = isTodayDate
                        ? "오늘"
                        : format(date, "yyyy년 M월 d일 (E)", { locale: ko });

                      return (
                        <div key={dateKey} className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <h3 className="text-sm font-semibold text-foreground">{dateLabel}</h3>
                            <span className="text-xs text-muted-foreground">{items.length}개</span>
                          </div>
                          {items.map(({ paper, readAt }) => (
                            <div key={paper.id} className="relative">
                              <PaperCard paper={paper} />
                              <div className="absolute top-4 right-16 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                                {format(parseISO(readAt), "HH:mm")}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={History}
                    message={`${dateFilter === "all" ? "읽은" : dateFilter === "today" ? "오늘 읽은" : dateFilter === "week" ? "이번 주에 읽은" : "이번 달에 읽은"} 논문이 없어요`}
                  />
                )}
              </>
            ) : (
              <EmptyState icon={History} message="읽은 논문이 없어요" />
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-4 space-y-4">
            {readPapersWithDate.length > 0 ? (
              <>
                {/* 주별 읽기 통계 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      주별 읽기 통계
                    </CardTitle>
                    <CardDescription>최근 4주간 읽은 논문 수</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <BarChart data={weeklyStats}>
                        <XAxis dataKey="week" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" radius={4}>
                          {weeklyStats.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getBarColor(index, weeklyStats.length)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* 태그별 읽기 분포 */}
                {tagDistribution.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        태그별 읽기 분포
                      </CardTitle>
                      <CardDescription>가장 많이 읽은 태그 Top 5</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <PieChart>
                          <Pie
                            data={tagDistribution}
                            dataKey="count"
                            nameKey="tag"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ tag, count }) => `${tag}: ${count}`}
                          >
                            {tagDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}

                {/* 시간대별 읽기 통계 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      시간대별 읽기 패턴
                    </CardTitle>
                    <CardDescription>언제 가장 많이 읽으시나요?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <BarChart data={hourlyStats}>
                        <XAxis dataKey="hour" tickFormatter={(value) => `${value}시`} />
                        <YAxis />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          labelFormatter={(value) => `${value}시`}
                        />
                        <Bar dataKey="count" radius={4}>
                          {hourlyStats.map((entry, index) => {
                            // 값이 있는 시간대는 primary 색상, 없는 시간대는 연한 회색
                            const color =
                              entry.count > 0 ? "hsl(220, 60%, 50%)" : "hsl(210, 15%, 85%)";
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* 읽기 습관 요약 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">읽기 습관 요약</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">총 읽은 논문</span>
                      <span className="text-lg font-bold">{readPapersWithDate.length}개</span>
                    </div>
                    {tagDistribution.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">가장 많이 읽은 태그</span>
                        <span className="text-lg font-bold">{tagDistribution[0].tag}</span>
                      </div>
                    )}
                    {hourlyStats.some((h) => h.count > 0) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">가장 많이 읽는 시간대</span>
                        <span className="text-lg font-bold">
                          {
                            hourlyStats.reduce(
                              (max, h) => (h.count > max.count ? h : max),
                              hourlyStats[0]
                            ).hour
                          }
                          시
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <EmptyState icon={BarChart3} message="읽은 논문이 없어 통계를 표시할 수 없어요" />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} showNotice={true} />
    </main>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof Heart; message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>{message}</p>
      <p className="text-sm mt-1">홈에서 논문을 탐색해보세요</p>
    </div>
  );
}
