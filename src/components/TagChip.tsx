import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { tagDescriptions } from "@/data/tagDescriptions";

interface TagChipProps {
  tag: string;
  selected?: boolean;
  /** 관심태그(설정한 분야): 핑크. trending과 겹치면 이쪽 우선 */
  interest?: boolean;
  /** 트렌딩 토픽: 하늘색 */
  trending?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

export function TagChip({ tag, selected, interest, trending, onClick, size = "md" }: TagChipProps) {
  const description = tagDescriptions[tag] || `${tag} 관련 논문`;
  const isInterest = Boolean(interest);
  const isTrendingOnly = Boolean(trending) && !isInterest;

  const chipContent = (
    <div
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium transition-all",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        "bg-secondary text-secondary-foreground border-border",
        isInterest &&
          "bg-[hsl(var(--tag-interest)/0.15)] text-[hsl(var(--tag-interest))] border-[hsl(var(--tag-interest)/0.5)]",
        isTrendingOnly &&
          "bg-[hsl(var(--tag-trending)/0.15)] text-[hsl(var(--tag-trending))] border-[hsl(var(--tag-trending)/0.5)]",
        selected && "ring-2 ring-primary ring-offset-1",
        onClick ? "hover:scale-105 cursor-pointer" : "cursor-default"
      )}
    >
      <span>#{tag}</span>
    </div>
  );

  if (onClick) {
    return chipContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{chipContent}</TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
