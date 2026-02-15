import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";

import { ProfileSection } from "./settings/components/ProfileSection";
import { NotificationSection } from "./settings/components/NotificationSection";
import { InterestSection } from "./settings/components/InterestSection";
import { ScreenSection } from "./settings/components/ScreenSection";
import { ThemeSection } from "./settings/components/ThemeSection";
import { ReadingSection } from "./settings/components/ReadingSection";
import { AccountSection } from "./settings/components/AccountSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  const navigate = useNavigate();
  const { user, prefs, setUser, setPrefs } = useStore();
  const [autoMarkAsRead, setAutoMarkAsRead] = useState(true);

  return (
    <main className="min-h-screen mobile-content-padding bg-muted/30">
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
        <ProfileSection user={user} setUser={setUser} />

        {/* 알림 설정 */}
        <NotificationSection />

        {/* 관심 분야 설정 */}
        <InterestSection prefs={prefs} />

        {/* 화면 설정 */}
        <ScreenSection prefs={prefs} setPrefs={setPrefs} />

        {/* 테마 설정 */}
        <ThemeSection />

        {/* 읽기 설정 */}
        <ReadingSection autoMarkAsRead={autoMarkAsRead} setAutoMarkAsRead={setAutoMarkAsRead} />

        {/* 계정 설정 */}
        <AccountSection setUser={setUser} setPrefs={setPrefs} />

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
