# PWA(Progressive Web App) 도입 계획

본 문서는 현재 Vite + React 스택의 웹 애플리케이션을 모바일 디바이스에서 네이티브 앱처럼 사용할 수 있도록 PWA로 전환하기 위한 작업 계획입니다.

## 1. 개요
PWA를 적용하여 사용자가 모바일 웹 브라우저 접속 시 "홈 화면에 추가" 기능을 통해 웹앱을 설치할 수 있도록 합니다. 이를 통해 접근성을 높이고 캐싱을 활용한 오프라인 경험 개선 및 로딩 속도 향상을 목표로 합니다.

## 2. 필요 패키지 설치
- **패키지명**: `vite-plugin-pwa`
- **목적**: Vite 환경에서 손쉽게 Service Worker 설정과 Web App Manifest를 자동 생성 및 관리

## 3. 세부 작업 단계

### 단계 1: vite-plugin-pwa 패키지 설치
```bash
npm install vite-plugin-pwa -D
```

### 단계 2: vite.config.ts 설정 변경
`vite-plugin-pwa`를 Vite 설정 파일에 통합하여 PWA 기능 활성화
- **Manifest 설정**: 앱의 이름, 약칭, 테마 색상, 배경색 등을 지정
- **아이콘 설정**: `public/logo.png` 또는 기타 에셋을 활용하여 다양한 크기의 PWA 아이콘(192x192, 512x512 등) 정의
- **Service Worker (Workbox)**: 런타임 캐싱, 프리캐싱 리소스 설정

```typescript
// vite.config.ts 예시
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png'],
      manifest: {
        name: 'Gomguk App',
        short_name: 'Gomguk',
        description: 'Gomguk Web Application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo.png', // 실제 사용할 아이콘 이미지 경로 (크기 조정 필요할 수 있음)
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  // ... 기존 설정
})
```

### 단계 3: PWA 아이콘 생성 및 최적화
- 기존 `public/logo.png`를 활용하거나, PWA 명세에 맞는 정규화된 아이콘 세트 (192x192, 512x512, maskable icon 등) 생성 및 `public` 폴더에 배치.

### 단계 4: PWA 등록 스크립트 추가
- 최상위 `index.html` 혹은 `src/main.tsx` 파일에 서비스 워커 등록 코드 추가 (또는 `vite-plugin-pwa`의 가상 모듈 `virtual:pwa-register` 활용).
- 사용자에게 앱 업데이트 알림을 제공할 수 있는 UI 구현 (선택 사항이나 권장).

### 단계 5: 테스트 및 검증
- Chrome DevTools의 Application 탭에서 Manifest와 Service Worker 정상 로드 확인.
- Lighthouse를 통한 PWA 기준 충족 여부 검사.
- 실제 모바일 기기(Android Chrome, iOS Safari)에서 "홈 화면에 추가" 및 오프라인 구동 테스트.

## 4. 기대 효과
- **모바일 접근성 향상**: 브라우저 주소창 없이 앱 아이콘으로 바로 접근 가능.
- **성능 개선**: 캐싱을 통한 초기 로딩 속도 단축.
- **오프라인 지원**: 네트워크 연결이 불안정해도 기본 앱 기능(캐시된 데이터) 제공 가능.
