import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { setStoredPrefs } from "@/lib/authStorage";
import { allTags } from "@/data/papers";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Star, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "tags" | "weights" | "level" | "count";

const levels = [
  { value: "undergraduate", label: "학부생", desc: "기초부터 차근차근" },
  { value: "graduate", label: "대학원생", desc: "연구 동향 파악" },
  { value: "researcher", label: "연구자", desc: "심층 분석 필요" },
  { value: "practitioner", label: "실무자", desc: "빠른 트렌드 추적" },
] as const;

export default function Onboarding() {
  const navigate = useNavigate();
  const { setPrefs } = useStore();
  
  const [step, setStep] = useState<Step>("tags");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagWeights, setTagWeights] = useState<Record<string, number>>({});
  const [level, setLevel] = useState<typeof levels[number]["value"]>("undergraduate");
  const [dailyCount, setDailyCount] = useState(10);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
      const newWeights = { ...tagWeights };
      delete newWeights[tag];
      setTagWeights(newWeights);
    } else {
      setSelectedTags(prev => [...prev, tag]);
      setTagWeights(prev => ({ ...prev, [tag]: 3 }));
    }
  };

  const setWeight = (tag: string, weight: number) => {
    setTagWeights(prev => ({ ...prev, [tag]: weight }));
  };

  const handleComplete = () => {
    const nextPrefs = {
      tags: selectedTags.map(name => ({ name, weight: tagWeights[name] || 3 })),
      level,
      dailyCount,
    };
    setPrefs(nextPrefs);
    setStoredPrefs(nextPrefs);
    navigate("/");
  };

  const nextStep = () => {
    if (step === "tags") setStep("weights");
    else if (step === "weights") setStep("level");
    else if (step === "level") setStep("count");
    else handleComplete();
  };

  const prevStep = () => {
    if (step === "weights") setStep("tags");
    else if (step === "level") setStep("weights");
    else if (step === "count") setStep("level");
  };

  const canProceed = () => {
    if (step === "tags") return selectedTags.length >= 3;
    return true;
  };

  return (
    <main className="min-h-screen flex flex-col p-6 bg-background">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {["tags", "weights", "level", "count"].map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              (["tags", "weights", "level", "count"].indexOf(step) >= i) 
                ? "bg-primary" 
                : "bg-muted"
            )}
          />
        ))}
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full">
        {/* Step 1: Tag Selection */}
        {step === "tags" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="font-display text-2xl font-bold">관심 분야를 선택하세요</h1>
              <p className="text-muted-foreground mt-2">최소 3개를 선택해주세요</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <TagChip
                  key={tag}
                  tag={tag}
                  selected={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              선택됨: {selectedTags.length}개
            </p>
          </div>
        )}

        {/* Step 2: Tag Weights */}
        {step === "weights" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="font-display text-2xl font-bold">관심도를 설정하세요</h1>
              <p className="text-muted-foreground mt-2">각 분야별 관심 정도를 별점으로</p>
            </div>
            
            <div className="space-y-4">
              {selectedTags.map(tag => (
                <div key={tag} className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                  <TagChip tag={tag} size="sm" />
                  <div className="flex-1" />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(w => (
                      <button
                        key={w}
                        onClick={() => setWeight(tag, w)}
                        className="p-1"
                      >
                        <Star 
                          className={cn(
                            "w-5 h-5 transition-colors",
                            w <= (tagWeights[tag] || 3) 
                              ? "fill-primary text-primary" 
                              : "text-muted"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Level Selection */}
        {step === "level" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="font-display text-2xl font-bold">당신은 누구신가요?</h1>
              <p className="text-muted-foreground mt-2">맞춤형 요약 난이도를 조절해요</p>
            </div>
            
            <div className="space-y-3">
              {levels.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-all",
                    level === l.value 
                      ? "border-primary bg-primary/5 ring-2 ring-primary" 
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div className="font-medium">{l.label}</div>
                  <div className="text-sm text-muted-foreground">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Daily Count */}
        {step === "count" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="font-display text-2xl font-bold">하루에 몇 개?</h1>
              <p className="text-muted-foreground mt-2">받아볼 논문 추천 개수를 설정하세요</p>
            </div>
            
            <div className="space-y-6 py-8">
              <div className="text-center">
                <span className="text-5xl font-bold text-primary">{dailyCount}</span>
                <span className="text-2xl text-muted-foreground ml-2">개</span>
              </div>
              
              <Slider
                value={[dailyCount]}
                onValueChange={([v]) => setDailyCount(v)}
                min={5}
                max={30}
                step={5}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>5개</span>
                <span>30개</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8 max-w-lg mx-auto w-full">
        {step !== "tags" && (
          <Button variant="outline" onClick={prevStep} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            이전
          </Button>
        )}
        <Button 
          className="flex-1 gap-2" 
          onClick={nextStep}
          disabled={!canProceed()}
        >
          {step === "count" ? "완료" : "다음"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </main>
  );
}
