import { useState, useMemo, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useSummaryQuery } from "@/hooks/queries/useSummaryQuery";
import { useTrendingTags } from "@/contexts/TrendingTagsContext";
import type { Paper } from "@/models";
import { resolveImageUrl } from "@/lib/imageUtils";

interface UsePaperCardProps {
    paper: Paper;
    onOpenSummary?: () => void;
}

export function usePaperCard({ paper, onOpenSummary }: UsePaperCardProps) {
    const {
        user,
        prefs,
        getAction,
        toggleLike,
        toggleSave,
        hidePaper,
        excludeTag,
        hiddenPapers,
        excludedTags,
        undoHidePaper
    } = useStore();

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [hideToastPhase, setHideToastPhase] = useState<"show" | "fade" | "gone">("show");
    const hideToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data: summaryFromApi } = useSummaryQuery(paper.id);
    const { isTrendingTag } = useTrendingTags();
    const action = getAction(paper.id);
    const isLiked = action?.liked || false;
    const isSaved = action?.saved || false;
    const titleText = summaryFromApi?.hook ?? paper.summary?.hook ?? paper.title ?? "";
    const canUseActions = Boolean(user);
    const authMessage = !user ? "로그인 후 좋아요/저장 기능을 사용할 수 있어요." : null;

    const handleActionClick = (action: () => void) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        action();
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // 버튼이나 링크 클릭 시에는 카드 클릭 이벤트 무시
        if (
            (e.target as HTMLElement).closest("button") ||
            (e.target as HTMLElement).closest("a") ||
            (e.target as HTMLElement).closest('[role="button"]')
        ) {
            return;
        }
        if (onOpenSummary) {
            onOpenSummary();
        }
    };

    const isHidden = hiddenPapers[paper.id];
    const isExcludedTag = paper.tags.some(tag => excludedTags[tag]);

    // 숨기기 토스트: 2.5초 표시 후 페이드아웃 → 사라짐
    useEffect(() => {
        if (!isHidden) {
            hideToastTimerRef.current && clearTimeout(hideToastTimerRef.current);
            hideToastTimerRef.current = null;
            return;
        }
        setHideToastPhase("show");
        hideToastTimerRef.current = setTimeout(() => {
            setHideToastPhase("fade");
            hideToastTimerRef.current = setTimeout(() => {
                setHideToastPhase("gone");
                hideToastTimerRef.current = null;
            }, 100);
        }, 1500);
        return () => {
            if (hideToastTimerRef.current) clearTimeout(hideToastTimerRef.current);
            hideToastTimerRef.current = null;
        };
    }, [isHidden]);

    // 추천 이유 계산 (tooltip용)
    const recommendationReason = useMemo(() => {
        if (prefs?.tags) {
            const matchedTags = paper.tags.filter(t =>
                prefs.tags.some(pt => pt.name.toLowerCase() === t.toLowerCase())
            );
            if (matchedTags.length > 0) {
                const highestWeight = prefs.tags
                    .filter(pt => matchedTags.some(t => t.toLowerCase() === pt.name.toLowerCase()))
                    .sort((a, b) => b.weight - a.weight)[0];
                if (highestWeight) {
                    return `당신이 #${highestWeight.name}에 관심도 ${highestWeight.weight}를 설정했어요`;
                }
            }
        }
        if (paper.metrics.trendingScore >= 90) {
            return "이번 주 급상승 논문이에요";
        }
        if (paper.metrics.recencyScore >= 80) {
            return "최근에 발표된 따끈따끈한 연구예요";
        }
        return "해당 분야의 중요한 논문으로 선정되었어요";
    }, [paper, prefs]);

    // Summary logic
    const summaryContent = paper.summary?.points?.length
        ? paper.summary.points[0]
        : paper.summary?.hook ?? summaryFromApi?.hook;

    return {
        // State
        showLoginModal,
        setShowLoginModal,
        hideToastPhase,
        isHidden,
        isExcludedTag,

        // Data
        isLiked,
        isSaved,
        titleText,
        canUseActions,
        authMessage,
        recommendationReason,
        isTrendingTag,
        summaryContent,
        summaryFromApi,
        imageUrl: paper.imageUrl ? resolveImageUrl(paper.imageUrl) : null,

        // Handlers
        handleActionClick,
        handleCardClick,
        toggleLike,
        toggleSave,
        undoHidePaper,
        hidePaper,
        excludeTag,
    };
}
