import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, User, Settings, LogOut, LogIn, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { clearStoredUser } from "@/lib/authStorage";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const navItems = [
    { to: "/", icon: Home, label: "홈" },
    { to: "/search", icon: Search, label: "탐색" },
    { to: "/mypage", icon: User, label: "마이페이지" },
    { to: "/settings", icon: Settings, label: "설정" },
];

export function DesktopSidebar() {
    const location = useLocation();
    const { user, setUser } = useStore();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    // Hide on login and onboarding pages
    if (location.pathname === "/login" || location.pathname === "/onboarding") {
        return null;
    }

    const handleLogout = () => {
        clearStoredUser();
        setUser(null);
        setShowLogoutDialog(false);
    };

    return (
        <aside className="hidden md:flex sticky top-0 h-screen w-64 shrink-0 flex-col border-r bg-card z-40">
            {/* Logo Area */}
            <div className="p-6">
                <NavLink to="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-display font-bold text-xl">곰국</span>
                </NavLink>
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
                                "flex items-center gap-4 px-4 py-3 rounded-full transition-colors text-lg",
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
                    <NavLink
                        to="/mypage"
                        className="flex items-center justify-between p-3 rounded-full hover:bg-secondary/30 cursor-pointer group relative"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-bold shrink-0">
                                {user.name?.[0] || "U"}
                            </div>
                            <div className="flex flex-col truncate">
                                <span className="font-bold text-sm truncate">{user.name || "사용자"}</span>
                                <span className="text-xs text-muted-foreground truncate capitalize">{user.provider} Account</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowLogoutDialog(true);
                            }}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors z-10"
                            title="로그아웃"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </NavLink>
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

            {/* Logout Confirmation Dialog */}
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>로그아웃</DialogTitle>
                        <DialogDescription>
                            정말 로그아웃 하시겠습니까?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                            취소
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            로그아웃
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </aside>
    );
}
