import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { tagDescriptions } from "@/data/tagDescriptions";

interface TagChipProps {
  tag: string;
  selected?: boolean;
  trending?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

const tagColorMap: Record<string, string> = {
  Transformer: "bg-tag-transformer/15 text-tag-transformer border-tag-transformer/30",
  NLP: "bg-tag-nlp/15 text-tag-nlp border-tag-nlp/30",
  Vision: "bg-tag-vision/15 text-tag-vision border-tag-vision/30",
  RL: "bg-tag-rl/15 text-tag-rl border-tag-rl/30",
  Diffusion: "bg-tag-diffusion/15 text-tag-diffusion border-tag-diffusion/30",
};

export function TagChip({ tag, selected, trending, onClick, size = "md" }: TagChipProps) {
  const colorClass = tagColorMap[tag] || "bg-secondary text-secondary-foreground border-border";
  const description = tagDescriptions[tag] || `${tag} 관련 논문`;

  const chipContent = (
    <div
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium transition-all",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        colorClass,
        selected && "ring-2 ring-primary ring-offset-1",
        trending && "animate-pulse",
        onClick ? "hover:scale-105 cursor-pointer" : "cursor-default"
      )}
    >
      {trending && <span className="text-trending">🔥</span>}#{tag}
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
