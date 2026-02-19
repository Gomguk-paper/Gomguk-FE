import { useNavigate } from "react-router-dom";
import { BookOpen, Lock } from "lucide-react";
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
import { cn } from "@/lib/utils";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Restore scroll position when navigating back to this page
  useScrollRestoration('home');

  // 1. Data Fetching Layer (훅은 항상 동일 순서로 호출)
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
  } = usePaperFeedQuery({ enabled: !!user });

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
  }, [user, papersError, papersErrorDetails, refetchPapers]);

  // 2. Domain / Business Logic
  const { sortedPapers } = useRecommendedPapers({
    pages: papersData?.pages,
    tagMap,
  });

  // 3. UI State
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
            {/* Login Required State (Priority over loading/error if !user) */}
            {!user ? (
              <div className="relative">
                {/* Background Skeletons (Blurred) */}
                <div className="filter blur-sm select-none pointer-events-none opacity-50 space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PaperCardSkeleton key={i} />
                  ))}
                </div>

                {/* Login Overlay */}
                <div className="absolute inset-0 z-10 p-4 text-center">
                  <div className="sticky top-[30vh] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 shadow-sm backdrop-blur-sm">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 bg-background/50 backdrop-blur-md px-4 py-1 rounded-full">로그인이 필요합니다</h3>
                    <p className="text-sm text-muted-foreground mb-4 bg-background/50 backdrop-blur-md px-4 py-1 rounded-full">
                      맞춤 논문 피드를 보려면 로그인을 해야합니다
                    </p>
                    <button
                      onClick={() => setLoginModalOpen(true)}
                      className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      로그인하기
                    </button>
                  </div>
                </div>
              </div>
            ) : papersLoading ? (
              // Loading state - show skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <PaperCardSkeleton key={i} />
              ))
            ) : papersError ? (
              // Error state - 401이면 로그인 유도, 그 외는 다시 시도
              (() => {
                const is401 = isAxiosError(papersErrorDetails) && papersErrorDetails.response?.status === 401;
                // If is401 is true, we technically shouldn't be here if !user check works, or token expired while user object exists.
                // Keeping logic safe.
                return (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", is401 ? "bg-primary/10" : "bg-destructive/10")}>
                      {is401 ? <Lock className="w-8 h-8 text-primary" /> : <BookOpen className="w-8 h-8 text-destructive" />}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {is401 ? "로그인이 필요합니다" : "오류가 발생했습니다"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {is401
                        ? "세션이 만료되었습니다. 다시 로그인해주세요."
                        : papersErrorDetails instanceof Error
                          ? papersErrorDetails.message
                          : "서버에 연결할 수 없습니다"}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => is401 ? setLoginModalOpen(true) : refetchPapers()}
                        className={cn("px-4 py-2 rounded-md transition-colors",
                          is401 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-input bg-background hover:bg-accent hover:text-accent-foreground")}
                      >
                        {is401 ? "로그인하기" : "다시 시도"}
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

