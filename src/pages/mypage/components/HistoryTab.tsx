import { History } from "lucide-react";
import { PaperCard } from "@/components/PaperCard";

interface HistoryTabProps {
    readPapers: { id: string; [key: string]: unknown }[];
    onOpenSummary?: (paper: { id: string; [key: string]: unknown }) => void;
}

export function HistoryTab({ readPapers, onOpenSummary }: HistoryTabProps) {
    if (readPapers.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>읽은 논문이 없어요</p>
                <p className="text-sm mt-1">홈에서 논문을 탐색해보세요</p>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-3">
            {readPapers.map((paper) => (
                <div key={paper.id}>
                    <PaperCard
                        paper={paper}
                        onOpenSummary={() => onOpenSummary?.(paper)}
                    />
                </div>
            ))}
        </div>
    );
}
