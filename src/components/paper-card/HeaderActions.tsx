import { Sparkles, MoreVertical, EyeOff, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Paper } from "@/models";

interface HeaderActionsProps {
    paper: Paper;
    recommendationReason: string;
    hidePaper: (id: string) => void;
    excludeTag: (tag: string) => void;
    isOverlay?: boolean;
}

export function HeaderActions({ paper, recommendationReason, hidePaper, excludeTag, isOverlay }: HeaderActionsProps) {
    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-6 w-6 rounded-full p-0 transition-colors",
                            isOverlay
                                ? "bg-black/40 text-white hover:bg-black/60 hover:text-white backdrop-blur-[2px]"
                                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end" className="text-xs max-w-[220px]">
                    <p>{recommendationReason}</p>
                </TooltipContent>
            </Tooltip>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-6 w-6 rounded-full p-0 transition-colors",
                            isOverlay
                                ? "bg-black/40 text-white hover:bg-black/60 hover:text-white backdrop-blur-[2px]"
                                // ... existing lines ...
                                : "text-muted-foreground"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        hidePaper(paper.id);
                    }}>
                        <EyeOff className="w-4 h-4 mr-2" />
                        이 논문 숨기기
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Hash className="w-4 h-4 mr-2" />
                            태그 차단
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {paper.tags.map(tag => (
                                <DropdownMenuItem key={tag} onClick={(e) => {
                                    e.stopPropagation();
                                    excludeTag(tag);
                                }}>
                                    {tag}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
