import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearStoredUser } from "@/lib/authStorage";
import { useStore } from "@/store/useStore";
import { authApi } from "@/api/auth";
import { TagChip } from "@/components/TagChip";

interface MyPageHeaderProps {
    user: any;
    prefs: any;
    likedCount: number;
    savedCount: number;
    readCount: number;
}

export function MyPageHeader({ user, prefs, likedCount, savedCount, readCount }: MyPageHeaderProps) {
    const navigate = useNavigate();
    const { setUser } = useStore();

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            clearStoredUser();
            setUser(null);
            navigate("/login");
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h1 className="font-display text-xl font-bold p-4">마이페이지</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        로그아웃
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4 p-4">
                <Avatar className="w-16 h-16 shrink-0">
                    {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                        {user?.name?.[0] || "G"}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-base truncate">{user?.name || ""}</h2>
                    {prefs && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                관심 분야 {prefs.tags.length}개 •{" "}
                                {prefs.level === "undergraduate"
                                    ? "학부생"
                                    : prefs.level === "graduate"
                                        ? "대학원생"
                                        : prefs.level === "researcher"
                                            ? "연구자"
                                            : "실무자"}
                            </p>
                            {prefs.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {prefs.tags.map((t: any) => (
                                        <TagChip key={t.name} tag={t.name} size="sm" interest={true} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{likedCount}</div>
                    <div className="text-xs text-muted-foreground">좋아요</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{savedCount}</div>
                    <div className="text-xs text-muted-foreground">저장</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{readCount}</div>
                    <div className="text-xs text-muted-foreground">읽음</div>
                </div>
            </div>
        </>
    );
}
