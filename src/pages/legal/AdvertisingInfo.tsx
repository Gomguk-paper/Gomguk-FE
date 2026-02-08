import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdvertisingInfo() {
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
                    <h1 className="text-xl font-bold font-display">광고 정보</h1>
                </div>
            </header>

            <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <h2>광고 및 마케팅 정보</h2>
                    <p className="text-muted-foreground">최종 업데이트: 2024년 1월</p>

                    <h3>1. 광고 정책</h3>
                    <p>
                        Gomguk은 사용자에게 관련성 높은 콘텐츠와 함께 서비스를 무료로 제공하기 위해
                        광고를 게재할 수 있습니다. 우리는 사용자 경험을 해치지 않으면서도
                        가치 있는 정보를 제공하는 광고를 추구합니다.
                    </p>

                    <h3>2. 광고의 종류</h3>
                    <p>Gomguk에서 제공될 수 있는 광고의 유형:</p>
                    <ul>
                        <li>
                            <strong>디스플레이 광고:</strong> 웹사이트의 지정된 영역에 표시되는 배너 형태의 광고
                        </li>
                        <li>
                            <strong>추천 콘텐츠:</strong> 사용자의 관심사에 기반한 연구자, 기관, 서비스 추천
                        </li>
                        <li>
                            <strong>스폰서 콘텐츠:</strong> 명확히 표시된 후원 논문 또는 연구 프로젝트
                        </li>
                    </ul>

                    <h3>3. 맞춤형 광고</h3>
                    <p>
                        우리는 사용자에게 더 관련성 높은 광고를 제공하기 위해 다음 정보를 사용할 수 있습니다:
                    </p>
                    <ul>
                        <li>검색 기록 및 관심 주제</li>
                        <li>클릭 및 상호작용 패턴</li>
                        <li>사용자가 제공한 연구 분야 정보</li>
                        <li>기기 정보 및 위치 (대략적인 지역)</li>
                    </ul>

                    <h3>4. 광고 선택 및 제어</h3>
                    <p>사용자는 다음과 같은 방법으로 광고 경험을 제어할 수 있습니다:</p>

                    <h4>맞춤형 광고 옵트아웃</h4>
                    <p>
                        설정 메뉴에서 맞춤형 광고를 비활성화할 수 있습니다.
                        이 경우에도 광고는 계속 표시되지만, 사용자의 관심사와 관련성이 낮을 수 있습니다.
                    </p>

                    <h4>광고 차단</h4>
                    <p>
                        브라우저의 광고 차단 확장 프로그램을 사용할 수 있지만,
                        이는 일부 서비스 기능에 영향을 줄 수 있습니다.
                    </p>

                    <h3>5. 제3자 광고 파트너</h3>
                    <p>
                        Gomguk은 다음과 같은 제3자 광고 서비스를 사용할 수 있습니다:
                    </p>
                    <ul>
                        <li>Google AdSense</li>
                        <li>기타 광고 네트워크 (필요시 업데이트)</li>
                    </ul>
                    <p>
                        이러한 파트너들은 자체 쿠키 및 추적 기술을 사용할 수 있으며,
                        각 파트너의 개인정보 보호정책에 따라 관리됩니다.
                    </p>

                    <h3>6. 광고 투명성</h3>
                    <p>
                        모든 유료 콘텐츠 및 스폰서 항목은 명확하게 표시됩니다:
                    </p>
                    <ul>
                        <li>"광고" 또는 "Sponsored" 레이블</li>
                        <li>시각적으로 구분되는 디자인</li>
                        <li>광고주 정보 제공</li>
                    </ul>

                    <h3>7. 부적절한 광고 신고</h3>
                    <p>
                        부적절하거나 오해의 소지가 있는 광고를 발견하신 경우,
                        즉시 신고해주시기 바랍니다. 우리는 모든 신고를 검토하고
                        필요한 조치를 취하겠습니다.
                    </p>

                    <div className="mt-8 p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                            <strong>광고 관련 문의</strong><br />
                            이메일: ads@gomguk.com<br />
                            <br />
                            광고 정책에 대한 추가 질문이나 부적절한 광고 신고는
                            위 이메일로 연락주시기 바랍니다.
                        </p>
                    </div>

                    <h3>8. 정책 변경</h3>
                    <p>
                        이 광고 정책은 변경될 수 있으며, 중요한 변경사항은
                        웹사이트를 통해 공지됩니다. 정책 변경 후에도 서비스를 계속
                        이용하시는 경우, 변경된 정책에 동의하는 것으로 간주됩니다.
                    </p>
                </div>
            </div>
        </main>
    );
}
