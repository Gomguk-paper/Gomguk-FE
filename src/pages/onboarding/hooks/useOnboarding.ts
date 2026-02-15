import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { setStoredPrefs } from "@/lib/authStorage";
import { UI_CONSTANTS, ROUTES } from "@/core/config/constants";

export type Step = "tags" | "weights" | "level";

export const levels = [
    { value: "undergraduate", label: "학부생", desc: "기초부터 차근차근" },
    { value: "graduate", label: "대학원생", desc: "연구 동향 파악" },
    { value: "researcher", label: "연구자", desc: "심층 분석 필요" },
    { value: "practitioner", label: "실무자", desc: "빠른 트렌드 추적" },
] as const;

export const useOnboarding = () => {
    const nav = useNavigate();
    const [searchParams] = useSearchParams();
    const { setPrefs, prefs } = useStore();
    const fromSettings = searchParams.get("reset") === "true";

    const [step, setStep] = useState<Step>("tags");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagWeights, setTagWeights] = useState<Record<string, number>>({});
    const [level, setLevel] = useState<typeof levels[number]["value"]>(
        prefs?.level || "undergraduate"
    );

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags((prev) => prev.filter((t) => t !== tag));
            const newWeights = { ...tagWeights };
            delete newWeights[tag];
            setTagWeights(newWeights);
        } else {
            setSelectedTags((prev) => [...prev, tag]);
            setTagWeights((prev) => ({
                ...prev,
                [tag]: UI_CONSTANTS.ONBOARDING.DEFAULT_TAG_WEIGHT,
            }));
        }
    };

    const setWeight = (tag: string, weight: number) => {
        setTagWeights((prev) => ({ ...prev, [tag]: weight }));
    };

    const handleComplete = () => {
        const nextPrefs = {
            tags: selectedTags.map((name) => ({
                name,
                weight: tagWeights[name] || UI_CONSTANTS.ONBOARDING.DEFAULT_TAG_WEIGHT,
            })),
            level,
            dailyCount: UI_CONSTANTS.ONBOARDING.DEFAULT_DAILY_COUNT,
        };
        setPrefs(nextPrefs);
        setStoredPrefs(nextPrefs);
        nav(ROUTES.HOME);
    };

    const handleSkip = () => {
        // 설정에서 재진입한 경우, 기존 설정을 유지하고 홈으로 이동
        if (fromSettings && prefs) {
            nav(ROUTES.HOME);
            return;
        }
        const defaultPrefs = {
            tags: [],
            level: "undergraduate" as const,
            dailyCount: UI_CONSTANTS.ONBOARDING.DEFAULT_DAILY_COUNT,
        };
        setPrefs(defaultPrefs);
        setStoredPrefs(defaultPrefs);
        nav(ROUTES.HOME);
    };

    const nextStep = () => {
        if (step === "tags") setStep("weights");
        else if (step === "weights") {
            if (fromSettings) {
                handleComplete();
            } else {
                setStep("level");
            }
        } else handleComplete();
    };

    const prevStep = () => {
        if (step === "weights") setStep("tags");
        else if (step === "level") setStep("weights");
    };

    const canProceed = () => {
        if (step === "tags")
            return selectedTags.length >= UI_CONSTANTS.PAPER.MIN_TAGS_FOR_ONBOARDING;
        return true;
    };

    return {
        step,
        selectedTags,
        tagWeights,
        level,
        fromSettings,
        toggleTag,
        setWeight,
        setLevel,
        nextStep,
        prevStep,
        handleSkip,
        canProceed,
    };
};
