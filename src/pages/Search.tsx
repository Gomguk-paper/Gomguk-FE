import { useEffect } from "react";
import { SummaryCarousel } from "@/components/SummaryCarousel";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { usePaperSearch } from "@/hooks/usePaperSearch";
import { SearchHeader } from "@/pages/search/components/SearchHeader";
import { SearchRecommendations } from "@/pages/search/components/SearchRecommendations";
import { SearchResults } from "@/pages/search/components/SearchResults";

export default function SearchPage() {
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
  } = usePaperSearch();

  // Always scroll to top for search page (disable restoration)
  useScrollRestoration('search', false);
  useEffect(() => {
    window.scrollTo(0, 0);
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
            showMenuTrigger={true}
          />
        </div>
      </header>

      <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr">
        {/* Desktop Header Area - Hidden on Mobile */}
        <div className="hidden md:block p-4">
          <h1 className="text-2xl font-bold mb-4 font-display px-4">검색 및 탐색</h1>
          <SearchHeader
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            sortMode={sortMode}
            setSortMode={setSortMode}
            selectedTags={selectedTags}
            handleTagClick={handleTagClick}
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
          />
        )}

        {/* Results */}
        <SearchResults
          isLoading={papersLoading}
          filteredCount={carouselPapers.length}
          papers={carouselPapers}
          onOpenSummary={openCarousel}
          title={query || selectedTags.length > 0 ? "검색 결과" : "전체 논문"}
        />
      </div>

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
