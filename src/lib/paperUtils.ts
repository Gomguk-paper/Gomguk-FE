import type { PaperOut } from "@/lib/apiTypes";

// Helper function to convert backend PaperOut to frontend Paper format
export const convertPaperOutToPaper = (paperOut: PaperOut, tagMap: Record<number, string>): any => {
    // We now handle s3:// URLs in PaperCard via resolveImageUrl
    const imageUrl = paperOut.image_url;

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
