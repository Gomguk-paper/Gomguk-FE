import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  AuthProvider,
  getStoredPrefs,
  setStoredUser,
  clearStoredUser,
} from "@/lib/authStorage";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";

interface LoginFormProps {
  /** 로그인 성공 시 호출되는 콜백 */
  onSuccess?: () => void;
  /** 로그인 실패 시 호출되는 콜백 */
  onError?: () => void;
  /** 로그인 필요 알림 메시지 표시 여부 */
  showNotice?: boolean;
  /** 컴팩트 모드 (모달용) */
  compact?: boolean;
}

export function LoginForm({ onSuccess, onError, showNotice = false, compact = false }: LoginFormProps) {
  const { setUser } = useStore();
  const { toast } = useToast();
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "authenticated" | "error">("idle");
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const loginAttemptRef = useRef(0);
  const isMountedRef = useRef(true);
  const firstInputRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 첫 번째 입력 버튼에 자동 포커스
  useEffect(() => {
    if (compact && firstInputRef.current) {
      // 약간의 지연을 두어 모달 애니메이션 후 포커스
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [compact]);

  const createMockUser = (provider: AuthProvider) => {
    const providerLabel = provider === "google" ? "Google" : "Kakao";
    return {
      id: `${Date.now()}`,
      name: `${providerLabel} 사용자`,
      provider,
      createdAt: new Date().toISOString(),
    };
  };

  const handleLogin = async (provider: AuthProvider) => {
    if (authStatus === "loading") return;
    setAuthStatus("loading");
    setLoadingProvider(provider);
    console.log(`login_click_${provider}`);
    const attemptId = ++loginAttemptRef.current;

    try {
      // Simulate an auth round-trip so leaving mid-flow doesn't mark the user as logged in.
      await new Promise(resolve => setTimeout(resolve, 600));
      if (!isMountedRef.current || attemptId !== loginAttemptRef.current) {
        return;
      }
      const user = createMockUser(provider);
      if (rememberMe) {
        setStoredUser(user);
      } else {
        clearStoredUser();
      }
      setUser(user);
      setAuthStatus("authenticated");
      onSuccess?.();
    } catch (error) {
      setAuthStatus("error");
      toast({
        title: "로그인에 실패했어요",
        description: "잠시 후 다시 시도해주세요.",
      });
      onError?.();
    } finally {
      if (isMountedRef.current && attemptId === loginAttemptRef.current) {
        setLoadingProvider(null);
      }
    }
  };

  const isLoading = authStatus === "loading";

  if (compact) {
    // 컴팩트 모드 (모달용)
    return (
      <div className="w-full space-y-6 text-center">
        {showNotice && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            로그인이 필요합니다.
          </div>
        )}
        
        {/* Logo */}
        <div id="login_brand" className="space-y-3">
          <div
            id="login_logo"
            className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg"
          >
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 id="login_title" className="font-display text-2xl font-bold text-foreground">
            곰국
          </h1>
          <p id="login_intro" className="text-muted-foreground text-sm">
            논문을 <span className="text-primary font-medium">피드</span>처럼 소비하다
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            ref={firstInputRef}
            id="btn_login_google"
            className="w-full h-12 text-base font-medium"
            onClick={() => handleLogin("google")}
            disabled={isLoading}
            aria-label="Google로 시작하기"
          >
            {loadingProvider === "google" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Google로 시작하기
          </Button>
          <Button
            id="btn_login_kakao"
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => handleLogin("kakao")}
            disabled={isLoading}
            aria-label="Kakao로 시작하기"
          >
            {loadingProvider === "kakao" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Kakao로 시작하기
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            id="chk_login_remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            disabled={isLoading}
            aria-label="로그인 상태 유지"
          />
          <label htmlFor="chk_login_remember" className="cursor-pointer">
            로그인 상태 유지
          </label>
        </div>
      </div>
    );
  }

  // 전체 페이지 모드
  return (
    <div className="w-full max-w-sm space-y-8 text-center">
      {showNotice && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          로그인이 필요합니다.
        </div>
      )}
      {/* Logo */}
      <div id="login_brand" className="space-y-4">
        <div
          id="login_logo"
          className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg"
        >
          <BookOpen className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 id="login_title" className="font-display text-4xl font-bold text-foreground">
          곰국
        </h1>
        <p id="login_intro" className="text-muted-foreground text-lg">
          논문을 <span className="text-primary font-medium">피드</span>처럼 소비하다
        </p>
      </div>

      {/* Tagline */}
      <div id="login_tagline" className="space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          AI가 요약한 논문을 3단계로 빠르게
        </p>
        <p>어그로 한줄 → 핵심 포인트 → 상세 설명</p>
      </div>

      {/* Buttons */}
      <div className="space-y-3 pt-4">
        <Button
          id="btn_login_google"
          className="w-full h-12 text-base font-medium"
          onClick={() => handleLogin("google")}
          disabled={isLoading}
          aria-label="Google로 시작하기"
        >
          {loadingProvider === "google" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Google로 시작하기
        </Button>
        <Button
          id="btn_login_kakao"
          variant="outline"
          className="w-full h-12 text-base"
          onClick={() => handleLogin("kakao")}
          disabled={isLoading}
          aria-label="Kakao로 시작하기"
        >
          {loadingProvider === "kakao" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Kakao로 시작하기
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          id="chk_login_remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
          disabled={isLoading}
          aria-label="로그인 상태 유지"
        />
        <label htmlFor="chk_login_remember" className="cursor-pointer">
          로그인 상태 유지
        </label>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <a
          id="link_privacy"
          href="#"
          aria-disabled="true"
          className="pointer-events-none cursor-not-allowed opacity-60"
        >
          개인정보처리방침
        </a>
        <a
          id="link_terms"
          href="#"
          aria-disabled="true"
          className="pointer-events-none cursor-not-allowed opacity-60"
        >
          이용약관
        </a>
      </div>

      <p className="text-xs text-muted-foreground">
        프로토타입 버전 • 실제 로그인 없이 체험
      </p>
    </div>
  );
}
