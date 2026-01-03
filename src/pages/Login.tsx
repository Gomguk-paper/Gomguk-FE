import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useStore();

  const handleStart = () => {
    setUser({ name: "사용자", isGuest: false, onboardingCompleted: false });
    navigate("/onboarding");
  };

  const handleGuest = () => {
    setUser({ name: "게스트", isGuest: true, onboardingCompleted: true });
    navigate("/");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">
            곰국
          </h1>
          <p className="text-muted-foreground text-lg">
            논문을 <span className="text-primary font-medium">피드</span>처럼 소비하다
          </p>
        </div>

        {/* Tagline */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            AI가 요약한 논문을 3단계로 빠르게
          </p>
          <p>어그로 한줄 → 핵심 포인트 → 상세 설명</p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            className="w-full h-12 text-base font-medium"
            onClick={handleStart}
          >
            시작하기
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12 text-base"
            onClick={handleGuest}
          >
            둘러보기 (게스트)
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          프로토타입 버전 • 실제 로그인 없이 체험
        </p>
      </div>
    </main>
  );
}
