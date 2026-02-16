import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
                    <h1 className="text-xl font-bold font-display">이용약관</h1>
                </div>
            </header>

            <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <h2>Gomguk 서비스 이용약관</h2>
                    <p className="text-muted-foreground">최종 업데이트: 2024년 1월</p>

                    <h3>제1조 (목적)</h3>
                    <p>
                        본 약관은 Gomguk Corp.(이하 "회사")가 제공하는 논문 검색 및 추천 서비스(이하 "서비스")의 이용과 관련하여
                        회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>

                    <h3>제2조 (정의)</h3>
                    <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
                    <ol>
                        <li>"서비스"란 회사가 제공하는 논문 검색, 추천, 요약 및 관련 부가서비스를 의미합니다.</li>
                        <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                        <li>"회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 자를 의미합니다.</li>
                    </ol>

                    <h3>제3조 (약관의 효력 및 변경)</h3>
                    <p>
                        본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.
                        회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며,
                        변경된 약관은 서비스 내 공지사항을 통해 공지됩니다.
                    </p>

                    <h3>제4조 (서비스의 제공)</h3>
                    <p>회사는 다음과 같은 서비스를 제공합니다:</p>
                    <ol>
                        <li>학술 논문 검색 및 탐색 서비스</li>
                        <li>개인화된 논문 추천 서비스</li>
                        <li>논문 요약 및 분석 서비스</li>
                        <li>연구자 정보 및 트렌드 분석 서비스</li>
                        <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
                    </ol>

                    <h3>제5조 (이용자의 의무)</h3>
                    <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
                    <ol>
                        <li>타인의 정보 도용</li>
                        <li>회사가 게시한 정보의 변경</li>
                        <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                        <li>회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                        <li>서비스의 안정적인 운영을 방해하는 행위</li>
                    </ol>

                    <h3>제6조 (저작권의 귀속 및 이용제한)</h3>
                    <p>
                        서비스에서 제공하는 모든 콘텐츠에 대한 저작권은 회사 또는 원저작자에게 귀속됩니다.
                        이용자는 서비스를 이용함으로써 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여
                        영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
                    </p>

                    <h3>제7조 (책임의 제한)</h3>
                    <p>
                        회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
                        서비스 제공에 관한 책임이 면제됩니다.
                    </p>

                    <h3>제8조 (분쟁의 해결)</h3>
                    <p>
                        본 약관에 명시되지 않은 사항은 관련 법령에 따르며, 서비스 이용과 관련하여 발생한 분쟁에 대해서는
                        대한민국 법을 준거법으로 합니다.
                    </p>

                    <div className="mt-8 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            문의사항이 있으시면 고객지원 센터로 연락주시기 바랍니다.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
