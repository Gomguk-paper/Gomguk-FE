import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPrefs } from "@/lib/authStorage";

interface InterestSectionProps {
    prefs: UserPrefs | null;
}

export function InterestSection({ prefs }: InterestSectionProps) {
    const navigate = useNavigate();

    return (
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
                    onClick={() => navigate("/onboarding?reset=true")}
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
    );
}
