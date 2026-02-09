# Google OAuth 로그인 후 Access Token 기반 인증 실패 정리

## 문제 요약
- Google OAuth 로그인 후 Access Token 기반 인증이 동작하지 않는 것으로 보임.
- 현재 프론트 구조상, Google에서 받은 토큰을 직접 쓰는 방식이 아니라 백엔드가 발급한 Access Token을 사용해야 함.

## 현재 프론트 인증 흐름 (코드 기준)
- 로그인 시작: `src/components/LoginForm.tsx`
- 로그인 요청 URL: `${API_BASE_URL_NO_TRAILING}/oauth/${provider}/login`
- 콜백 처리: `src/pages/OAuthCallback.tsx`
- 콜백에서 하는 일: `bootstrapSession()` 호출 → `/auth/refresh`로 access token 발급 → `/me` 호출
- API 요청 헤더 주입: `src/lib/apiClient.ts`에서 Zustand의 `accessToken`을 `Authorization: Bearer`로 자동 주입

## 구조상 중요한 전제
- 프론트는 OAuth 콜백 URL에 있는 토큰을 읽지 않음.
- Access Token은 `/auth/refresh` 응답의 `access_token`으로만 세팅됨.
- 따라서 OAuth 완료 후에도 `/auth/refresh`가 실패하면 인증이 진행되지 않음.

## 유력 원인 후보
- `/auth/refresh` 실패
- refresh cookie가 설정되지 않음 또는 요청에 포함되지 않음
- refresh API 응답 형식 불일치
- 프론트 기대값: `access_token`
- 실제 백엔드 응답이 `accessToken` 등 다른 필드명일 가능성
- API base 경로 불일치
- 프론트가 `/api/oauth/*`로 호출하는데 백엔드는 `/oauth/*`만 제공하는 경우

## 확인해야 할 항목
- OAuth 콜백 직후 `/auth/refresh` 응답 상태 코드와 body
- `/auth/refresh` 응답에 `Set-Cookie`가 있는지
- `/me` 호출 시 `Authorization` 헤더가 붙는지
- `VITE_API_BASE_URL` 설정 값과 실제 백엔드 엔드포인트 경로

## 확인된 사실 (추가됨)
- `/auth/refresh` 응답이 정상적으로 내려옴
  - 응답 필드: `access_token`, `token_type: bearer`, `expires_in: 900`
  - 헤더: `access-control-allow-credentials: true`
  - 응답 시각: `Mon, 09 Feb 2026 12:35:30 GMT`
  - 토큰 값은 민감정보라 문서에 포함하지 않음
- `/me` 호출이 `401 Unauthorized`로 실패
  - 요청 URL: `http://localhost:8080/api/me`
  - 요청 헤더에 `Authorization: Bearer <access_token>` 포함됨
  - 응답 헤더에 `server: uvicorn` 포함 → 백엔드 응답으로 보임
  - 응답 시각: `Mon, 09 Feb 2026 12:42:34 GMT`
  - DevTools 상에는 `from service worker`로 표시됨 (MSW 우회 여부 확인 필요)

## 수정 후보 (프론트)
- 콜백 URL에 access token이 전달되는 경우 이를 읽어 상태에 반영
- `/auth/refresh` 응답 필드명이 달라도 처리 가능하게 보강
- API base 설정과 OAuth 경로 정합성 검증

## 다음 확인 포인트
- `/me` 응답 body 내용 (에러 코드/메시지)
- 백엔드에서 `/me`가 기대하는 토큰 전달 방식
  - Authorization 헤더 vs HttpOnly 쿠키
- 토큰 검증 설정 일치 여부
  - signing key/issuer/audience/알고리즘 불일치 가능성

## 관련 파일
- `src/components/LoginForm.tsx`
- `src/pages/OAuthCallback.tsx`
- `src/lib/authSession.ts`
- `src/lib/authClient.ts`
- `src/lib/apiClient.ts`
- `src/lib/apiBase.ts`
- `src/core/lib/authStorage.ts`
