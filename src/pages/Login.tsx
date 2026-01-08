import { useLocation, useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/LoginForm";
import { getStoredPrefs } from "@/lib/authStorage";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginNotice =
    (location.state as { reason?: string } | null)?.reason === "auth"
      ? "로그인이 필요합니다."
      : null;

  const handleLoginSuccess = () => {
    const storedPrefs = getStoredPrefs();
    navigate(storedPrefs ? "/" : "/onboarding", { replace: true });
  };

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
