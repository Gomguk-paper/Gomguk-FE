import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CookiePolicy() {
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
                    <h1 className="text-xl font-bold font-display">쿠키 정책</h1>
                </div>
            </header>

            <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto mobile-safe-area-pl mobile-safe-area-pr p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <h2>쿠키(Cookie) 정책</h2>
                    <p className="text-muted-foreground">최종 업데이트: 2024년 1월</p>

                    <h3>1. 쿠키란?</h3>
                    <p>
                        쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로,
                        이용자의 컴퓨터 하드디스크에 저장됩니다. 쿠키는 이용자가 웹사이트를 방문할 때 웹사이트 사용을 보다
                        편리하게 하고, 웹사이트의 개선과 제작에 도움을 주기 위해 사용됩니다.
                    </p>

                    <h3>2. 쿠키의 사용 목적</h3>
                    <p>Gomguk은 다음과 같은 목적을 위해 쿠키를 사용합니다:</p>
                    <ul>
                        <li>
                            <strong>필수 쿠키:</strong> 로그인 세션 유지, 보안 인증, 서비스 제공에 필수적인 기능
                        </li>
                        <li>
                            <strong>기능 쿠키:</strong> 사용자 설정 저장 (테마, 언어 설정 등)
                        </li>
                        <li>
                            <strong>분석 쿠키:</strong> 서비스 이용 통계 및 개선을 위한 데이터 수집
                        </li>
                        <li>
                            <strong>광고 쿠키:</strong> 맞춤형 콘텐츠 및 광고 제공
                        </li>
                    </ul>

                    <h3>3. 주요 쿠키 목록</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="border p-2">쿠키명</th>
                                    <th className="border p-2">목적</th>
                                    <th className="border p-2">유효기간</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-2">session_token</td>
                                    <td className="border p-2">로그인 세션 유지</td>
                                    <td className="border p-2">세션 종료 시</td>
                                </tr>
                                <tr>
                                    <td className="border p-2">user_prefs</td>
                                    <td className="border p-2">사용자 설정 저장</td>
                                    <td className="border p-2">1년</td>
                                </tr>
                                <tr>
                                    <td className="border p-2">analytics_id</td>
                                    <td className="border p-2">서비스 이용 분석</td>
                                    <td className="border p-2">2년</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h3>4. 쿠키 관리 방법</h3>
                    <p>
                        이용자는 쿠키 설정에 대한 선택권을 가지고 있습니다. 웹 브라우저의 설정을 통해 모든 쿠키를 허용하거나,
                        쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
                    </p>

                    <h4>주요 브라우저별 쿠키 설정 방법</h4>
                    <ul>
                        <li>
                            <strong>Chrome:</strong> 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터
                        </li>
                        <li>
                            <strong>Edge:</strong> 설정 → 쿠키 및 사이트 권한 → 쿠키 및 사이트 데이터 관리
                        </li>
                        <li>
                            <strong>Safari:</strong> 환경설정 → 개인정보 보호 → 쿠키 및 웹사이트 데이터
                        </li>
                        <li>
                            <strong>Firefox:</strong> 옵션 → 개인정보 및 보안 → 쿠키 및 사이트 데이터
                        </li>
                    </ul>

                    <h3>5. 쿠키 거부의 영향</h3>
                    <p>
                        쿠키 저장을 거부할 경우, 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있으며,
                        맞춤형 서비스 제공이 제한될 수 있습니다.
                    </p>

                    <div className="mt-8 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            쿠키 정책에 관한 문의사항이 있으시면 privacy@gomguk.com으로 연락주시기 바랍니다.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
