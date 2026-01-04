import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Heart, Bookmark, History, ChevronRight } from "lucide-react";
import { papers } from "@/data/papers";
import { useStore } from "@/store/useStore";
import { PaperCard } from "@/components/PaperCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clearStoredUser } from "@/lib/authStorage";

export default function MyPage() {
  const navigate = useNavigate();
  const { user, actionsByUser, prefs, setUser } = useStore();
  const isGuest = user?.provider === "guest";
  const userKey = user && !isGuest ? user.provider : null;
  const actions = userKey ? actionsByUser[userKey] ?? [] : [];

  const likedPapers = useMemo(() => {
    const likedIds = actions.filter(a => a.liked).map(a => a.paperId);
    return papers.filter(p => likedIds.includes(p.id));
  }, [actions]);

  const savedPapers = useMemo(() => {
    const savedIds = actions.filter(a => a.saved).map(a => a.paperId);
    return papers.filter(p => savedIds.includes(p.id));
  }, [actions]);

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
              <h2 className="font-semibold">{user?.name || "게스트"}</h2>
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
            {isGuest ? (
              <EmptyState icon={Bookmark} message="게스트 입니다 로그인하세요" />
            ) : savedPapers.length > 0 ? (
              savedPapers.map(paper => (
                <PaperCard key={paper.id} paper={paper} />
              ))
            ) : (
              <EmptyState icon={Bookmark} message="저장한 논문이 없어요" />
            )}
          </TabsContent>
          
          <TabsContent value="liked" className="mt-4 space-y-4">
            {isGuest ? (
              <EmptyState icon={Heart} message="게스트 입니다 로그인하세요" />
            ) : likedPapers.length > 0 ? (
              likedPapers.map(paper => (
                <PaperCard key={paper.id} paper={paper} />
              ))
            ) : (
              <EmptyState icon={Heart} message="좋아요한 논문이 없어요" />
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-4 space-y-4">
            {isGuest ? (
              <EmptyState icon={History} message="게스트 입니다 로그인하세요" />
            ) : readPapers.length > 0 ? (
              readPapers.map(paper => (
                <PaperCard key={paper.id} paper={paper} />
              ))
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
