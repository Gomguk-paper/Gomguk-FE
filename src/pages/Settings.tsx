import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Bell,
  BookOpen,
  LogOut,
  Mail,
  Target,
  Edit2,
  Camera,
  X,
  Monitor
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { clearStoredUser, setStoredPrefs, setStoredUser, type UserPrefs, type StoredUser } from "@/lib/authStorage";
import { Label } from "@/components/ui/label";

interface NotificationSettings {
  newRecommendation: boolean;
  tagMatch: boolean;
  goalAchievement: boolean;
}

const NOTIFICATION_SETTINGS_KEY = "gomguk_notification_settings";

const getNotificationSettings = (): NotificationSettings => {
  if (typeof window === "undefined") {
    return { newRecommendation: true, tagMatch: true, goalAchievement: true };
  }
  const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { newRecommendation: true, tagMatch: true, goalAchievement: true };
    }
  }
  return { newRecommendation: true, tagMatch: true, goalAchievement: true };
};

const saveNotificationSettings = (settings: NotificationSettings) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  }
};

export default function Settings() {
  const navigate = useNavigate();
  const { user, prefs, setUser, setPrefs } = useStore();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [dailyCount, setDailyCount] = useState(prefs?.dailyCount || 10);
  const [autoMarkAsRead, setAutoMarkAsRead] = useState(true);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");

  useEffect(() => {
    if (prefs?.dailyCount) {
      setDailyCount(prefs.dailyCount);
    }
  }, [prefs]);

  useEffect(() => {
    if (user) {
      setEditedName(user.name);
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleDailyCountChange = (value: number[]) => {
    const newCount = value[0];
    setDailyCount(newCount);
    if (prefs) {
      const updatedPrefs: UserPrefs = { ...prefs, dailyCount: newCount };
      setPrefs(updatedPrefs);
      setStoredPrefs(updatedPrefs);
    }
  };

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

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    navigate("/login");
  };

  return (
    <main className="min-h-screen mobile-content-padding bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b mobile-safe-area-pt md:hidden">
        <div className="flex items-center gap-3 p-4 max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-xl font-bold">설정</h1>
        </div>
      </header>

      <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto p-4 mobile-safe-area-pl mobile-safe-area-pr space-y-4">
        {/* 프로필 설정 */}
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
                  {user?.provider === "google" ? "Google 계정" : "Kakao 계정"}
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

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4" />
              알림 설정
            </CardTitle>
            <CardDescription>받고 싶은 알림을 선택하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-recommendation" className="text-sm font-medium">
                  새 추천 논문 알림
                </Label>
                <p className="text-xs text-muted-foreground">
                  새로운 추천 논문이 있을 때 알림을 받습니다
                </p>
              </div>
              <Switch
                id="new-recommendation"
                checked={notificationSettings.newRecommendation}
                onCheckedChange={(checked) => handleNotificationChange("newRecommendation", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tag-match" className="text-sm font-medium">
                  태그 매칭 알림
                </Label>
                <p className="text-xs text-muted-foreground">
                  관심 태그와 매칭되는 논문이 있을 때 알림을 받습니다
                </p>
              </div>
              <Switch
                id="tag-match"
                checked={notificationSettings.tagMatch}
                onCheckedChange={(checked) => handleNotificationChange("tagMatch", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="goal-achievement" className="text-sm font-medium">
                  읽기 목표 달성 알림
                </Label>
                <p className="text-xs text-muted-foreground">
                  일일 읽기 목표를 달성했을 때 알림을 받습니다
                </p>
              </div>
              <Switch
                id="goal-achievement"
                checked={notificationSettings.goalAchievement}
                onCheckedChange={(checked) => handleNotificationChange("goalAchievement", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 관심 분야 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              관심 분야
            </CardTitle>
            <CardDescription>추천 논문의 기준이 됩니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/onboarding")}
            >
              관심 분야 다시 설정하기
            </Button>
            {prefs && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                현재 {prefs.tags.length}개의 관심 분야가 설정되어 있습니다
              </p>
            )}
          </CardContent>
        </Card>

        {/* 화면 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> {/* Reuse icon or import Monitor/Smartphone */}
              화면 설정
            </CardTitle>
            <CardDescription>화면 레이아웃 방식을 선택하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="layout-mode" className="text-sm font-medium">
                레이아웃 모드
              </Label>
              <Select
                value={prefs?.layoutMode || "auto"}
                onValueChange={(v) => {
                  if (prefs) {
                    const updatedPrefs: UserPrefs = { ...prefs, layoutMode: v as "auto" | "mobile" | "desktop" };
                    setPrefs(updatedPrefs);
                    setStoredPrefs(updatedPrefs);
                  }
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">자동 (기본)</SelectItem>
                  <SelectItem value="mobile">모바일 전용</SelectItem>
                  <SelectItem value="desktop">데스크탑 전용</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              '모바일 전용'을 선택하면 PC에서도 모바일 화면처럼 좁게 표시됩니다.
            </p>
          </CardContent>
        </Card>

        {/* 읽기 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              읽기 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-count" className="text-sm font-medium">
                  일일 읽기 목표
                </Label>
                <span className="text-sm font-semibold text-primary">{dailyCount}개</span>
              </div>
              <Slider
                id="daily-count"
                min={1}
                max={50}
                step={1}
                value={[dailyCount]}
                onValueChange={handleDailyCountChange}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                하루에 읽고 싶은 논문의 목표 개수를 설정하세요
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-read" className="text-sm font-medium">
                  자동 읽음 처리
                </Label>
                <p className="text-xs text-muted-foreground">
                  요약보기를 통해 본 논문을 자동으로 읽음 처리합니다
                </p>
              </div>
              <Switch
                id="auto-read"
                checked={autoMarkAsRead}
                onCheckedChange={setAutoMarkAsRead}
              />
            </div>
          </CardContent>
        </Card>

        {/* 계정 설정 */}
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
          </CardContent>
        </Card>

        {/* 기타 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">앱 버전</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

