import { useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export interface NotificationSettings {
    newRecommendation: boolean;
    tagMatch: boolean;
}

const NOTIFICATION_SETTINGS_KEY = "gomguk_notification_settings";

export const getNotificationSettings = (): NotificationSettings => {
    if (typeof window === "undefined") {
        return { newRecommendation: true, tagMatch: true };
    }
    const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return { newRecommendation: true, tagMatch: true };
        }
    }
    return { newRecommendation: true, tagMatch: true };
};

const saveNotificationSettings = (settings: NotificationSettings) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    }
};

export function NotificationSection() {
    const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());

    const handleChange = (key: keyof NotificationSettings, value: boolean) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        saveNotificationSettings(newSettings);
    };

    return (
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
                        checked={settings.newRecommendation}
                        onCheckedChange={(checked) => handleChange("newRecommendation", checked)}
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
                        checked={settings.tagMatch}
                        onCheckedChange={(checked) => handleChange("tagMatch", checked)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
