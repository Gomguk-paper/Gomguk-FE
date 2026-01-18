import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "홈" },
  { to: "/search", icon: Search, label: "탐색" },
  { to: "/mypage", icon: User, label: "마이" },
];

export function BottomNav() {
  const location = useLocation();

  // Hide on login and onboarding pages
  if (location.pathname === "/login" || location.pathname === "/onboarding") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t mobile-safe-area-pb w-full max-w-[480px] mx-auto">
      <div className="flex items-center justify-around h-16 max-w-[480px] mx-auto mobile-safe-area-pl mobile-safe-area-pr">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors touch-target",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
