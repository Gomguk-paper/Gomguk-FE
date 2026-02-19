import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Paper } from "@/models";
import { useStore } from "@/store/useStore";
import { TagChip } from "./TagChip";
import { TrendingUp, Clock, Star } from "lucide-react";

interface WhyThisModalProps {
  paper: Paper;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhyThisModal({ paper, open, onOpenChange }: WhyThisModalProps) {
  const { prefs } = useStore();
  
  // Calculate why this paper was recommended (mock logic)
  const reasons: { icon: React.ReactNode; text: string }[] = [];
  
  // Check tag matches
  if (prefs?.tags) {
    const matchedTags = paper.tags.filter(t => 
      prefs.tags.some(pt => pt.name.toLowerCase() === t.toLowerCase())
    );
    if (matchedTags.length > 0) {
      const highestWeight = prefs.tags
        .filter(pt => matchedTags.some(t => t.toLowerCase() === pt.name.toLowerCase()))
        .sort((a, b) => b.weight - a.weight)[0];
      
      if (highestWeight) {
        reasons.push({
          icon: <Star className="w-4 h-4 text-primary" />,
          text: `당신이 #${highestWeight.name}에 관심도 ${highestWeight.weight}를 설정했어요`
        });
      }
    }
  }
  
  // Trending
  if (paper.metrics.trendingScore >= 90) {
    reasons.push({
      icon: <TrendingUp className="w-4 h-4 text-trending" />,
      text: "이번 주 급상승 논문이에요 🔥"
    });
  }
  
  // Recency
  if (paper.metrics.recencyScore >= 80) {
    reasons.push({
      icon: <Clock className="w-4 h-4 text-accent" />,
      text: "최근에 발표된 따끈따끈한 연구예요"
    });
  }
  
  // Default if no specific reasons
  if (reasons.length === 0) {
    reasons.push({
      icon: <Star className="w-4 h-4 text-muted-foreground" />,
      text: "해당 분야의 중요한 논문으로 선정되었어요"
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">왜 이 논문을 추천했을까요?</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {paper.tags.map(tag => (
              <TagChip key={tag} tag={tag} size="sm" />
            ))}
          </div>
          
          <h4 className="font-medium text-sm">{paper.title || "논문제목이 없습니다"}</h4>
          
          <div className="space-y-3">
            {reasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                {reason.icon}
                <span className="text-sm">{reason.text}</span>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            추천 알고리즘은 관심 태그, 트렌드, 최신성을 기반으로 합니다
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
