import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginForm } from "./LoginForm";
import { getStoredPrefs } from "@/lib/authStorage";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  /** 모달 열림/닫힘 상태 */
  open: boolean;
  /** 모달 상태 변경 핸들러 */
  onOpenChange: (open: boolean) => void;
  /** 로그인 필요 알림 메시지 표시 여부 */
  showNotice?: boolean;
}

/**
 * 상단에서 슬라이드 다운되는 로그인 모달
 * - 포커스 트랩
 * - 배경 스크롤 잠금
 * - ESC 키 처리
 * - Overlay 클릭 처리
 * - prefers-reduced-motion 지원
 */
export function LoginModal({ open, onOpenChange, showNotice = false }: LoginModalProps) {
  const navigate = useNavigate();
  const triggerButtonRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // 모달 열릴 때 트리거 버튼 저장 및 설정
  useEffect(() => {
    if (open) {
      // 현재 활성 요소 저장 (포커스 복귀용)
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      
      // 트리거 버튼 찾기 (data-login-trigger 속성을 가진 요소)
      const trigger = document.querySelector('[data-login-trigger]') as HTMLElement;
      if (trigger) {
        triggerButtonRef.current = trigger;
      }

      // 애니메이션 시작
      setIsAnimating(true);
    }
  }, [open]);

  // 배경 스크롤 잠금 및 ESC 키 처리
  useEffect(() => {
    if (!open) return;

    // 배경 스크롤 잠금
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    // ESC 키 핸들러
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  // 모달 닫힐 때 포커스 복귀 (애니메이션 완료 후)
  useEffect(() => {
    if (!open && previousActiveElementRef.current) {
      // 애니메이션 완료를 기다림 (약 300ms)
      const timer = setTimeout(() => {
        if (triggerButtonRef.current) {
          triggerButtonRef.current.focus();
        } else if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // 포커스 트랩: Tab 키로 모달 밖으로 나가지 않도록
  useEffect(() => {
    if (!open || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleTabKey);
    return () => {
      modal.removeEventListener("keydown", handleTabKey);
    };
  }, [open]);

  // 로그인 성공 시 처리
  const handleLoginSuccess = () => {
    const storedPrefs = getStoredPrefs();
    onOpenChange(false);
    // 필요시 리다이렉트 (예: 온보딩이 필요한 경우)
    if (!storedPrefs) {
      navigate("/onboarding", { replace: true });
    }
  };

  // 모달이 닫힐 때 애니메이션 상태 업데이트
  useEffect(() => {
    if (!open) {
      setIsAnimating(false);
    }
  }, [open]);

  if (!open && !isAnimating) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        open ? "block" : "pointer-events-none"
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      aria-describedby="login-modal-description"
    >
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          "motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        ref={modalRef}
        className={cn(
          "fixed left-1/2 z-50",
          "bg-background border rounded-lg shadow-2xl",
          "max-w-lg w-full mx-4",
          "p-6",
          "transform transition-all duration-300 ease-out",
          // prefers-reduced-motion 지원
          "motion-reduce:transition-none motion-reduce:animate-none",
          open 
            ? "top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 scale-100" 
            : "top-0 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="로그인 모달 닫기"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Content */}
        <div id="login-modal-description" className="sr-only">
          로그인 모달입니다. Google 또는 Kakao 계정으로 로그인할 수 있습니다.
        </div>
        <h2 id="login-modal-title" className="sr-only">
          로그인
        </h2>
        <LoginForm
          onSuccess={handleLoginSuccess}
          showNotice={showNotice}
          compact={true}
        />
      </div>
    </div>
  );
}
