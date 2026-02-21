import { useMemo } from "react";
import { useStore } from "@/store/useStore";

export function usePaperStats(readPapers: { tags: string[] }[]) {
    const user = useStore((s) => s.user);
    const actionsByUser = useStore((s) => s.actionsByUser);

    const readActions = useMemo(() => {
        if (!user) return [];
        const userKey = user.id;
        return (actionsByUser[userKey] ?? []).filter((a) => !!a.readAt);
    }, [user, actionsByUser]);

    const tagDistribution = useMemo(() => {
        const tagCounts: Record<string, number> = {};
        readPapers.forEach((paper) => {
            paper.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [readPapers]);

    const hourlyDistribution = useMemo(() => {
        const counts = Array(24).fill(0) as number[];
        readActions.forEach((a) => {
            if (a.readAt) {
                const hour = new Date(a.readAt).getHours();
                counts[hour]++;
            }
        });
        return counts.map((count, hour) => ({
            hour: `${hour}시`,
            count,
        }));
    }, [readActions]);

    const dailyDistribution = useMemo(() => {
        const dateCounts: Record<string, number> = {};
        readActions.forEach((a) => {
            if (a.readAt) {
                const date = a.readAt.slice(0, 10);
                dateCounts[date] = (dateCounts[date] || 0) + 1;
            }
        });
        const today = new Date();
        const result = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            result.push({
                date: `${d.getMonth() + 1}/${d.getDate()}`,
                count: dateCounts[dateStr] || 0,
            });
        }
        return result;
    }, [readActions]);

    return {
        tagDistribution,
        hourlyDistribution,
        dailyDistribution,
    };
}
