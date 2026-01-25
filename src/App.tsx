import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import AuthorPage from "./pages/AuthorPage";
import { getStoredPrefs, getStoredUser, clearStoredUser } from "@/lib/authStorage";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, prefs, setUser, setPrefs } = useStore();
  const [hydrated, setHydrated] = useState(false);

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

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold">로딩 중...</div>
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
          element={
            user ? (
              <Settings />
            ) : (
              <Navigate to="/login" replace state={{ reason: "auth", from: "/settings" }} />
            )
          }
        />
        <Route path="/author/:authorId" element={<AuthorPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

import { DesktopSidebar } from "@/components/DesktopSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useTheme } from "@/hooks/useTheme";

import { ErrorBoundary } from "@/components/ErrorBoundary";

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
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <AppLayout />
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
