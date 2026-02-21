import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { clearStoredUser, clearStoredPrefs, type UserPrefs, type StoredUser } from "@/lib/authStorage";
import { authApi } from "@/api/auth";
import { meApi } from "@/api/me";

interface AccountSectionProps {
    setUser: (user: StoredUser | null) => void;
    setPrefs: (prefs: UserPrefs | null) => void;
}

export function AccountSection({ setUser, setPrefs }: AccountSectionProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

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

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await meApi.withdraw();
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status !== 401) {
                setIsDeleting(false);
                setDeleteError("탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.");
                return;
            }
        }

        try {
            await authApi.logout();
        } catch {
            // 쿠키 삭제 실패는 무시
        }

        clearStoredUser();
        clearStoredPrefs();
        setUser(null);
        setPrefs(null);
        queryClient.clear();
        localStorage.clear();
        sessionStorage.clear();

        navigate("/login");
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4" />
                        계정
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <User className="w-4 h-4 mr-2" />
                        계정 탈퇴
                    </Button>
                </CardContent>
            </Card>

            {/* 계정 탈퇴 Dialog */}
            <Dialog
                open={showDeleteDialog}
                onOpenChange={(open) => {
                    if (!isDeleting) {
                        setShowDeleteDialog(open);
                        if (!open) setDeleteError(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">계정 탈퇴</DialogTitle>
                        <DialogDescription>
                            정말로 계정을 탈퇴하시겠습니까?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-semibold text-destructive">⚠️ 주의사항</p>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                <li>모든 사용자 데이터가 영구적으로 삭제됩니다</li>
                                <li>좋아요, 저장, 읽은 논문 기록이 모두 사라집니다</li>
                                <li>관심 분야 및 설정이 초기화됩니다</li>
                                <li>이 작업은 되돌릴 수 없습니다</li>
                            </ul>
                        </div>
                        {deleteError && (
                            <p className="text-sm text-destructive text-center">{deleteError}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteDialog(false);
                                setDeleteError(null);
                            }}
                            disabled={isDeleting}
                        >
                            취소
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    삭제 중...
                                </>
                            ) : deleteError ? (
                                "다시 시도"
                            ) : (
                                "계정 탈퇴"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
