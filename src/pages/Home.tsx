import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BookOpen } from "lucide-react";
import { papers, reports, summaries } from "@/data/papers";
import { useStore } from "@/store/useStore";
import { PaperCard } from "@/components/PaperCard";
import { ReportCard } from "@/components/ReportCard";
import { SummaryCarousel } from "@/components/SummaryCarousel";
import { NotificationList } from "@/components/NotificationList";
import { LoginModal } from "@/components/LoginModal";
import { clearStoredUser } from "@/lib/authStorage";
import { UI_CONSTANTS } from "@/core/config/constants";

export default function Home() {
  const navigate = useNavigate();
  const { prefs, user, setUser, addNotification, getNotifications } = useStore();
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

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

  // Get featured papers for carousel
  const featuredPapers = sortedPapers.slice(0, UI_CONSTANTS.PAPER.FEATURED_COUNT);

  const openCarousel = (index: number) => {
    setSelectedPaperIndex(index);
    setCarouselOpen(true);
  };

  const openCarouselByPaperId = (paperId: string) => {
    const index = sortedPapers.findIndex(p => p.id === paperId);
    if (index !== -1) {
      openCarousel(index);
    }
  };

  // 알림 생성 로직 (새로운 추천 논문, 관심 태그 매칭)
  useEffect(() => {
    if (!user || !prefs) return;

    const existingNotifications = getNotifications();
    const existingPaperIds = new Set(existingNotifications.map(n => n.paperId));

    // 관심 태그와 매칭되는 논문에 대한 알림 생성
    if (prefs.tags && prefs.tags.length > 0) {
      sortedPapers.slice(0, UI_CONSTANTS.PAPER.FEATURED_COUNT).forEach((paper) => {
        // 이미 알림이 있으면 스킵
        if (existingPaperIds.has(paper.id)) return;

        // 관심 태그와 매칭되는지 확인
        const hasMatchingTag = prefs.tags!.some(prefTag =>
          paper.tags.some(tag => tag.toLowerCase() === prefTag.name.toLowerCase())
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
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b mobile-safe-area-pt">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
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
            {!user && (
              <button
                data-login-trigger
                onClick={() => setLoginModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold rounded-full border border-input bg-background hover:bg-secondary transition-colors"
              >
                로그인
              </button>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-xs font-semibold rounded-full border border-input bg-background hover:bg-secondary transition-colors"
              >
                로그아웃
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[480px] mx-auto mobile-safe-area-pl mobile-safe-area-pr">
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

      {/* Login Modal */}
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
      />
    </main>
  );
}
