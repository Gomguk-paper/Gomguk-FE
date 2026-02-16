import type { PaperOut } from "@/lib/apiTypes";

<<<<<<< Updated upstream
// Helper function to convert backend PaperOut to frontend Paper format
export const convertPaperOutToPaper = (paperOut: PaperOut, tagMap: Record<number, string>): any => {
    // We now handle s3:// URLs in PaperCard via resolveImageUrl
    const imageUrl = paperOut.image_url;
=======
function getStr(obj: Record<string, unknown>, ...keys: string[]): string {
    for (const k of keys) {
        const v = obj[k];
        if (typeof v === "string" && v.trim()) return v;
    }
    return "";
}
function getArr(obj: Record<string, unknown>, ...keys: string[]): string[] {
    for (const k of keys) {
        const v = obj[k];
        if (Array.isArray(v)) return (v as unknown[]).filter((p): p is string => typeof p === "string");
    }
    return [];
}

/** 백엔드 응답(raw)에서 hook/points/detailed 안전 추출. BE는 최상위 hook, points, detailed 전송 */
function getSummaryFromPaperOut(raw: Record<string, unknown>): { hook: string; points: string[]; detailed: string } {
    const nested = raw.summary && typeof raw.summary === "object" ? (raw.summary as Record<string, unknown>) : null;
    const hook = getStr(raw, "hook", "title") || (nested ? getStr(nested, "hook", "title") : "") || "";
    const points = getArr(raw, "points", "keyPoints", "key_points").length
        ? getArr(raw, "points", "keyPoints", "key_points")
        : nested
            ? getArr(nested, "points", "keyPoints", "key_points")
            : [];
    const detailed = getStr(raw, "detailed", "short") || (nested ? getStr(nested, "detailed", "short") : "") || "";
    return { hook, points, detailed };
}

// Helper function to convert backend PaperOut to frontend Paper format
export const convertPaperOutToPaper = (paperOut: PaperOut, tagMap: Record<number, string>): any => {
    const raw = paperOut as Record<string, unknown>;
    const summary = getSummaryFromPaperOut(raw);
    const title =
        summary.hook ||
        (typeof raw.title === "string" ? raw.title : "") ||
        (summary.points[0]?.slice(0, 80) ?? "");
>>>>>>> Stashed changes

    return {
        id: String(paperOut.id),
        title: paperOut.title,
        authors: paperOut.authors || [],
        year: paperOut.year,
        venue: "", // Not provided by backend
        tags: paperOut.tags?.map(tagId => tagMap[tagId] || String(tagId)) || [],
        abstract: paperOut.short,
        pdfUrl: paperOut.raw_url ? paperOut.raw_url.replace("arxiv.org/pdf/", "arxiv.org/abs/").replace(".pdf", "") : paperOut.raw_url,
        imageUrl: paperOut.image_url, // PaperCard will resolve this using resolveImageUrl
        metrics: {
            trendingScore: paperOut.trending_score ?? 0,
            recencyScore: paperOut.freshness_score ?? 0,
            recommendScore: paperOut.recommend_score ?? 0,
            citations: 0,
        },
    };
};
