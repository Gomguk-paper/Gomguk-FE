import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type LegalContentType = "terms" | "privacy" | "cookies" | "accessibility" | "advertising";

interface LegalModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contentType: LegalContentType | null;
}

const contentTitles: Record<LegalContentType, string> = {
    terms: "이용약관",
    privacy: "개인정보처리방침",
    cookies: "쿠키 정책",
    accessibility: "접근성",
    advertising: "광고 정보",
};

export function LegalModal({ open, onOpenChange, contentType }: LegalModalProps) {
    if (!contentType) return null;

    const title = contentTitles[contentType];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                </DialogHeader>
                <div className="prose prose-sm max-w-none dark:prose-invert mt-4">
                    {contentType === "terms" && <TermsContent />}
                    {contentType === "privacy" && <PrivacyContent />}
                    {contentType === "cookies" && <CookiesContent />}
                    {contentType === "accessibility" && <AccessibilityContent />}
                    {contentType === "advertising" && <AdvertisingContent />}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Terms of Service Content
function TermsContent() {
    return (
        <>
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
            </ol>

            <h3>제5조 (이용자의 의무)</h3>
            <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
            <ol>
                <li>타인의 정보 도용</li>
                <li>회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>서비스의 안정적인 운영을 방해하는 행위</li>
            </ol>
        </>
    );
}

// Privacy Policy Content
function PrivacyContent() {
    return (
        <>
            <p className="text-muted-foreground">최종 업데이트: 2024년 1월</p>

            <h3>1. 개인정보의 수집 및 이용 목적</h3>
            <p>
                Gomguk Corp.(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.
            </p>
            <ol>
                <li>회원 가입 및 관리</li>
                <li>서비스 제공: 논문 검색 및 추천, 개인화 콘텐츠 제공</li>
                <li>마케팅 및 광고 활용</li>
            </ol>

            <h3>2. 수집하는 개인정보의 항목</h3>
            <h4>필수 항목</h4>
            <ul>
                <li>OAuth 로그인 시: 이메일, 이름, 프로필 이미지</li>
                <li>서비스 이용 과정에서 자동 수집: IP 주소, 쿠키, 방문 일시</li>
            </ul>

            <h3>3. 개인정보의 처리 및 보유 기간</h3>
            <ul>
                <li>회원 정보: 회원 탈퇴 시까지</li>
                <li>서비스 이용 기록: 3년</li>
            </ul>

            <h3>4. 개인정보의 제3자 제공</h3>
            <p>
                회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            </p>

            <h3>5. 이용자의 권리</h3>
            <ul>
                <li>개인정보 조회, 수정</li>
                <li>개인정보 삭제 요구</li>
                <li>회원 탈퇴 (동의 철회)</li>
            </ul>
        </>
    );
}

// Cookie Policy Content
function CookiesContent() {
    return (
        <>
            <p className="text-muted-foreground">최종 업데이트: 2024년 1월</p>

            <h3>1. 쿠키란?</h3>
            <p>
                쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 작은 텍스트 파일입니다.
            </p>

            <h3>2. 쿠키의 사용 목적</h3>
            <ul>
                <li><strong>필수 쿠키:</strong> 로그인 세션 유지, 보안 인증</li>
                <li><strong>기능 쿠키:</strong> 사용자 설정 저장</li>
                <li><strong>분석 쿠키:</strong> 서비스 이용 통계</li>
            </ul>

            <h3>3. 쿠키 관리 방법</h3>
            <p>웹 브라우저의 설정을 통해 쿠키를 관리할 수 있습니다.</p>
            <ul>
                <li><strong>Chrome:</strong> 설정 → 개인정보 및 보안 → 쿠키</li>
                <li><strong>Safari:</strong> 환경설정 → 개인정보 보호</li>
                <li><strong>Firefox:</strong> 옵션 → 개인정보 및 보안</li>
            </ul>
        </>
    );
}

// Accessibility Content
function AccessibilityContent() {
    return (
        <>
            <p className="text-muted-foreground">최종 업데이트: 2024년 1월</p>

            <h3>1. 접근성에 대한 우리의 약속</h3>
            <p>
                Gomguk은 모든 사용자가 장애 여부와 관계없이 우리의 서비스를 이용할 수 있도록 최선을 다하고 있습니다.
            </p>

            <h3>2. 준수 표준</h3>
            <ul>
                <li><strong>WCAG 2.1</strong> Level AA</li>
                <li><strong>한국형 웹 콘텐츠 접근성 지침 2.1</strong></li>
            </ul>

            <h3>3. 접근성 기능</h3>
            <h4>키보드 탐색</h4>
            <ul>
                <li>모든 인터랙티브 요소는 키보드로 접근 가능</li>
                <li>명확한 포커스 표시</li>
            </ul>

            <h4>스크린 리더 지원</h4>
            <ul>
                <li>의미 있는 HTML 시맨틱 구조</li>
                <li>ARIA 레이블 및 설명</li>
            </ul>

            <h4>시각적 접근성</h4>
            <ul>
                <li>충분한 색상 대비</li>
                <li>다크 모드 지원</li>
                <li>텍스트 크기 조절 가능</li>
            </ul>
        </>
    );
}

// Advertising Info Content
function AdvertisingContent() {
    return (
        <>
            <p className="text-muted-foreground">최종 업데이트: 2024년 1월</p>

            <h3>1. 광고 정책</h3>
            <p>
                Gomguk은 사용자에게 관련성 높은 콘텐츠와 함께 서비스를 무료로 제공하기 위해
                광고를 게재할 수 있습니다.
            </p>

            <h3>2. 광고의 종류</h3>
            <ul>
                <li><strong>디스플레이 광고:</strong> 배너 형태의 광고</li>
                <li><strong>추천 콘텐츠:</strong> 사용자의 관심사에 기반한 추천</li>
                <li><strong>스폰서 콘텐츠:</strong> 명확히 표시된 후원 논문</li>
            </ul>

            <h3>3. 맞춤형 광고</h3>
            <p>더 관련성 높은 광고를 제공하기 위해 다음 정보를 사용할 수 있습니다:</p>
            <ul>
                <li>검색 기록 및 관심 주제</li>
                <li>클릭 및 상호작용 패턴</li>
            </ul>

            <h3>4. 광고 선택 및 제어</h3>
            <p>설정 메뉴에서 맞춤형 광고를 비활성화할 수 있습니다.</p>

            <h3>5. 광고 투명성</h3>
            <p>모든 유료 콘텐츠는 명확하게 "광고" 또는 "Sponsored" 레이블로 표시됩니다.</p>
        </>
    );
}
