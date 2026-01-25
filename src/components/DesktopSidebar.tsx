import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, User, Settings, LogOut, LogIn, BookOpen, Moon, Sun, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { clearStoredUser } from "@/lib/authStorage";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";

const navItems = [
    { to: "/", icon: Home, label: "홈" },
    { to: "/search", icon: Search, label: "탐색" },
    { to: "/mypage", icon: User, label: "마이페이지" },
    { to: "/settings", icon: Settings, label: "설정" },
];

export function DesktopSidebar() {
    const location = useLocation();
    const { user, setUser } = useStore();
    const { resolvedTheme, toggleTheme } = useTheme();

    // Hide on login and onboarding pages
    if (location.pathname === "/login" || location.pathname === "/onboarding") {
        return null;
    }

    const handleLogout = () => {
        clearStoredUser();
        setUser(null);
    };

    return (
        <aside className="hidden md:flex sticky top-0 h-screen w-64 shrink-0 flex-col border-r bg-card z-40">
            {/* Logo Area */}
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-display font-bold text-xl">곰국</span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map(({ to, icon: Icon, label }) => {
                    const isActive = location.pathname === to;
                    return (
                        <NavLink
                            key={to}
                            to={to}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-full text-lg",
                                isActive
                                    ? "font-bold text-primary bg-secondary/50"
                                    : "text-foreground hover:bg-secondary/30"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} />
                            <span>{label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Area / Auth Actions */}
            <div className="p-4 border-t">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center justify-between p-3 rounded-full hover:bg-secondary/30 cursor-pointer group outline-none">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-bold shrink-0">
                                        {user.name?.[0] || "U"}
                                    </div>
                                    <div className="flex flex-col truncate text-left">
                                        <span className="font-bold text-sm truncate">{user.name || "사용자"}</span>
                                        <span className="text-xs text-muted-foreground truncate capitalize">{user.provider} Account</span>
                                    </div>
                                </div>
                                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 mb-2" side="top" align="center">
                            <DropdownMenuItem className="focus:bg-transparent focus:text-foreground" onSelect={(e) => e.preventDefault()}>
                                <div className="flex items-center justify-between w-full">
                                    <span className="flex items-center gap-2 font-medium">
                                        {resolvedTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                        다크 모드
                                    </span>
                                    <Switch
                                        checked={resolvedTheme === 'dark'}
                                        onCheckedChange={toggleTheme}
                                    />
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                                <LogOut className="w-4 h-4 mr-2" />
                                로그아웃
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <NavLink
                        to="/login"
                        className="flex items-center justify-center gap-2 w-full p-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
                    >
                        <LogIn className="w-5 h-5" />
                        <span>로그인</span>
                    </NavLink>
                )}
            </div>
        </aside>
    );
}
