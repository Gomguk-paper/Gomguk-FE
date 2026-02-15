import { PaperCard } from "@/components/PaperCard";
import { Bookmark } from "lucide-react";

interface SavedPapersTabProps {
    papers: any[];
    loading: boolean;
}

export function SavedPapersTab({ papers, loading }: SavedPapersTabProps) {
    if (loading) {
        return <div className="text-center py-12 text-muted-foreground">로딩 중...</div>;
    }

    if (papers.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>저장한 논문이 없어요</p>
                <p className="text-sm mt-1">홈에서 논문을 탐색해보세요</p>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-4">
            {papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
            ))}
        </div>
    );
}
