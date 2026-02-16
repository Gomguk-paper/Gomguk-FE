import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Accessibility() {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen mobile-content-padding bg-background">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b mobile-safe-area-pt">
                <div className="p-4 max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="h-9 w-9"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold font-display">접근성</h1>
                </div>
            </header>

            <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <h2>웹 접근성 정책</h2>
                    <p className="text-muted-foreground">최종 업데이트: 2024년 1월</p>

                    <h3>1. 접근성에 대한 우리의 약속</h3>
                    <p>
                        Gomguk은 모든 사용자가 장애 여부와 관계없이 우리의 서비스를 이용할 수 있도록 최선을 다하고 있습니다.
                        우리는 웹 접근성 표준을 준수하며, 모든 사람이 독립적으로 우리 서비스를 사용할 수 있도록 지속적으로 개선하고 있습니다.
                    </p>

                    <h3>2. 준수 표준</h3>
                    <p>Gomguk은 다음 접근성 표준을 준수하기 위해 노력합니다:</p>
                    <ul>
                        <li>
                            <strong>WCAG 2.1</strong> (Web Content Accessibility Guidelines) Level AA
                        </li>
                        <li>
                            <strong>한국형 웹 콘텐츠 접근성 지침 2.1</strong>
                        </li>
                        <li>
                            <strong>장애인차별금지법</strong>에 따른 웹 접근성 요구사항
                        </li>
                    </ul>

                    <h3>3. 접근성 기능</h3>
                    <p>우리 서비스는 다음과 같은 접근성 기능을 제공합니다:</p>

                    <h4>키보드 탐색</h4>
                    <ul>
                        <li>모든 인터랙티브 요소는 키보드로 접근 가능</li>
                        <li>Tab 키를 사용한 순차적 탐색</li>
                        <li>명확한 포커스 표시</li>
                    </ul>

                    <h4>스크린 리더 지원</h4>
                    <ul>
                        <li>의미 있는 HTML 시맨틱 구조</li>
                        <li>ARIA 레이블 및 설명</li>
                        <li>이미지에 대한 대체 텍스트</li>
                    </ul>

                    <h4>시각적 접근성</h4>
                    <ul>
                        <li>충분한 색상 대비 (WCAG AA 기준 이상)</li>
                        <li>다크 모드 지원</li>
                        <li>텍스트 크기 조절 가능</li>
                        <li>색상에만 의존하지 않는 정보 전달</li>
                    </ul>

                    <h4>모션 및 애니메이션</h4>
                    <ul>
                        <li>prefers-reduced-motion 설정 존중</li>
                        <li>자동 재생되는 콘텐츠 제어 옵션</li>
                    </ul>

                    <h3>4. 알려진 제한사항</h3>
                    <p>
                        현재 다음과 같은 접근성 개선이 진행 중입니다:
                    </p>
                    <ul>
                        <li>PDF 문서의 완전한 접근성 지원</li>
                        <li>일부 복잡한 차트 및 그래프의 대체 텍스트 개선</li>
                    </ul>

                    <h3>5. 피드백 및 지원</h3>
                    <p>
                        접근성 관련 문제를 발견하셨거나 개선 제안이 있으시면 언제든지 연락주시기 바랍니다.
                        우리는 모든 피드백을 소중히 여기며, 지속적인 개선을 위해 노력하겠습니다.
                    </p>

                    <div className="mt-8 p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                            <strong>접근성 담당자</strong><br />
                            이메일: accessibility@gomguk.com<br />
                            <br />
                            우리는 접근성 문의에 대해 영업일 기준 3일 이내에 답변드리기 위해 노력합니다.
                        </p>
                    </div>

                    <h3>6. 기술적 사양</h3>
                    <p>
                        이 웹사이트는 다음 기술들을 사용하여 접근성을 보장합니다:
                    </p>
                    <ul>
                        <li>HTML5</li>
                        <li>WAI-ARIA</li>
                        <li>CSS3</li>
                        <li>JavaScript (점진적 향상 원칙 적용)</li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
