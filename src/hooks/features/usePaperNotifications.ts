import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export const usePaperNotifications = (sortedPapers: any[], user: any, prefs: any) => {
    const { addNotification, getNotifications } = useStore();

    useEffect(() => {
        if (!user || !prefs) return;

        const existingNotifications = getNotifications();
        const existingPaperIds = new Set(existingNotifications.map((n: any) => n.paperId));

        // 관심 태그와 매칭되는 논문에 대한 알림 생성
        if (prefs.tags && prefs.tags.length > 0) {
            sortedPapers.forEach((paper: any) => {
                // 이미 알림이 있으면 스킵
                if (existingPaperIds.has(paper.id)) return;

                // 관심 태그와 매칭되는지 확인
                const hasMatchingTag = prefs.tags!.some((prefTag: any) =>
                    paper.tags?.some((tag: string) => tag.toLowerCase() === prefTag.name.toLowerCase())
                );

                if (hasMatchingTag) {
                    addNotification({
                        type: "tag_match",
                        paperId: paper.id,
                        title: paper.title,
                        message: `관심 태그와 매칭되는 새로운 논문이 추천되었습니다.`,
                    });
                    existingPaperIds.add(paper.id); // 중복 방지
                }
            });
        }

        // 새로운 추천 논문 알림 (상위 3개)
        sortedPapers.slice(0, 3).forEach((paper: any) => {
            if (existingPaperIds.has(paper.id)) return;

            addNotification({
                type: "new_recommendation",
                paperId: paper.id,
                title: paper.title,
                message: `오늘의 추천 논문입니다.`,
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, prefs?.tags?.length, sortedPapers]); // sortedPapers dependencies added to trigger on new papers
};
