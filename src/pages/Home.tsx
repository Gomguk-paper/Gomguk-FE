import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, BookOpen } from "lucide-react";
import { papers, reports, summaries } from "@/data/papers";
import { useStore } from "@/store/useStore";
import { PaperCard } from "@/components/PaperCard";
import { ReportCard } from "@/components/ReportCard";
import { SummaryCarousel } from "@/components/SummaryCarousel";
import { TagChip } from "@/components/TagChip";

export default function Home() {
  const navigate = useNavigate();
  const { prefs } = useStore();
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);

  // Sort papers by personalized score
  const sortedPapers = useMemo(() => {
    return [...papers].sort((a, b) => {
      let scoreA = a.metrics.trendingScore + a.metrics.recencyScore;
      let scoreB = b.metrics.trendingScore + b.metrics.recencyScore;
      
      if (prefs?.tags) {
        prefs.tags.forEach(({ name, weight }) => {
          if (a.tags.some(t => t.toLowerCase() === name.toLowerCase())) {
            scoreA += weight * 10;
          }
          if (b.tags.some(t => t.toLowerCase() === name.toLowerCase())) {
            scoreB += weight * 10;
          }
        });
      }
      
      return scoreB - scoreA;
    });
  }, [prefs]);

  // Get featured papers for carousel (top 5)
  const featuredPapers = sortedPapers.slice(0, 5);

  const openCarousel = (index: number) => {
    setSelectedPaperIndex(index);
    setCarouselOpen(true);
  };

  return (
    <main className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">곰국</span>
          </div>
          
          <button 
            onClick={() => navigate("/search")}
            className="flex-1 flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-muted-foreground text-sm"
          >
            <Search className="w-4 h-4" />
            논문 검색...
          </button>
          
          <button className="p-2 text-muted-foreground">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        {/* Today's Card News Section */}
        <section className="p-4">
          <h2 className="font-display font-semibold text-lg mb-3">📰 오늘의 카드뉴스</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {featuredPapers.map((paper, index) => {
              const summary = summaries.find(s => s.paperId === paper.id);
              return (
                <button
                  key={paper.id}
                  onClick={() => openCarousel(index)}
                  className="flex-shrink-0 w-64 p-4 bg-card rounded-xl border shadow-card text-left hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-1.5 mb-2">
                    {paper.tags.slice(0, 2).map(tag => (
                      <TagChip key={tag} tag={tag} size="sm" />
                    ))}
                  </div>
                  <h3 className="font-medium text-sm line-clamp-2 mb-2">
                    {paper.title}
                  </h3>
                  {summary && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      💡 {summary.hookOneLiner}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Tech Reports Section */}
        <section className="p-4">
          <h2 className="font-display font-semibold text-lg mb-3">🔥 기술 리포트</h2>
          <div className="space-y-3">
            {reports.slice(0, 2).map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </section>

        {/* Paper Feed */}
        <section className="p-4">
          <h2 className="font-display font-semibold text-lg mb-3">📚 맞춤 논문 피드</h2>
          <div className="space-y-4">
            {sortedPapers.map((paper, index) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onOpenSummary={() => openCarousel(index)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Summary Carousel */}
      <SummaryCarousel
        papers={sortedPapers}
        initialIndex={selectedPaperIndex}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
      />
    </main>
  );
}
