import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ReadingSectionProps {
    autoMarkAsRead: boolean;
    setAutoMarkAsRead: (checked: boolean) => void;
}

export function ReadingSection({ autoMarkAsRead, setAutoMarkAsRead }: ReadingSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    읽기 설정
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
    );
}
