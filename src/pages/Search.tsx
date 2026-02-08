import { useState, useMemo, useCallback, useEffect } from "react";
import { Search as SearchIcon, X, SlidersHorizontal, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { type PaperOut } from "@/lib/apiTypes";
import { papersApi, tagsApi } from "@/api";
import { PaperCard } from "@/components/PaperCard";
import { TagChip } from "@/components/TagChip";
import { SummaryCarousel } from "@/components/SummaryCarousel";
import { PaperCardSkeleton } from "@/components/PaperCardSkeleton";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

type SortMode = "trending" | "recent" | "personalized";

// Helper to convert backend PaperOut to frontend Paper format
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
    venue: "", // Not provided by search API directly in same format sometimes? Check usage. 
    // In SearchPage code it used item.paper.source for venue. PaperOut has source?
    // Let's check apiTypes.
    // Wait, in previous SearchPage code: venue: item.paper.source.
    // In Home.tsx: venue: "".
    // Let's use string "source" if it exists, or empty string.
    // PaperOut interface usually has what's in apiTypes.
    // I'll assume item.paper has source locally if typescript allows, but better be safe.
    // Looking at previous code: venue: item.paper.source.
    // I'll access it as (paperOut as any).source to be safe or just standard mapping.
    tags: paperOut.tags?.map(String) || [],
    abstract: paperOut.short,
    pdfUrl: paperOut.raw_url,
    imageUrl: imageUrl,
    metrics: {
      trendingScore: 0,
      recencyScore: paperOut.year >= new Date().getFullYear() - 1 ? 10 : 5,
      citations: 0,
    },
  };
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTags = searchParams.getAll("tag");

  const [query, setQuery] = useState("");
  // Fetch papers and tags from API
  const { data: papersData, isLoading: papersLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: () => papersApi.getPapers(),
  });
  const papers = papersData?.items || [];

  const { data: tagsResponse, isLoading: tagsLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
  });
  const tagsData = tagsResponse?.items || [];

  const allTags = useMemo(() => tagsData.map(t => t.tag.name), [tagsData]);

  // Create a map from tag name to tag ID for filtering
  const tagNameToId = useMemo(() => {
    const map = new Map<string, number>();
    tagsData.forEach(item => {
      map.set(item.tag.name, item.tag.id);
    });
    return map;
  }, [tagsData]);

  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [sortMode, setSortMode] = useState<SortMode>("trending");
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);

  // Always scroll to top for search page (disable restoration)
  useScrollRestoration('search', false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync selectedTags with URL parameters
  useEffect(() => {
    const tagsFromUrl = searchParams.getAll("tag");
    const tagsStr = JSON.stringify(tagsFromUrl);
    const selectedStr = JSON.stringify(selectedTags);
    if (tagsStr !== selectedStr) {
      setSelectedTags(tagsFromUrl);
    }
  }, [searchParams]);

  const filteredPapers = useMemo(() => {
    let result = [...papers];

    // Filter by search query
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.paper.title.toLowerCase().includes(q) ||
          item.paper.short.toLowerCase().includes(q)
        // Note: Tags are IDs in paper object, matching by tag name might need mapping or backend filter
        // For now, we search in title/short.
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      // Convert selected tag names to IDs
      const selectedTagIds = selectedTags
        .map(tagName => tagNameToId.get(tagName))
        .filter((id): id is number => id !== undefined);

      // Filter papers that have at least one of the selected tags
      if (selectedTagIds.length > 0) {
        result = result.filter(item => {
          const paperTagIds = item.paper.tags || [];
          return selectedTagIds.some(selectedId => paperTagIds.includes(selectedId));
        });
      }
    }

    // Sort
    result.sort((a, b) => {
      // Mock metrics for sorting since they are removed from type
      const scoreA = (a.paper.year || 0) * 1000;
      const scoreB = (b.paper.year || 0) * 1000;

      switch (sortMode) {
        case "recent":
          return (b.paper.year || 0) - (a.paper.year || 0);
        case "personalized":
        case "trending":
        default:
          return scoreB - scoreA;
      }
    });

    return result;
  }, [papers, query, selectedTags, sortMode, tagNameToId]);

  const handleTagClick = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    if (newSelectedTags.length === 0) {
      setSearchParams({});
    } else {
      const params = new URLSearchParams();
      newSelectedTags.forEach(t => params.append("tag", t));
      setSearchParams(params);
    }
  };

  // Convert papers for display and carousel (memoized to prevent infinite loops)
  const carouselPapers = useMemo(() => {
    return filteredPapers.map(item => {
      const paper = convertPaperOutToPaper(item.paper);
      // Ensure venue is mapped from source if available
      if ((item.paper as any).source) {
        paper.venue = (item.paper as any).source;
      }
      return paper;
    });
  }, [filteredPapers]);

  const openCarousel = (index: number) => {
    setSelectedPaperIndex(index);
    setCarouselOpen(true);
  };

  // Trending tags (mock: top 5 by frequency)
  const trendingTags = allTags.slice(0, 8);

  // Search History
  const { history, addHistory, removeHistory } = useSearchHistory();

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    addHistory(term);
    setQuery(term);
    // Optional: if you want to clear tag when searching by text
    // setSelectedTag(""); 
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const renderSearchHeader = () => (
    <div className="space-y-3 px-4">
      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="논문 제목, 키워드로 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Sort & Filter */}
      <div className="flex items-center gap-2">
        <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
          <SelectTrigger className="w-32 h-9 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">🔥 트렌딩</SelectItem>
            <SelectItem value="recent">🕐 최신순</SelectItem>
            <SelectItem value="personalized">✨ 개인화</SelectItem>
          </SelectContent>
        </Select>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <TagChip key={tag} tag={tag} selected onClick={() => handleTagClick(tag)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen mobile-content-padding bg-background">
      {/* Mobile Header - Hidden on Desktop */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b mobile-safe-area-pt md:hidden">
        <div className="p-4 max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr">
          {renderSearchHeader()}
        </div>
      </header>

      <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr">
        {/* Desktop Header Area - Hidden on Mobile */}
        <div className="hidden md:block p-4">
          <h1 className="text-2xl font-bold mb-4 font-display px-4">검색 및 탐색</h1>
          {renderSearchHeader()}
        </div>

        {/* Search History & Popular Tags */}
        {!query && (
          <div className="space-y-6">
            {/* Search History */}
            {history.length > 0 && (
              <section className="p-4 pt-0">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-semibold text-sm text-muted-foreground">
                    최근 검색어
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      // Clear all history
                      history.forEach(term => removeHistory(term));
                    }}
                  >
                    전체 삭제
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((term) => (
                    <div
                      key={term}
                      className="group flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                      onClick={() => handleSearch(term)}
                    >
                      <History className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground">{term}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistory(term);
                        }}
                        className="ml-1 p-0.5 rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Tags */}
            <section className="p-4 pt-0">
              <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3">
                인기 태그
              </h2>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <TagChip
                    key={tag}
                    tag={tag}
                    selected={selectedTags.includes(tag)}
                    onClick={() => handleTagClick(tag)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Results */}
        <section className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm text-muted-foreground">
              {query || selectedTags.length > 0 ? "검색 결과" : "전체 논문"}
            </h2>
            <span className="text-xs text-muted-foreground">{papersLoading ? "..." : `${filteredPapers.length}개`}</span>
          </div>

          {papersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <PaperCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredPapers.length > 0 ? (
            <div className="space-y-4">
              {carouselPapers.map((paper, index) => (
                <PaperCard key={paper.id} paper={paper} onOpenSummary={() => openCarousel(index)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>검색 결과가 없습니다</p>
              <p className="text-sm mt-1">다른 키워드로 시도해보세요</p>
            </div>
          )}
        </section>
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
