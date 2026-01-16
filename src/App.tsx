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
    if (storedUser?.provider === "guest") {
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

import { DesktopSidebar } from "@/components/DesktopSidebar";
import { RightSidebar } from "@/components/RightSidebar";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen justify-center">
          <DesktopSidebar />
          <div className="flex-1 w-full max-w-[672px] relative border-x min-h-screen">
            <AppRoutes />
            <BottomNav />
          </div>
          <RightSidebar />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
