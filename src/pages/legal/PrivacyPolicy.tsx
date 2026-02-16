import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
                    <h1 className="text-xl font-bold font-display">개인정보처리방침</h1>
                </div>
            </header>

            <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <h2>개인정보처리방침</h2>
                    <p className="text-muted-foreground">최종 업데이트: 2024년 1월</p>

                    <h3>1. 개인정보의 수집 및 이용 목적</h3>
                    <p>
                        Gomguk Corp.(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.
                        처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
                        이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                    </p>
                    <ol>
                        <li>회원 가입 및 관리: 회원 가입 의사 확인, 회원제 서비스 제공, 본인 식별·인증</li>
                        <li>서비스 제공: 논문 검색 및 추천, 개인화 콘텐츠 제공, 서비스 이용 기록 분석</li>
                        <li>마케팅 및 광고 활용: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공</li>
                    </ol>

                    <h3>2. 수집하는 개인정보의 항목</h3>
                    <p>회사는 다음과 같은 개인정보를 수집합니다:</p>
                    <h4>필수 항목</h4>
                    <ul>
                        <li>OAuth 로그인 시: 이메일, 이름, 프로필 이미지</li>
                        <li>서비스 이용 과정에서 자동 수집: IP 주소, 쿠키, 방문 일시, 서비스 이용 기록</li>
                    </ul>
                    <h4>선택 항목</h4>
                    <ul>
                        <li>연구 분야, 관심 주제, 소속 기관</li>
                    </ul>

                    <h3>3. 개인정보의 처리 및 보유 기간</h3>
                    <p>
                        회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
                        개인정보를 처리·보유합니다.
                    </p>
                    <ul>
                        <li>회원 정보: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지)</li>
                        <li>서비스 이용 기록: 3년</li>
                    </ul>

                    <h3>4. 개인정보의 제3자 제공</h3>
                    <p>
                        회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
                        다만, 다음의 경우에는 예외로 합니다:
                    </p>
                    <ul>
                        <li>이용자가 사전에 동의한 경우</li>
                        <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                    </ul>

                    <h3>5. 개인정보의 파기</h3>
                    <p>
                        회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                    </p>

                    <h3>6. 이용자의 권리</h3>
                    <p>이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:</p>
                    <ul>
                        <li>개인정보 조회, 수정</li>
                        <li>개인정보 처리정지 요구</li>
                        <li>개인정보 삭제 요구</li>
                        <li>회원 탈퇴 (동의 철회)</li>
                    </ul>

                    <h3>7. 개인정보 보호책임자</h3>
                    <p>
                        회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및
                        피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                    </p>

                    <div className="mt-8 p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                            <strong>개인정보 보호책임자</strong><br />
                            이름: Gomguk Privacy Officer<br />
                            이메일: privacy@gomguk.com
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
