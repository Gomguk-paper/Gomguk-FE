import { useState } from "react";
import { BarChart3, Clock, CalendarDays } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface StatsTabProps {
    readPapersCount: number;
    tagDistribution: { tag: string; count: number }[];
    hourlyDistribution: { hour: string; count: number }[];
    dailyDistribution: { date: string; count: number }[];
}

const chartConfig = {
    count: {
        label: "읽은 논문 수",
        color: "hsl(220, 60%, 50%)",
    },
};

const barChartConfig = {
    count: {
        label: "논문 수",
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

function formatToday() {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
}

type ChartMode = "hourly" | "daily";

export function StatsTab({ readPapersCount, tagDistribution, hourlyDistribution, dailyDistribution }: StatsTabProps) {
    const [chartMode, setChartMode] = useState<ChartMode>("hourly");

    if (readPapersCount === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>읽은 논문이 없어 통계를 표시할 수 없어요</p>
                <p className="text-sm mt-1">홈에서 논문을 탐색해보세요</p>
            </div>
        );
    }

    const isHourly = chartMode === "hourly";

    return (
        <div className="mt-4 space-y-4">
            {/* 막대그래프 (시간별/일별 통합 카드) */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            {isHourly ? <Clock className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                            {isHourly ? "오늘 읽은 논문 통계" : "최근 14일 읽기 추이"}
                        </CardTitle>
                        <div className="flex gap-1">
                            <Button
                                variant={isHourly ? "default" : "outline"}
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => setChartMode("hourly")}
                            >
                                시간별
                            </Button>
                            <Button
                                variant={!isHourly ? "default" : "outline"}
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => setChartMode("daily")}
                            >
                                일별
                            </Button>
                        </div>
                    </div>
                    <CardDescription>
                        {isHourly
                            ? `${formatToday()} 시간대 별 읽은 논문 (${hourlyDistribution.reduce((s, d) => s + d.count, 0)}개)`
                            : "날짜별 읽은 논문 수"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={barChartConfig} className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {isHourly ? (
                                <BarChart data={hourlyDistribution} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="hour"
                                        tick={{ fontSize: 10 }}
                                        interval={2}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="hsl(220, 60%, 50%)" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            ) : (
                                <BarChart data={dailyDistribution} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10 }}
                                        interval={1}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="hsl(175, 60%, 45%)" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* 태그별 읽기 분포 */}
            {tagDistribution.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            읽은 논문의 태그 분포
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
