import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { papersApi, reportsApi } from "@/api";
import { useStore } from "@/store/useStore";
import { PaperCard } from "@/components/PaperCard";
import { ReportCard } from "@/components/ReportCard";
import { SummaryCarousel } from "@/components/SummaryCarousel";
import { NotificationList } from "@/components/NotificationList";
import { LoginModal } from "@/components/LoginModal";
import { clearStoredUser } from "@/lib/authStorage";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PaperCardSkeleton } from "@/components/PaperCardSkeleton";

export default function Home() {
  const navigate = useNavigate();
  const { prefs, user, setUser, addNotification, getNotifications } = useStore();
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Infinite scroll state
  const [displayCount, setDisplayCount] = useState(10);
  const PAPERS_PER_PAGE = 10;

  // Restore scroll position when navigating back to this page
  useScrollRestoration('home');

  // Fetch papers from API
  const { data: papers = [], isLoading: papersLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: () => papersApi.getPapers(),
  });

  // Fetch reports from API
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsApi.getReports({ limit: 2 }),
  });

  // Sort papers by personalized score
  const sortedPapers = useMemo(() => {
    // Defensive check: ensure papers have metrics
    const validPapers = Array.isArray(papers)
      ? papers.filter(p => p && p.metrics)
      : [];

    return [...validPapers].sort((a, b) => {
      const scoreA = (a.metrics?.trendingScore || 0) + (a.metrics?.recencyScore || 0);
      const scoreB = (b.metrics?.trendingScore || 0) + (b.metrics?.recencyScore || 0);

      let weightedScoreA = scoreA;
      let weightedScoreB = scoreB;

      if (prefs?.tags) {
        prefs.tags.forEach(({ name, weight }) => {
          if (a.tags.some((t) => t.toLowerCase() === name.toLowerCase())) {
            weightedScoreA += weight * 10;
          }
          if (b.tags.some((t) => t.toLowerCase() === name.toLowerCase())) {
            weightedScoreB += weight * 10;
          }
        });
      }

      return weightedScoreB - weightedScoreA;
    });
  }, [papers, prefs]);

  // Papers to display with infinite scroll
  const displayedPapers = useMemo(() => {
    return sortedPapers.slice(0, displayCount);
  }, [sortedPapers, displayCount]);

  const hasMore = displayCount < sortedPapers.length;

  // Load more papers
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + PAPERS_PER_PAGE, sortedPapers.length));
  };

  // Infinite scroll hook
  const loadMoreRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: papersLoading,
  });

  const openCarousel = (index: number) => {
    setSelectedPaperIndex(index);
    setCarouselOpen(true);
  };

  const openCarouselByPaperId = (paperId: string) => {
    const index = sortedPapers.findIndex((p) => p.id === paperId);
    if (index !== -1) {
      openCarousel(index);
    }
  };

  // 알림 생성 로직 (새로운 추천 논문, 관심 태그 매칭)
  useEffect(() => {
    if (!user || !prefs) return;

    const existingNotifications = getNotifications();
    const existingPaperIds = new Set(existingNotifications.map((n) => n.paperId));

    // 관심 태그와 매칭되는 논문에 대한 알림 생성
    if (prefs.tags && prefs.tags.length > 0) {
      sortedPapers.forEach((paper) => {
        // 이미 알림이 있으면 스킵
        if (existingPaperIds.has(paper.id)) return;

        // 관심 태그와 매칭되는지 확인
        const hasMatchingTag = prefs.tags!.some((prefTag) =>
          paper.tags.some((tag) => tag.toLowerCase() === prefTag.name.toLowerCase())
        );

        if (hasMatchingTag) {
          addNotification({
            type: "tag_match",
            paperId: paper.id,
            title: paper.title,
            message: `관심 태그와 매칭되는 새로운 논문이 추천되었습니다.`,
          });
          existingPaperIds.add(paper.id); // 중복 방지
        }
      });
    }

    // 새로운 추천 논문 알림 (상위 3개)
    sortedPapers.slice(0, 3).forEach((paper) => {
      if (existingPaperIds.has(paper.id)) return;

      addNotification({
        type: "new_recommendation",
        paperId: paper.id,
        title: paper.title,
        message: `오늘의 추천 논문입니다.`,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, prefs?.tags?.length]);

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
  };

  return (
    <main className="min-h-screen mobile-content-padding bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b mobile-safe-area-pt md:hidden">
        <div className="flex items-center justify-between gap-3 p-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">곰국</span>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <NotificationList onNotificationClick={openCarouselByPaperId} />
            ) : (
              <button className="p-2 text-muted-foreground opacity-50 cursor-not-allowed" disabled>
                <Bell className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr">
        {/* Tech Reports Section */}
        <section className="p-4">
          <h2 className="font-display font-semibold text-lg mb-3">🔥 기술 리포트</h2>
          <div className="space-y-3">
            {reports.slice(0, 2).map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </section>

        {/* Paper Feed */}
        <section className="p-4">
          <h2 className="font-display font-semibold text-lg mb-3">📚 맞춤 논문 피드</h2>
          <div className="space-y-4">
            {papersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <PaperCardSkeleton key={i} />
              ))
            ) : (
              displayedPapers.map((paper, index) => (
                <PaperCard key={paper.id} paper={paper} onOpenSummary={() => openCarousel(index)} />
              ))
            )}
          </div>

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-4">
            {hasMore && papersLoading && (
              <div className="text-sm text-muted-foreground">더 불러오는 중...</div>
            )}
          </div>
        </section>
      </div>

      {/* Summary Carousel */}
      <SummaryCarousel
        papers={sortedPapers} // Carousel needs access to all papers for navigation
        initialIndex={selectedPaperIndex}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
      />

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </main>
  );
}
