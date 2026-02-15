import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
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
import { clearStoredUser, type UserPrefs, type StoredUser } from "@/lib/authStorage";

interface AccountSectionProps {
    setUser: (user: StoredUser | null) => void;
    setPrefs: (prefs: UserPrefs | null) => void;
}

export function AccountSection({ setUser, setPrefs }: AccountSectionProps) {
    const navigate = useNavigate();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleLogout = () => {
        clearStoredUser();
        setUser(null);
        navigate("/login");
    };

    const handleDeleteAccount = () => {
        // Clear all user data
        clearStoredUser();
        setUser(null);
        setPrefs(null);

        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to login
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
                        계정 삭제
                    </Button>
                </CardContent>
            </Card>

            {/* 계정 삭제 Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">계정 삭제</DialogTitle>
                        <DialogDescription>
                            정말로 계정을 삭제하시겠습니까?
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            취소
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                handleDeleteAccount();
                                setShowDeleteDialog(false);
                            }}
                        >
                            계정 삭제
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
