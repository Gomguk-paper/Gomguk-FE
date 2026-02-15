import { useState, useEffect } from "react";
import { User, Camera, Edit2, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { setStoredUser, type StoredUser } from "@/lib/authStorage";

interface ProfileSectionProps {
    user: StoredUser | null;
    setUser: (user: StoredUser | null) => void;
}

export function ProfileSection({ user, setUser }: ProfileSectionProps) {
    const [showNameDialog, setShowNameDialog] = useState(false);
    const [showAvatarDialog, setShowAvatarDialog] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        if (user) {
            setEditedName(user.name);
            setAvatarUrl(user.avatarUrl || "");
        }
    }, [user]);

    const handleNameSave = () => {
        if (!user || !editedName.trim()) return;
        const updatedUser: StoredUser = { ...user, name: editedName.trim() };
        setUser(updatedUser);
        setStoredUser(updatedUser);
        setShowNameDialog(false);
    };

    const handleAvatarSave = () => {
        if (!user) return;
        const updatedUser: StoredUser = { ...user, avatarUrl: avatarUrl.trim() || undefined };
        setUser(updatedUser);
        setStoredUser(updatedUser);
        setShowAvatarDialog(false);
    };

    const handleAvatarRemove = () => {
        if (!user) return;
        const updatedUser: StoredUser = { ...user };
        delete updatedUser.avatarUrl;
        setUser(updatedUser);
        setStoredUser(updatedUser);
        setAvatarUrl("");
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4" />
                        프로필
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="w-16 h-16">
                                {user?.avatarUrl ? (
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                ) : null}
                                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                    {user?.name?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute bottom-0 right-0 h-6 w-6 rounded-full"
                                onClick={() => setShowAvatarDialog(true)}
                            >
                                <Camera className="w-3 h-3" />
                            </Button>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <div className="font-semibold">{user?.name || "사용자"}</div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setShowNameDialog(true)}
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Mail className="w-3.5 h-3.5" />
                                {user?.provider === "google" ? "Google 계정" : user?.provider === "kakao" ? "Kakao 계정" : "GitHub 계정"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 이름 변경 Dialog */}
            <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>이름 변경</DialogTitle>
                        <DialogDescription>
                            표시될 이름을 입력하세요
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">이름</Label>
                            <Input
                                id="name"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                placeholder="이름을 입력하세요"
                                maxLength={20}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNameDialog(false)}>
                            취소
                        </Button>
                        <Button onClick={handleNameSave} disabled={!editedName.trim()}>
                            저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 프로필 사진 변경 Dialog */}
            <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>프로필 사진 변경</DialogTitle>
                        <DialogDescription>
                            프로필 사진 URL을 입력하거나 제거할 수 있습니다
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-center">
                            <Avatar className="w-24 h-24">
                                {avatarUrl ? (
                                    <AvatarImage src={avatarUrl} alt="프로필" />
                                ) : null}
                                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                                    {user?.name?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="avatar-url">이미지 URL</Label>
                            <Input
                                id="avatar-url"
                                type="url"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                            <p className="text-xs text-muted-foreground">
                                프로필 사진으로 사용할 이미지의 URL을 입력하세요
                            </p>
                        </div>
                        {user?.avatarUrl && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleAvatarRemove}
                            >
                                <X className="w-4 h-4 mr-2" />
                                프로필 사진 제거
                            </Button>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAvatarDialog(false)}>
                            취소
                        </Button>
                        <Button onClick={handleAvatarSave}>
                            저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
