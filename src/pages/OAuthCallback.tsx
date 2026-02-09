import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { bootstrapSession, POST_LOGIN_REDIRECT_KEY } from "@/lib/authSession";
import { clearStoredUser, getStoredPrefs } from "@/lib/authStorage";
import { useStore } from "@/store/useStore";

const isSafeReturnPath = (path?: string | null) => {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  return !path.startsWith("/oauth/callback");
};

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setAccessToken } = useStore();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    const finalizeAuth = async () => {
      try {
        const { accessToken, user } = await bootstrapSession();
        if (cancelled) return;

        setAccessToken(accessToken);
        setUser(user);

        const isNewUser = searchParams.get("is_new_user") === "true";
        const storedPrefs = getStoredPrefs();
        const returnTo = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
        sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);

        if (isNewUser || !storedPrefs) {
          navigate("/onboarding", { replace: true });
          return;
        }

        if (isSafeReturnPath(returnTo) && returnTo !== "/login") {
          navigate(returnTo, { replace: true });
          return;
        }

        navigate("/", { replace: true });
      } catch (error) {
        if (cancelled) return;
        console.error("OAuth callback failed:", error);
        setAccessToken(null);
        setUser(null);
        clearStoredUser();
        setStatus("error");
      }
    };

    finalizeAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams, setAccessToken, setUser]);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">로그인 처리 중입니다...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="text-center space-y-2">
        <h1 className="text-lg font-semibold">로그인에 실패했어요</h1>
        <p className="text-sm text-muted-foreground">잠시 후 다시 시도해주세요.</p>
      </div>
      <Button onClick={() => navigate("/login", { replace: true })}>로그인으로 이동</Button>
    </main>
  );
}
