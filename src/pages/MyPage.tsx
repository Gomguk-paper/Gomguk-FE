import { useState, useEffect } from "react";
import {
  Heart,
  Bookmark,
  History,
  BarChart3,
} from "lucide-react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { LoginModal } from "@/components/LoginModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HamburgerMenu } from "@/components/HamburgerMenu";

// Hooks
import { useMyPageData } from "@/pages/mypage/hooks/useMyPageData";
import { usePaperStats } from "@/pages/mypage/hooks/usePaperStats";

// Components
import { MyPageHeader } from "@/pages/mypage/components/MyPageHeader";
import { SavedPapersTab } from "@/pages/mypage/components/SavedPapersTab";
import { LikedPapersTab } from "@/pages/mypage/components/LikedPapersTab";
import { HistoryTab } from "@/pages/mypage/components/HistoryTab";
import { StatsTab } from "@/pages/mypage/components/StatsTab";

import { SummaryCarousel } from "@/components/SummaryCarousel";

export default function MyPage() {
  // 1. Data Fetching & Business Logic (Separated via Hooks)
  const {
    user,
    prefs,
    likedPapers,
    savedPapers,
    readPapers,
    readPapersWithDate, // Now returned from hook
    papersLoading,
    allPapers, // We might need to expose this from the hook or derive it
  } = useMyPageData();

  const { weeklyStats, tagDistribution } = usePaperStats(readPapersWithDate);

  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Carousel State
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);
  const [currentCarouselPapers, setCurrentCarouselPapers] = useState<any[]>([]);

  // 2. Side Effects
  useScrollRestoration('mypage');

  useEffect(() => {
    if (!user) {
      setLoginModalOpen(true);
    }
  }, [user]);

  // Handler for opening summary
  const handleOpenSummary = (paper: any, papersList: any[]) => {
    setCurrentCarouselPapers(papersList);
    const idx = papersList.findIndex(p => p.id === paper.id);
    if (idx !== -1) {
      setSelectedPaperIndex(idx);
      setCarouselOpen(true);
    }
  };

  // 3. UI Rendering
  const renderMyPageHeader = () => (
    <MyPageHeader
      user={user}
      prefs={prefs}
      likedCount={likedPapers.length}
      savedCount={savedPapers.length}
      readCount={readPapers.length}
    />
  );

  return (
    <main className="min-h-screen mobile-content-padding bg-background">
      {/* Mobile Header */}
      <header className="bg-card border-b mobile-safe-area-pt md:hidden">
        <div className="p-4 max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr flex items-start gap-1">
          <HamburgerMenu className="ml-2 mt-4" />
          <div className="flex-1">
            {renderMyPageHeader()}
          </div>
        </div>
      </header>

      <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr">
        {/* Desktop Header */}
        <div className="hidden md:block p-4">{renderMyPageHeader()}</div>

        {/* Tabs */}
        <Tabs defaultValue="saved" className="p-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="saved" className="gap-1.5">
              <Bookmark className="w-4 h-4 max-[400px]:hidden shrink-0" />
              저장
            </TabsTrigger>
            <TabsTrigger value="liked" className="gap-1.5">
              <Heart className="w-4 h-4 max-[400px]:hidden shrink-0" />
              좋아요
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="w-4 h-4 max-[400px]:hidden shrink-0" />
              히스토리
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5">
              <BarChart3 className="w-4 h-4 max-[400px]:hidden shrink-0" />
              통계
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved">
            <SavedPapersTab
              papers={savedPapers}
              loading={papersLoading}
              onOpenSummary={(paper) => handleOpenSummary(paper, savedPapers)}
            />
          </TabsContent>

          <TabsContent value="liked">
            <LikedPapersTab
              papers={likedPapers}
              loading={papersLoading}
              onOpenSummary={(paper) => handleOpenSummary(paper, likedPapers)}
            />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab
              readPapersWithDate={readPapersWithDate}
              onOpenSummary={(paper) => {
                // Creating a list of papers from readPapersWithDate for the carousel
                const historyPapers = readPapersWithDate.map(item => item.paper);
                handleOpenSummary(paper, historyPapers);
              }}
            />
          </TabsContent>

          <TabsContent value="stats">
            <StatsTab
              readPapersCount={readPapers.length}
              weeklyStats={weeklyStats}
              tagDistribution={tagDistribution}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} showNotice={true} />

      {/* Summary Carousel */}
      <SummaryCarousel
        papers={currentCarouselPapers}
        initialIndex={selectedPaperIndex}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
      />
    </main>
  );
}
