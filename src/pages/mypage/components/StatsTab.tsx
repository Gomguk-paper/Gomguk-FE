import { BarChart3, TrendingUp } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface StatsTabProps {
    readPapersCount: number;
    weeklyStats: { week: string; count: number }[];
    tagDistribution: { tag: string; count: number }[];
}

const chartConfig = {
    count: {
        label: "읽은 논문 수",
        color: "hsl(220, 60%, 50%)",
    },
};

const COLORS = [
    "hsl(220, 60%, 50%)",
    "hsl(175, 60%, 45%)",
    "hsl(30, 80%, 55%)",
    "hsl(340, 65%, 60%)",
    "hsl(200, 75%, 55%)",
];

const getBarColor = (index: number) => {
    const colors = [
        "hsl(220, 60%, 50%)",
        "hsl(220, 60%, 55%)",
        "hsl(220, 60%, 60%)",
        "hsl(220, 60%, 65%)",
    ];
    return colors[index % colors.length];
};

export function StatsTab({ readPapersCount, weeklyStats, tagDistribution }: StatsTabProps) {
    if (readPapersCount === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>읽은 논문이 없어 통계를 표시할 수 없어요</p>
                <p className="text-sm mt-1">홈에서 논문을 탐색해보세요</p>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-4">
            {/* 주별 읽기 통계 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        주별 읽기 통계
                    </CardTitle>
                    <CardDescription>최근 4주간 읽은 논문 수</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <BarChart data={weeklyStats}>
                            <XAxis dataKey="week" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" radius={4}>
                                {weeklyStats.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getBarColor(index)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* 태그별 읽기 분포 */}
            {tagDistribution.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            태그별 읽기 분포
                        </CardTitle>
                        <CardDescription>가장 많이 읽은 태그 Top 5</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <PieChart>
                                <Pie
                                    data={tagDistribution}
                                    dataKey="count"
                                    nameKey="tag"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ tag, count }) => `${tag}: ${count}`}
                                >
                                    {tagDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            )}

            {/* 읽기 습관 요약 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">읽기 습관 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">총 읽은 논문</span>
                        <span className="text-lg font-bold">{readPapersCount}개</span>
                    </div>
                    {tagDistribution.length > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">가장 많이 읽은 태그</span>
                            <span className="text-lg font-bold">{tagDistribution[0].tag}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
