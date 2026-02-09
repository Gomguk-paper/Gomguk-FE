# Gomguk-FE 코드 요약

## 개요
- 논문 추천 모바일 웹 앱(모바일 우선) 프론트엔드.
- 스택: Vite + React 18 + TypeScript + Tailwind CSS + shadcn-ui.
- 라우팅: React Router.
- 상태: Zustand(영속 저장 포함) + React Query(서버 상태).
- 개발 환경에서 MSW로 `/api/*` 목업 응답.

## 엔트리 및 앱 구조
- `src/main.tsx`: 개발 모드에서 MSW 워커 활성화 후 `App` 렌더.
- `src/App.tsx`: `QueryClientProvider`/`TooltipProvider`/`Toaster` 구성.
- `AppLayout`: 좌/우 사이드바 + 중앙 콘텐츠 + 하단 네비(모바일) 구성.
- `AppRoutes`: 세션 부트스트랩 + 라우트 가드(로그인/온보딩/설정).

## 라우팅
- `/` 홈, `/search` 검색, `/mypage` 마이페이지, `/settings` 설정.
- `/login` 로그인, `/onboarding` 온보딩, `/oauth/callback` OAuth 콜백.
- `/author/:authorId` 저자 상세, 그 외 404.

## 상태 관리 (Zustand)
- `src/core/store/useStore.ts`: 사용자/토큰, 선호도, 좋아요/저장/읽음 액션, 숨김/차단 필터, 알림, 테마, 팔로우 상태를 관리.
- `persist`로 localStorage에 일부 상태 영속화.
- `src/store/useStore.ts`: 호환성 re-export.

## 인증/세션
- `src/lib/authClient.ts`: axios 인스턴스 + refresh 토큰 처리 + 401 재시도.
- `src/lib/authSession.ts`: `/me` 호출로 세션 부트스트랩, 사용자 매핑.
- `src/core/lib/authStorage.ts`: user/prefs를 localStorage 또는 메모리에 저장.

## API 레이어
- `src/lib/apiClient.ts`: Authorization 헤더 자동 주입 및 401 재시도.
- `src/api/*`: papers, reports, authors, tags, summaries 호출 래퍼.
- `src/lib/apiBase.ts`: `VITE_API_BASE_URL` 기반 엔드포인트 설정.

## 주요 페이지 요약
- `Home`: 리포트/논문 피드, 무한 스크롤, 알림 생성, 요약 캐러셀.
- `Search`: 검색/태그/정렬, 인기 태그, 결과 리스트.
- `MyPage`: 좋아요/저장/히스토리/통계 탭, 로컬 액션 기반 통계.
- `Settings`: 프로필/알림/레이아웃/테마/읽기 목표/계정 설정.
- `Onboarding`: 태그 선택 → 가중치 → 레벨 → 일일 개수 단계형 설정.
- `AuthorPage`: 저자 프로필/통계/토픽/논문 리스트.

## 핵심 컴포넌트
- `PaperCard`: 논문 카드, 좋아요/저장/숨김/차단, 요약 보기.
- `SummaryCarousel`: 요약 단계 UI + 키보드/터치 내비, 읽음 처리.
- `ReportCard`: 기술 리포트 카드 → 태그 검색으로 이동.
- `LoginForm`/`LoginModal`: OAuth 로그인 UI 및 리다이렉트.
- `DesktopSidebar`/`RightSidebar`/`BottomNav`: 데스크톱/모바일 레이아웃.

## 데이터/목업
- `src/models/papers.ts`: 논문/요약/리포트 목업 데이터.
- `src/data/authors.ts`: 저자 목업 데이터.
- `src/mocks/*`: MSW 핸들러로 `/api` 목업 응답 제공.

## 스타일/테마
- `src/styles/index.css`: Spoqa Han Sans 폰트, 컬러 토큰, 모바일 안전영역.
- `useTheme`: `light/dark/system` 테마 적용 및 시스템 변화 감지.

## 참고
- `src/core/config/constants.ts`: UI 상수(모바일 폭, 온보딩 기준 등).
- `src/components/ui/*`: shadcn-ui 컴포넌트 모음.
