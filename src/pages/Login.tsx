import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/LoginForm";
import { getStoredPrefs, setStoredUser } from "@/lib/authStorage";
import { ROUTES } from "@/core/config/constants";
import { meApi } from "@/api/me";
import { useStore } from "@/store/useStore";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useStore();
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  const loginNotice =
    (location.state as { reason?: string } | null)?.reason === "auth"
      ? "로그인이 필요합니다."
      : null;

  // Handle OAuth callback (공통: 전체 페이지 로그인 + 모달에서 Google 로그인 후 리다이렉트)
  // access_token이 있으면 처리 (is_new_user 없어도 동작하도록 통일)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get("access_token");
    const isNewUser = searchParams.get("is_new_user");

    if (accessToken && !isProcessingCallback) {
      setIsProcessingCallback(true);
      localStorage.setItem("access_token", accessToken);

      meApi
        .getMe()
        .then((userData) => {
          const user = {
            id: userData.id.toString(),
            name: userData.name,
            provider: userData.provider as "google" | "github" | "kakao",
            createdAt: new Date().toISOString(),
          };

          setStoredUser(user);
          setUser(user);

          const storedPrefs = getStoredPrefs();
          if (isNewUser === "true" || !storedPrefs) {
            navigate(ROUTES.ONBOARDING, { replace: true });
          } else {
            navigate(ROUTES.HOME, { replace: true });
          }
        })
        .catch((error) => {
          console.error("Failed to fetch user info:", error);
          setIsProcessingCallback(false);
        });
    }
  }, [location.search, navigate, setUser, isProcessingCallback]);

  const handleLoginSuccess = () => {
    const storedPrefs = getStoredPrefs();
    navigate(storedPrefs ? ROUTES.HOME : ROUTES.ONBOARDING, { replace: true });
  };

  if (isProcessingCallback) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로그인 처리 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <LoginForm
        onSuccess={handleLoginSuccess}
        showNotice={!!loginNotice}
        compact={false}
      />
    </main>
  );
}
