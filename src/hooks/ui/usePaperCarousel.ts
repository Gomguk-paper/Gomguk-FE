import { useState } from "react";

export const usePaperCarousel = (sortedPapers: any[]) => {
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);

    const openCarousel = (index: number) => {
        setSelectedPaperIndex(index);
        setCarouselOpen(true);
    };

    const openCarouselByPaperId = (paperId: string) => {
        const index = sortedPapers.findIndex((p: any) => p.id === paperId);
        if (index !== -1) {
            openCarousel(index);
        }
    };

    const closeCarousel = () => {
        setCarouselOpen(false);
    };

    return {
        carouselOpen,
        selectedPaperIndex,
        openCarousel,
        openCarouselByPaperId,
        closeCarousel
    };
};
