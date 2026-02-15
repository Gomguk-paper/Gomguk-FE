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
        pdfUrl: paperOut.raw_url,
        imageUrl: imageUrl,
        metrics: {
            trendingScore: 0, // Not provided by backend
            recencyScore: paperOut.year >= new Date().getFullYear() - 1 ? 10 : 5,
            citations: 0, // Not provided by backend
        },
    };
};
