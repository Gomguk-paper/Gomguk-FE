import { Report, papers } from "@/data/papers";
import { TagChip } from "./TagChip";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const navigate = useNavigate();
  
  const handleViewPapers = () => {
    const tagQuery = report.tags[0];
    navigate(`/search?tag=${tagQuery}`);
  };

  return (
    <article className="bg-card rounded-lg border shadow-card p-4 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {report.tags.map(tag => (
          <TagChip key={tag} tag={tag} size="sm" />
        ))}
      </div>
      
      <h3 className="font-display font-semibold text-base leading-snug">
        {report.title}
      </h3>
      
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {report.summary}
      </p>
      
      <button
        onClick={handleViewPapers}
        className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
      >
        관련 논문 {report.relatedPaperIds.length}편 보기
        <ArrowRight className="w-4 h-4" />
      </button>
    </article>
  );
}
