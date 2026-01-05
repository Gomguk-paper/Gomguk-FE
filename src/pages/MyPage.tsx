import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Heart, Bookmark, History, ChevronRight, Calendar } from "lucide-react";
import { papers } from "@/data/papers";
import { useStore } from "@/store/useStore";
import { PaperCard } from "@/components/PaperCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clearStoredUser } from "@/lib/authStorage";
import { format, isToday, isThisWeek, isThisMonth, parseISO, startOfDay } from "date-fns";
import { ko } from "date-fns/locale/ko";

export default function MyPage() {
  const navigate = useNavigate();
  const { user, actionsByUser, prefs, setUser } = useStore();
  const userKey = user?.provider ?? null;
  const actions = userKey ? actionsByUser[userKey] ?? [] : [];

  const likedPapers = useMemo(() => {
    const likedIds = actions.filter(a => a.liked).map(a => a.paperId);
    return papers.filter(p => likedIds.includes(p.id));
  }, [actions]);

  const savedPapers = useMemo(() => {
    const savedIds = actions.filter(a => a.saved).map(a => a.paperId);
    return papers.filter(p => savedIds.includes(p.id));
  }, [actions]);

  type DateFilter = "all" | "today" | "week" | "month";
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  // 읽은 논문을 날짜 정보와 함께 가져오기
  const readPapersWithDate = useMemo(() => {
    const readActions = actions.filter(a => a.readAt);
    return readActions.map(action => {
      const paper = papers.find(p => p.id === action.paperId);
      if (!paper) return null;
      return {
        paper,
        readAt: action.readAt!,
        readDate: parseISO(action.readAt!),
      };
    }).filter((item): item is { paper: typeof papers[0]; readAt: string; readDate: Date } => item !== null);
  }, [actions]);

  // 날짜 필터 적용
  const filteredReadPapers = useMemo(() => {
    let filtered = [...readPapersWithDate];
    
    if (dateFilter === "today") {
      filtered = filtered.filter(item => isToday(item.readDate));
    } else if (dateFilter === "week") {
      filtered = filtered.filter(item => isThisWeek(item.readDate));
    } else if (dateFilter === "month") {
      filtered = filtered.filter(item => isThisMonth(item.readDate));
    }
    
    // 최신순 정렬
    return filtered.sort((a, b) => b.readDate.getTime() - a.readDate.getTime());
  }, [readPapersWithDate, dateFilter]);

  // 날짜별 그룹화
  const groupedReadPapers = useMemo(() => {
    const groups: Record<string, typeof filteredReadPapers> = {};
    
    filteredReadPapers.forEach(item => {
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
    const readIds = actions.filter(a => a.readAt).map(a => a.paperId);
    return papers.filter(p => readIds.includes(p.id));
  }, [actions]);

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    navigate("/login");
  };

  return (
    <main className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="p-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-xl font-bold">마이페이지</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/onboarding")}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.name?.[0] || "G"}
              </span>
            </div>
            <div>
              <h2 className="font-semibold">{user?.name || ""}</h2>
              {prefs && (
                <p className="text-sm text-muted-foreground">
                  관심 분야 {prefs.tags.length}개 • {prefs.level === "undergraduate" ? "학부생" : prefs.level === "graduate" ? "대학원생" : prefs.level === "researcher" ? "연구자" : "실무자"}
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
        </div>
      </header>

      <div className="max-w-lg mx-auto">
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
          <TabsList className="grid w-full grid-cols-3">
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
          </TabsList>
          
          <TabsContent value="saved" className="mt-4 space-y-4">
            {savedPapers.length > 0 ? (
              savedPapers.map(paper => (
                <PaperCard key={paper.id} paper={paper} />
              ))
            ) : (
              <EmptyState icon={Bookmark} message="저장한 논문이 없어요" />
            )}
          </TabsContent>
          
          <TabsContent value="liked" className="mt-4 space-y-4">
            {likedPapers.length > 0 ? (
              likedPapers.map(paper => (
                <PaperCard key={paper.id} paper={paper} />
              ))
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
                            <h3 className="text-sm font-semibold text-foreground">
                              {dateLabel}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {items.length}개
                            </span>
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
                  <EmptyState icon={History} message={`${dateFilter === "all" ? "읽은" : dateFilter === "today" ? "오늘 읽은" : dateFilter === "week" ? "이번 주에 읽은" : "이번 달에 읽은"} 논문이 없어요`} />
                )}
              </>
            ) : (
              <EmptyState icon={History} message="읽은 논문이 없어요" />
            )}
          </TabsContent>
        </Tabs>
      </div>
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
