import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { papersApi } from "@/api";
import { useStore } from "@/store/useStore";
import { PaperCard } from "@/components/PaperCard";
import { SummaryCarousel } from "@/components/SummaryCarousel";
import { NotificationList } from "@/components/NotificationList";
import { LoginModal } from "@/components/LoginModal";
import { clearStoredUser } from "@/lib/authStorage";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PaperCardSkeleton } from "@/components/PaperCardSkeleton";
import type { PaperOut } from "@/lib/apiTypes";

// Helper function to convert backend PaperOut to frontend Paper format
const convertPaperOutToPaper = (paperOut: PaperOut): any => {
  let imageUrl = paperOut.image_url;
  // Filter out s3:// URLs as they cause browser errors
  if (imageUrl && imageUrl.startsWith('s3://')) {
    imageUrl = undefined;
  }

  return {
    id: String(paperOut.id),
    title: paperOut.title,
    authors: paperOut.authors || [],
    year: paperOut.year,
    venue: "", // Not provided by backend
    tags: paperOut.tags?.map(String) || [], // Convert number[] to string[]
    abstract: paperOut.short,
    pdfUrl: paperOut.raw_url,
    imageUrl: imageUrl,
    metrics: {
      trendingScore: 0, // Not provided by backend
      recencyScore: paperOut.year >= new Date().getFullYear() - 1 ? 10 : 5,
      citations: 0, // Not provided by backend
    },
  };
};

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

  // Fetch papers from API (updated to match backend spec)
  const {
    data: papersResponse,
    isLoading: papersLoading,
    isError: papersError,
    error: papersErrorDetails,
    refetch: refetchPapers
  } = useQuery({
    queryKey: ['papers'],
    queryFn: () => papersApi.getPapers({ limit: 100, offset: 0 }),
    retry: 1,
  });

  // Extract and convert papers from the response
  const papers = useMemo(() => {
    if (!papersResponse?.items) {
      console.log('[Home] No papers response or items:', papersResponse);
      return [];
    }
    const converted = papersResponse.items.map(item => convertPaperOutToPaper(item.paper));
    console.log('[Home] Converted papers:', converted.length, 'papers');
    return converted;
  }, [papersResponse]);



  // Sort papers by personalized score
  const sortedPapers = useMemo(() => {
    // Defensive check: ensure papers have metrics
    const validPapers = Array.isArray(papers)
      ? papers.filter(p => p && p.metrics && !String(p.id).startsWith('p')) // Filter out mock papers (ID starts with 'p')
      : [];

    return [...validPapers].sort((a, b) => {
      const scoreA = (a.metrics?.trendingScore || 0) + (a.metrics?.recencyScore || 0);
      const scoreB = (b.metrics?.trendingScore || 0) + (b.metrics?.recencyScore || 0);

      let weightedScoreA = scoreA;
      let weightedScoreB = scoreB;

      if (prefs?.tags) {
        prefs.tags.forEach(({ name, weight }) => {
          if (a.tags?.some((t) => t.toLowerCase() === name.toLowerCase())) {
            weightedScoreA += weight * 10;
          }
          if (b.tags?.some((t) => t.toLowerCase() === name.toLowerCase())) {
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
          paper.tags?.some((tag) => tag.toLowerCase() === prefTag.name.toLowerCase())
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


        {/* Paper Feed */}
        <section className="p-4">
          <h2 className="font-display font-semibold text-lg mb-3">📚 맞춤 논문 피드</h2>
          <div className="space-y-4">
            {papersLoading ? (
              // Loading state - show skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <PaperCardSkeleton key={i} />
              ))
            ) : papersError ? (
              // Error state - show error message with retry button
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">논문을 불러올 수 없습니다</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {papersErrorDetails instanceof Error ? papersErrorDetails.message : '서버에 연결할 수 없습니다'}
                </p>
                <button
                  onClick={() => refetchPapers()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : displayedPapers.length > 0 ? (
              // Success state - show papers
              displayedPapers.map((paper, index) => (
                <PaperCard key={paper.id} paper={paper} onOpenSummary={() => openCarousel(index)} />
              ))
            ) : (
              // Empty state - no papers available
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">논문이 없습니다</h3>
                <p className="text-sm text-muted-foreground">
                  아직 추천할 논문이 없습니다. 조금만 기다려주세요!
                </p>
              </div>
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
