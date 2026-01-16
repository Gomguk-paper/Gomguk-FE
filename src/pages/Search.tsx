import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { papers, allTags } from "@/data/papers";
import { PaperCard } from "@/components/PaperCard";
import { TagChip } from "@/components/TagChip";
import { SummaryCarousel } from "@/components/SummaryCarousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortMode = "trending" | "recent" | "personalized";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get("tag") || "";
  
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [sortMode, setSortMode] = useState<SortMode>("trending");
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);

  const filteredPapers = useMemo(() => {
    let result = [...papers];
    
    // Filter by search query
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    
    // Filter by selected tag
    if (selectedTag) {
      result = result.filter(p => 
        p.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortMode) {
        case "recent":
          return b.metrics.recencyScore - a.metrics.recencyScore;
        case "personalized":
          return (b.metrics.trendingScore + b.metrics.recencyScore) - 
                 (a.metrics.trendingScore + a.metrics.recencyScore);
        case "trending":
        default:
          return b.metrics.trendingScore - a.metrics.trendingScore;
      }
    });
    
    return result;
  }, [query, selectedTag, sortMode]);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag("");
      setSearchParams({});
    } else {
      setSelectedTag(tag);
      setSearchParams({ tag });
    }
  };

  const openCarousel = (index: number) => {
    setSelectedPaperIndex(index);
    setCarouselOpen(true);
  };

  // Trending tags (mock: top 5 by frequency)
  const trendingTags = allTags.slice(0, 8);

  return (
    <main className="min-h-screen mobile-content-padding bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b mobile-safe-area-pt">
        <div className="p-4 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="논문 제목, 키워드로 검색..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
            
            {selectedTag && (
              <TagChip 
                tag={selectedTag} 
                selected 
                onClick={() => handleTagClick(selectedTag)}
              />
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[480px] mx-auto mobile-safe-area-pl mobile-safe-area-pr">
        {/* Popular Tags */}
        {!query && !selectedTag && (
          <section className="p-4">
            <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3">
              인기 태그
            </h2>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(tag => (
                <TagChip
                  key={tag}
                  tag={tag}
                  selected={selectedTag === tag}
                  onClick={() => handleTagClick(tag)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        <section className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm text-muted-foreground">
              {query || selectedTag ? "검색 결과" : "전체 논문"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {filteredPapers.length}개
            </span>
          </div>
          
          {filteredPapers.length > 0 ? (
            <div className="space-y-4">
              {filteredPapers.map((paper, index) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onOpenSummary={() => openCarousel(index)}
                />
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
        papers={filteredPapers}
        initialIndex={selectedPaperIndex}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
      />
    </main>
  );
}
