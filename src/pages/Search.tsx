import { useEffect, useState } from "react";
import { SummaryCarousel } from "@/components/SummaryCarousel";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { usePaperSearch } from "@/hooks/usePaperSearch";
import { useStore } from "@/store/useStore";
import { SearchHeader } from "@/pages/search/components/SearchHeader";
import { SearchRecommendations } from "@/pages/search/components/SearchRecommendations";
import { SearchResults } from "@/pages/search/components/SearchResults";
import { LoginModal } from "@/components/LoginModal";
import { isAxiosError } from "axios";

export default function SearchPage() {
  const { user } = useStore();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const {
    query,
    setQuery,
    selectedTags,
    handleTagClick,
    sortMode,
    setSortMode,
    papersLoading,
    carouselPapers,
    openCarousel,
    carouselOpen,
    setCarouselOpen,
    selectedPaperIndex,
    history,
    handleSearch,
    removeHistory,
    trendingTags,
    isTrendingTag,
    allTags,
    totalCount,
    loadMoreRef,
    isFetchingNextPage,
    isError,
    error,
  } = usePaperSearch();

  // 비로그인이거나 401 응답인 경우 인증 에러로 처리
  const isAuthError =
    !user ||
    (isError && isAxiosError(error) && error.response?.status === 401);

  // Always scroll to top for search page (disable restoration)
  useScrollRestoration('search', false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 세션 만료 시 로그인 모달 열기
  useEffect(() => {
    const handler = () => setLoginModalOpen(true);
    window.addEventListener("auth:session-expired", handler);
    return () => window.removeEventListener("auth:session-expired", handler);
  }, []);

  return (
    <main className="min-h-screen mobile-content-padding bg-background">
      {/* Mobile Header - Hidden on Desktop */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b mobile-safe-area-pt md:hidden">
        <div className="p-4 max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr">
          <SearchHeader
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            sortMode={sortMode}
            setSortMode={setSortMode}
            selectedTags={selectedTags}
            handleTagClick={handleTagClick}
            allTags={allTags}
            isTrendingTag={isTrendingTag}
            showMenuTrigger={true}
          />
        </div>
      </header>

      <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr">
        {/* Desktop Header Area - Hidden on Mobile */}
        <div className="hidden md:block p-4">
          <h1 className="text-2xl font-bold mb-4 font-display px-4">분야별 논문 검색</h1>
          <SearchHeader
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            sortMode={sortMode}
            setSortMode={setSortMode}
            selectedTags={selectedTags}
            handleTagClick={handleTagClick}
            allTags={allTags}
            isTrendingTag={isTrendingTag}
          />
        </div>

        {/* Search History & Popular Tags */}
        {!query && (
          <SearchRecommendations
            history={history}
            handleSearch={handleSearch}
            removeHistory={removeHistory}
            trendingTags={trendingTags}
            isTrendingTag={isTrendingTag}
            selectedTags={selectedTags}
            handleTagClick={handleTagClick}
            setQuery={setQuery}
          />
        )}

        {/* Results */}
        <SearchResults
          isLoading={papersLoading}
          filteredCount={totalCount}
          papers={carouselPapers}
          onOpenSummary={openCarousel}
          title={query || selectedTags.length > 0 ? "검색 결과" : "전체 논문"}
          loadMoreRef={loadMoreRef}
          isFetchingNextPage={isFetchingNextPage}
          isAuthError={isAuthError}
          onLoginClick={() => setLoginModalOpen(true)}
        />
      </div>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} showNotice={true} />

      {/* Summary Carousel */}
      <SummaryCarousel
        papers={carouselPapers}
        initialIndex={selectedPaperIndex}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
      />
    </main>
  );
}
