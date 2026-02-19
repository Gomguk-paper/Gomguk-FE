import { useState } from "react";
import { Users, Calendar, TrendingUp, Award, Star } from "lucide-react";
import { Paper } from "@/models";

interface SummaryMetadataProps {
    paper: Paper;
}

export function SummaryMetadata({ paper }: SummaryMetadataProps) {
    const [isAuthorsExpanded, setIsAuthorsExpanded] = useState(false);

    return (
        <div className="space-y-3 mb-10 p-4 bg-secondary/30 rounded-lg border">
            {/* Authors */}
            <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0 flex flex-wrap gap-2">
                    {(isAuthorsExpanded ? paper.authors : paper.authors.slice(0, 5)).map((authorName, idx) => (
                        <span key={idx} className="text-sm px-2 py-0.5 text-foreground cursor-default">
                            {authorName}
                        </span>
                    ))}
                    {!isAuthorsExpanded && paper.authors.length > 5 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAuthorsExpanded(true);
                            }}
                            className="text-sm px-2 py-0.5 text-muted-foreground hover:text-primary font-medium transition-colors"
                        >
                            +{paper.authors.length - 5}명 더보기
                        </button>
                    )}
                    {isAuthorsExpanded && paper.authors.length > 5 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAuthorsExpanded(false);
                            }}
                            className="text-sm px-2 py-0.5 text-muted-foreground hover:text-primary font-medium transition-colors"
                        >
                            접기
                        </button>
                    )}
                </div>
            </div>

            {/* Publication Info */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{paper.year}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        인용 {paper.metrics.citations.toLocaleString()}회
                    </span>
                </div>
            </div>

            {/* Metrics - 트렌딩/최신도/추천 점수 (0 포함 표시) */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    트렌딩 {(paper.metrics.trendingScore ?? 0).toFixed(1)}
                </div>
                <div className="px-2 py-1 bg-secondary text-muted-foreground text-xs rounded-full font-medium">
                    최신도 {(paper.metrics.recencyScore ?? 0).toFixed(1)}
                </div>
                <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    추천 {(paper.metrics.recommendScore ?? 0).toFixed(1)}
                </div>
            </div>
        </div>
    );
}
