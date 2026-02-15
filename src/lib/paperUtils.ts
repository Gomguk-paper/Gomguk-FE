import type { PaperOut } from "@/lib/apiTypes";
import type { Paper } from "@/data/papers";

// Helper to convert backend PaperOut to frontend Paper format
export const convertPaperOutToPaper = (paperOut: PaperOut, tagMap: Record<number, string>): Paper => {
    return {
        id: String(paperOut.id),
        title: paperOut.title,
        authors: paperOut.authors || [],
        year: paperOut.year,
        venue: "",
        tags: paperOut.tags?.map(tagId => tagMap[tagId] || String(tagId)) || [],
        abstract: paperOut.short,
        pdfUrl: paperOut.raw_url ? paperOut.raw_url.replace("arxiv.org/pdf/", "arxiv.org/abs/").replace(".pdf", "") : paperOut.raw_url,
        imageUrl: paperOut.image_url, // PaperCard will resolve this using resolveImageUrl
        metrics: {
            trendingScore: 0,
            recencyScore: paperOut.year >= new Date().getFullYear() - 1 ? 10 : 5,
            citations: 0,
        },
    };
};
