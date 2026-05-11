import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { BottomNav } from "@/components/BottomNav";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import SearchPage from "./pages/Search";
import MyPage from "./pages/MyPage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import CookiePolicy from "./pages/legal/CookiePolicy";
import Accessibility from "./pages/legal/Accessibility";
import AdvertisingInfo from "./pages/legal/AdvertisingInfo";
import { getStoredPrefs, getStoredUser, setStoredUser, clearStoredUser } from "@/lib/authStorage";
import { ROUTES } from "@/core/config/constants";
import { meApi } from "@/api/me";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const queryClient = new QueryClient();

/** URL에서 access_token 추출 (쿼리 또는 해시) */
function getAccessTokenFromLocation(search: string, hash: string): string | null {
  const fromSearch = new URLSearchParams(search).get("access_token");
  if (fromSearch) return fromSearch;
  const fromHash = new URLSearchParams(hash.replace(/^#/, "")).get("access_token");
  return fromHash || null;
}

/** URL에서 is_new_user 추출 */
function getIsNewUserFromLocation(search: string, hash: string): string | null {
  const fromSearch = new URLSearchParams(search).get("is_new_user");
  if (fromSearch !== null) return fromSearch;
  return new URLSearchParams(hash.replace(/^#/, "")).get("is_new_user");
}

function AppRoutes() {
  const { user, prefs, setUser, setPrefs } = useStore();
  const [hydrated, setHydrated] = useState(false);
  const [oauthProcessing, setOauthProcessing] = useState(false);
  const oauthProcessedRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedUser = getStoredUser();
    const storedPrefs = getStoredPrefs();

    // 기존 게스트 사용자 자동 로그아웃
    if ((storedUser?.provider as string) === "guest") {
      clearStoredUser();
    } else if (!user && storedUser) {
      setUser(storedUser);
    }

    if (!prefs && storedPrefs) {
      setPrefs(storedPrefs);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 마운트 시에만 실행

  // [전역] 세션 만료 처리 — 어느 페이지에 있든 user를 초기화하고 쿼리 캐시를 비워
  // 이전에는 Home.tsx에만 로컬 핸들러가 있어 Search 등 다른 페이지에서 세션 만료 시
  // UI는 로그인 상태로 보이지만 API는 401을 반환하는 불일치가 발생했음
  useEffect(() => {
    const handleSessionExpired = () => {
      clearStoredUser();
      setUser(null);
      queryClient.invalidateQueries();
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [setUser, queryClient]);

  // 전역 OAuth 콜백: 모달/전체페이지 구분 없이 어느 경로로 돌아와도 access_token 처리 (무한 모달 방지)
  useEffect(() => {
    if (!hydrated || oauthProcessedRef.current) return;

    const accessToken = getAccessTokenFromLocation(location.search, location.hash);
    if (!accessToken) return;

    oauthProcessedRef.current = true;
    setOauthProcessing(true);
    localStorage.setItem("access_token", accessToken);

    meApi
      .getMe()
      .then((userData) => {
        const newUser = {
          id: userData.id.toString(),
          name: userData.name,
          provider: userData.provider as "google" | "github" | "kakao",
          createdAt: new Date().toISOString(),
        };
        setStoredUser(newUser);
        setUser(newUser);

        const isNewUser = getIsNewUserFromLocation(location.search, location.hash);
        const storedPrefs = getStoredPrefs();
        // 기존 사용자(is_new_user=false)는 prefs가 로컬에 없어도 온보딩으로 보내지 않음 (다른 기기/localStorage 삭제 대응)
        if (isNewUser === "false") {
          navigate(ROUTES.HOME, { replace: true });
        } else if (isNewUser === "true" || !storedPrefs) {
          navigate(ROUTES.ONBOARDING, { replace: true });
        } else {
          navigate(ROUTES.HOME, { replace: true });
        }
      })
      .catch((err) => {
        console.error("OAuth callback: getMe failed", err);
        oauthProcessedRef.current = false;
      })
      .finally(() => {
        setOauthProcessing(false);
      });
  }, [hydrated, location.search, location.hash, navigate, setUser]);

  // 비로그인에서도 /search는 바로 보이도록, 로딩 시에도 검색 라우트는 렌더
  const isSearchPage = location.pathname === "/search";
  if (!hydrated && !isSearchPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (oauthProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  const hasPrefs = Boolean(prefs);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to={hasPrefs ? "/" : "/onboarding"} replace /> : <Login />}
        />
        <Route
          path="/onboarding"
          element={user ? <Onboarding /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/settings"
          element={<Settings loginRequired={!user} />}
        />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/advertising" element={<AdvertisingInfo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

import { DesktopSidebar } from "@/components/DesktopSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { useTheme } from "@/hooks/useTheme";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TrendingTagsProvider } from "@/contexts/TrendingTagsContext";

const AppLayout = () => {
  const { prefs } = useStore();
  const layoutMode = prefs?.layoutMode || "auto";

  // Apply theme using the hook
  useTheme();

  // Determine visibility classes based on layout mode
  // Auto: default responsive behavior
  // Mobile: Force mobile view (hide sidebars, show bottom nav, max-w-480px)
  // Desktop: Force desktop view (show sidebars, hide bottom nav)

  const isMobileMode = layoutMode === "mobile";
  const isDesktopMode = layoutMode === "desktop";

  return (
    <div className="flex min-h-screen justify-center bg-background">
      {/* Left Sidebar */}
      {!isMobileMode && (
        <ErrorBoundary>
          <DesktopSidebar />
        </ErrorBoundary>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 w-full relative border-x min-h-screen transition-all
          ${isMobileMode ? "max-w-[480px] border-x-0" : "max-w-[672px] lg:max-w-4xl"}
        `}
      >
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>

        {/* Bottom Nav: Visible on mobile OR if Mobile Mode is forced */}
        {/* If isMobileMode is true, we render BottomNav without md:hidden */}
        {/* If auto, we keep md:hidden. If desktop, we hide it completely */}
        {(!isDesktopMode) && (
          <div className={isMobileMode ? "block" : "md:hidden"}>
            <ErrorBoundary>
              <BottomNav />
            </ErrorBoundary>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      {!isMobileMode && (
        <ErrorBoundary>
          <RightSidebar />
        </ErrorBoundary>
      )}

      {/* Mobile Sidebar (Global) */}
      <ErrorBoundary>
        <MobileSidebar />
      </ErrorBoundary>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TrendingTagsProvider>
          <ErrorBoundary>
            <AppLayout />
          </ErrorBoundary>
        </TrendingTagsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
