import { useState, useEffect, useMemo } from "react";
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
import { useStore } from "@/store/useStore";

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
    allPapers,
    likedPapers,
    savedPapers,
    readPapers,
    papersLoading,
  } = useMyPageData();

  const { actionsByUser } = useStore();
  const userActions = user ? (actionsByUser[user.id] || []) : [];

  // Compute real-time counts by factoring in local optimistic updates
  const realtimeLikedCount = (() => {
    let count = likedPapers.length;
    const baseIds = new Set(likedPapers.map(p => p.id));
    userActions.forEach((action: any) => {
      if (action.liked && !baseIds.has(action.paperId)) {
        count++; // Locally liked but not yet in backend list
      } else if (action.liked === false && baseIds.has(action.paperId)) {
        count--; // Locally unliked but still in backend list
      }
    });
    return Math.max(0, count);
  })();

  const realtimeSavedCount = (() => {
    let count = savedPapers.length;
    const baseIds = new Set(savedPapers.map(p => p.id));
    userActions.forEach((action: any) => {
      if (action.saved && !baseIds.has(action.paperId)) {
        count++;
      } else if (action.saved === false && baseIds.has(action.paperId)) {
        count--;
      }
    });
    return Math.max(0, count);
  })();

  const realtimeLikedPapers = useMemo(() => {
    const filtered = likedPapers.filter(paper => {
      const action = userActions.find((a: any) => a.paperId === paper.id);
      if (action && action.liked === false) return false;
      return true;
    });

    const baseIds = new Set(likedPapers.map(p => p.id));
    const newlyLiked = userActions
      .filter((a: any) => a.liked === true && !baseIds.has(a.paperId))
      .map((a: any) => allPapers.find(p => p.id === a.paperId))
      .filter(Boolean);

    return [...newlyLiked, ...filtered];
  }, [likedPapers, userActions, allPapers]);

  const realtimeSavedPapers = useMemo(() => {
    const filtered = savedPapers.filter(paper => {
      const action = userActions.find((a: any) => a.paperId === paper.id);
      if (action && action.saved === false) return false;
      return true;
    });

    const baseIds = new Set(savedPapers.map(p => p.id));
    const newlySaved = userActions
      .filter((a: any) => a.saved === true && !baseIds.has(a.paperId))
      .map((a: any) => allPapers.find(p => p.id === a.paperId))
      .filter(Boolean);

    return [...newlySaved, ...filtered];
  }, [savedPapers, userActions, allPapers]);

  const { tagDistribution, hourlyDistribution, dailyDistribution } = usePaperStats(readPapers);

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
      likedCount={realtimeLikedCount}
      savedCount={realtimeSavedCount}
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
              papers={realtimeSavedPapers}
              loading={papersLoading}
              onOpenSummary={(paper) => handleOpenSummary(paper, realtimeSavedPapers)}
            />
          </TabsContent>

          <TabsContent value="liked">
            <LikedPapersTab
              papers={realtimeLikedPapers}
              loading={papersLoading}
              onOpenSummary={(paper) => handleOpenSummary(paper, realtimeLikedPapers)}
            />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab
              readPapers={readPapers}
              onOpenSummary={(paper) => handleOpenSummary(paper, readPapers)}
            />
          </TabsContent>

          <TabsContent value="stats">
            <StatsTab
              readPapersCount={readPapers.length}
              tagDistribution={tagDistribution}
              hourlyDistribution={hourlyDistribution}
              dailyDistribution={dailyDistribution}
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
