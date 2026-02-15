import { useState, useMemo } from "react";
import {
    format,
    isToday,
    isThisWeek,
    isThisMonth,
    startOfDay,
    parseISO,
} from "date-fns";
import { ko } from "date-fns/locale/ko";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PaperCard } from "@/components/PaperCard";
import { Calendar, History } from "lucide-react";

interface HistoryTabProps {
    readPapersWithDate: { paper: any; readAt: string; readDate: Date }[];
    onOpenSummary?: (paper: any) => void;
}

type DateFilter = "all" | "today" | "week" | "month";

export function HistoryTab({ readPapersWithDate, onOpenSummary }: HistoryTabProps) {
    const [dateFilter, setDateFilter] = useState<DateFilter>("all");

    // 날짜 필터 적용
    const filteredReadPapers = useMemo(() => {
        let filtered = [...readPapersWithDate];

        if (dateFilter === "today") {
            filtered = filtered.filter((item) => isToday(item.readDate));
        } else if (dateFilter === "week") {
            filtered = filtered.filter((item) => isThisWeek(item.readDate));
        } else if (dateFilter === "month") {
            filtered = filtered.filter((item) => isThisMonth(item.readDate));
        }

        // 최신순 정렬
        return filtered.sort((a, b) => b.readDate.getTime() - a.readDate.getTime());
    }, [readPapersWithDate, dateFilter]);

    // 날짜별 그룹화
    const groupedReadPapers = useMemo(() => {
        const groups: Record<string, typeof filteredReadPapers> = {};

        filteredReadPapers.forEach((item) => {
            const dateKey = format(startOfDay(item.readDate), "yyyy-MM-dd");
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });

        // 날짜별로 정렬 (최신순)
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [filteredReadPapers]);

    if (readPapersWithDate.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>읽은 논문이 없어요</p>
                <p className="text-sm mt-1">홈에서 논문을 탐색해보세요</p>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-4">
            {/* 날짜 필터 */}
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="today">오늘</SelectItem>
                        <SelectItem value="week">이번 주</SelectItem>
                        <SelectItem value="month">이번 달</SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground ml-auto">
                    {filteredReadPapers.length}개
                </span>
            </div>

            {/* 날짜별 그룹화된 논문 목록 */}
            {groupedReadPapers.length > 0 ? (
                <div className="space-y-6">
                    {groupedReadPapers.map(([dateKey, items]) => {
                        const date = parseISO(dateKey);
                        const isTodayDate = isToday(date);
                        const dateLabel = isTodayDate
                            ? "오늘"
                            : format(date, "yyyy년 M월 d일 (E)", { locale: ko });

                        return (
                            <div key={dateKey} className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <h3 className="text-sm font-semibold text-foreground">{dateLabel}</h3>
                                    <span className="text-xs text-muted-foreground">{items.length}개</span>
                                </div>
                                {items.map(({ paper }) => (
                                    <div key={paper.id}>
                                        <PaperCard
                                            paper={paper}
                                            onOpenSummary={() => onOpenSummary?.(paper)}
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{`${dateFilter === "all" ? "읽은" : dateFilter === "today" ? "오늘 읽은" : dateFilter === "week" ? "이번 주에 읽은" : "이번 달에 읽은"} 논문이 없어요`}</p>
                </div>
            )}
        </div>
    );
}
