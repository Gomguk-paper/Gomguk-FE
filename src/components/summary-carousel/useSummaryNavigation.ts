import { useState, useCallback, useEffect } from "react";
import { Paper } from "@/models";

export type SummaryStep = "hook" | "keypoints" | "detailed";

export function useSummaryNavigation(
    papers: Paper[],
    initialIndex: number,
    open: boolean,
    onClose: () => void
) {
    const [currentPaperIndex, setCurrentPaperIndex] = useState(initialIndex);
    const [currentStep, setCurrentStep] = useState<SummaryStep>("hook");

    useEffect(() => {
        if (open) {
            setCurrentPaperIndex(initialIndex);
            setCurrentStep("hook");
        }
    }, [open, initialIndex]);

    const goNextStep = useCallback(() => {
        setCurrentStep((step) => {
            if (step === "hook") return "keypoints";
            if (step === "keypoints") return "detailed";
            return "detailed";
        });
    }, []);

    const goNextPaper = useCallback(() => {
        if (currentPaperIndex < papers.length - 1) {
            setCurrentPaperIndex(currentPaperIndex + 1);
            setCurrentStep("hook");
        }
    }, [currentPaperIndex, papers.length]);

    const goPrevPaper = useCallback(() => {
        if (currentPaperIndex > 0) {
            setCurrentPaperIndex(currentPaperIndex - 1);
            setCurrentStep("hook");
        }
    }, [currentPaperIndex]);

    const goToPaper = useCallback((targetIndex: number) => {
        if (targetIndex >= 0 && targetIndex < papers.length) {
            setCurrentPaperIndex(targetIndex);
            setCurrentStep("hook");
        }
    }, [papers.length]);


    // Keyboard navigation
    useEffect(() => {
        if (!open) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key === "ArrowRight") {
                goNextPaper();
                return;
            }
            if (e.key === "ArrowLeft") {
                goPrevPaper();
                return;
            }
            if (e.key !== "Escape" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") {
                goNextStep();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [open, goNextStep, goNextPaper, goPrevPaper, onClose]);

    return {
        currentPaperIndex,
        currentStep,
        goNextStep,
        goNextPaper,
        goPrevPaper,
        goToPaper
    };
}
