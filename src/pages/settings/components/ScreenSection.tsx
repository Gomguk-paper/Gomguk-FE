import { Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { setStoredPrefs, type UserPrefs } from "@/lib/authStorage";

interface ScreenSectionProps {
    prefs: UserPrefs | null;
    setPrefs: (prefs: UserPrefs | null) => void;
}

export function ScreenSection({ prefs, setPrefs }: ScreenSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
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
    );
}
