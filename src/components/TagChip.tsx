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

export function TagChip({ tag, selected, trending, onClick, size = "md" }: TagChipProps) {
  const description = tagDescriptions[tag] || `${tag} 관련 논문`;

  const chipContent = (
    <div
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center leading-none pt-[1px] gap-1 rounded-full border font-medium transition-all",
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        "bg-secondary text-secondary-foreground border-border",
        selected && "ring-2 ring-primary ring-offset-1",
        onClick ? "hover:scale-105 cursor-pointer" : "cursor-default"
      )}
    >
      <span className={trending ? "text-red-500" : undefined}>#{tag}</span>
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
