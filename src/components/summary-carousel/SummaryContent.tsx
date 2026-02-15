import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

interface SummaryContentProps {
    summary: {
        hookOneLiner: string;
        keyPoints: string[];
        detailed: string;
        evidenceScope: "full" | "intro" | "abstract";
    };
}

export function SummaryContent({ summary }: SummaryContentProps) {
    return (
        <div className="space-y-8">
            {/* 한줄 요약 */}
            <div className="animate-fade-in">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    한줄 요약
                </span>
                <div className="text-2xl font-display font-medium mt-3 leading-relaxed prose prose-lg max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {`💡 ${summary.hookOneLiner}`}
                    </ReactMarkdown>
                </div>
            </div>

            {/* 핵심 포인트 */}
            <div className="animate-fade-in">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    핵심 포인트
                </span>
                <ul className="mt-4 space-y-3">
                    {summary.keyPoints.map((point, i) => (
                        <li
                            key={i}
                            className="flex gap-3 items-start text-lg"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <span className="text-primary font-bold">{i + 1}.</span>
                            <div className="flex-1 prose prose-base max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath, remarkGfm]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {point}
                                </ReactMarkdown>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 상세 설명 */}
            <div className="animate-fade-in">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    상세 설명
                </span>
                <div className="mt-4 text-base leading-relaxed text-foreground/90 prose prose-base max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {summary.detailed}
                    </ReactMarkdown>
                </div>
                <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                    <span className="text-xs text-muted-foreground">
                        📚 요약 근거:{" "}
                        {summary.evidenceScope === "full"
                            ? "전체 논문"
                            : summary.evidenceScope === "intro"
                                ? "서론 기반"
                                : "초록 기반"}
                    </span>
                </div>
            </div>
        </div>
    );
}
