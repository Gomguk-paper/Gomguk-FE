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
  }, [user, prefs, setUser, setPrefs]);

  if (!hydrated) {
    return null;
  }
  const hasPrefs = Boolean(prefs);
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/mypage"
          element={user ? <MyPage /> : <Navigate to="/login" replace state={{ reason: "auth", from: "/mypage" }} />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to={hasPrefs ? "/" : "/onboarding"} replace /> : <Login />}
        />
        <Route
          path="/onboarding"
          element={user ? <Onboarding /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
