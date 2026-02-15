import { Sun, Moon, Laptop } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";

export function ThemeSection() {
    const { theme, setTheme } = useTheme();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    테마
                </CardTitle>
                <CardDescription>앱의 밝기를 설정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => setTheme('light')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${theme === 'light'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                            }`}
                    >
                        <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`}>
                            라이트
                        </span>
                    </button>

                    <button
                        onClick={() => setTheme('dark')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${theme === 'dark'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                            }`}
                    >
                        <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`}>
                            다크
                        </span>
                    </button>

                    <button
                        onClick={() => setTheme('system')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${theme === 'system'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                            }`}
                    >
                        <Laptop className={`w-5 h-5 ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`}>
                            시스템
                        </span>
                    </button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    시스템 설정을 따르면 기기의 테마에 맞춰 자동으로 변경됩니다
                </p>
            </CardContent>
        </Card>
    );
}
