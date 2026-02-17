import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useStore } from "@/store/useStore";
import { PaperCard } from "@/components/PaperCard";
import { SummaryCarousel } from "@/components/SummaryCarousel";
import { LoginModal } from "@/components/LoginModal";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { PaperCardSkeleton } from "@/components/PaperCardSkeleton";
import { HamburgerMenu } from "@/components/HamburgerMenu";

// Custom Hooks
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";
import { usePaperFeedQuery } from "@/hooks/queries/usePaperFeedQuery";
import { useRecommendedPapers } from "@/hooks/domain/useRecommendedPapers";
import { usePaperFeed } from "@/hooks/ui/usePaperFeed";
import { usePaperCarousel } from "@/hooks/ui/usePaperCarousel";
import { useState, useEffect } from "react";
import { isAxiosError } from "axios";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Restore scroll position when navigating back to this page
  useScrollRestoration('home');

  // 세션 만료 시( refresh 실패 ) 로그인 모달 열기
  useEffect(() => {
    const handler = () => setLoginModalOpen(true);
    window.addEventListener("auth:session-expired", handler);
    return () => window.removeEventListener("auth:session-expired", handler);
  }, []);

  // 401 후 재로그인 시 피드 다시 불러오기
  useEffect(() => {
    if (user && papersError && isAxiosError(papersErrorDetails) && papersErrorDetails.response?.status === 401) {
      refetchPapers();
    }
  }, [user]);

  // 1. Data Fetching Layer
  const { tagMap } = useTagsQuery();
  const {
    data: papersData,
    isLoading: papersLoading,
    isError: papersError,
    error: papersErrorDetails,
    refetch: refetchPapers,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePaperFeedQuery();

  // 2. Domain / Business Logic Layer
  const { sortedPapers } = useRecommendedPapers({
    pages: papersData?.pages,
    tagMap,
  });

  // 3. UI State Layer
  const { displayedPapers, loadMoreRef, hasMore, isFetchingNextPage: isFetching } = usePaperFeed({
    papers: sortedPapers,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });
  const {
    carouselOpen,
    selectedPaperIndex,
    openCarousel,
    openCarouselByPaperId,
    closeCarousel
  } = usePaperCarousel(sortedPapers);

  return (
    <main className="min-h-screen mobile-content-padding bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b mobile-safe-area-pt md:hidden">
        <div className="flex items-center justify-between gap-3 p-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <HamburgerMenu className="-ml-2 mr-1 md:hidden" />
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">곰국</span>
          </div>

          <div className="flex items-center gap-2">
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
              // Error state - 401이면 로그인 유도, 그 외는 다시 시도
              (() => {
                const is401 = isAxiosError(papersErrorDetails) && papersErrorDetails.response?.status === 401;
                return (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">논문을 불러올 수 없습니다</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {is401
                        ? "세션이 만료되었습니다. 다시 로그인해주세요."
                        : papersErrorDetails instanceof Error
                          ? papersErrorDetails.message
                          : "서버에 연결할 수 없습니다"}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {is401 && (
                        <button
                          onClick={() => setLoginModalOpen(true)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                          로그인하기
                        </button>
                      )}
                      <button
                        onClick={() => refetchPapers()}
                        className="px-4 py-2 border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        다시 시도
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : displayedPapers.length > 0 ? (
              // Success state - show papers
              displayedPapers.map((paper: any, index: number) => (
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
            {isFetching && (
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
        onClose={closeCarousel}
      />

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </main>
  );
}

