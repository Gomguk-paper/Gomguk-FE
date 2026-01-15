# 논문 추천 서비스 프로젝트 (모바일 전용)

> **모바일 우선 설계**: 이 프로젝트는 완전 모바일 전용 UI/UX로 설계되었습니다. 데스크톱에서는 모바일 화면을 중앙에 배치하여 모바일 앱처럼 보이도록 최적화되어 있습니다.

## 시작하기

필수 요구사항은 Node.js와 npm이 설치되어 있어야 합니다 - [nvm으로 설치하기](https://github.com/nvm-sh/nvm#installing-and-updating)

다음 단계를 따르세요:

```sh
# 1단계: 프로젝트의 Git URL을 사용하여 저장소를 클론합니다.
git clone <YOUR_GIT_URL>

# 2단계: 프로젝트 디렉토리로 이동합니다.
cd <YOUR_PROJECT_NAME>

# 3단계: 필요한 의존성을 설치합니다.
npm i

# 4단계: 자동 리로드와 즉시 미리보기가 가능한 개발 서버를 시작합니다.
npm run dev
```

개발 서버는 `http://localhost:8080`에서 실행됩니다. 모바일 기기에서 테스트하려면 네트워크 IP를 사용하거나 브라우저 개발자 도구의 모바일 모드를 활용하세요.

**GitHub에서 파일 직접 편집**

- 원하는 파일로 이동합니다.
- 파일 보기의 오른쪽 상단에 있는 "Edit" 버튼(연필 아이콘)을 클릭합니다.
- 변경사항을 만들고 커밋합니다.

**GitHub Codespaces 사용**

- 저장소의 메인 페이지로 이동합니다.
- 오른쪽 상단 근처의 "Code" 버튼(녹색 버튼)을 클릭합니다.
- "Codespaces" 탭을 선택합니다.
- "New codespace"를 클릭하여 새로운 Codespace 환경을 시작합니다.
- Codespace 내에서 파일을 직접 편집하고 완료되면 변경사항을 커밋하고 푸시합니다.

## 개발 스크립트

```sh
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 개발 모드 빌드
npm run build:dev

# 코드 포맷팅 (자동 수정)
npm run format

# 코드 포맷팅 검사 (수정 없이 확인만)
npm run format:check

# ESLint 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix

# TypeScript 타입 검사
npm run type-check

# 모든 검사 실행 (포맷 + 린트 + 타입 체크)
npm run check

# 빌드 미리보기
npm run preview
```

## 코드 스타일 규칙

이 프로젝트는 엄격한 코드 스타일 규칙을 따릅니다:

### Prettier 설정
- Print width: 100자
- Tab width: 2 spaces
- Semicolons: 사용
- Single quotes: 사용 안 함 (double quotes)
- Trailing commas: ES5 호환

### ESLint 규칙
- React Hooks 규칙 준수
- TypeScript strict 모드 권장
- 사용하지 않는 변수 경고 (단, `_`로 시작하는 변수는 무시)
- `console.log` 사용 시 경고 (단, `console.warn`, `console.error`는 허용)

### Import 순서 (권장)
1. React 관련 (`react`, `react-dom` 등)
2. 외부 라이브러리
3. 절대 경로 (`@/...`)
4. 상대 경로 (`./...`, `../...`)

### 커밋 전 체크리스트
커밋 전에 다음 명령어를 실행하여 코드 품질을 확인하세요:

```sh
npm run check
```

## 이 프로젝트에서 사용되는 기술은 무엇인가요?

### 프론트엔드
- **Vite** - 빠른 빌드 도구
- **TypeScript** - 타입 안정성
- **React 18** - UI 라이브러리
- **shadcn-ui** - 컴포넌트 라이브러리
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **React Router** - 클라이언트 사이드 라우팅
- **Zustand** - 경량 상태 관리
- **React Query** - 서버 상태 관리

### 모바일 최적화
- **Safe Area 지원** - 노치/홈 인디케이터 대응
- **터치 타겟 최적화** - 최소 44px 터치 영역
- **모바일 우선 레이아웃** - 360×800 기준, 최대 480px 너비
- **하단 네비게이션** - 엄지 영역 최적화

### 백엔드
- FastAPI
- SQLAlchemy (SQLite)
- arXiv API (논문 크롤링)
- OpenAI API (논문 요약)
- GitHub Actions (자동화)

## 백엔드 설정 및 실행

백엔드 관련 자세한 내용은 [backend/README.md](./backend/README.md)를 참조하세요.

### 빠른 시작

```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정 (.env 파일 생성)
cp env.example .env
# .env 파일을 편집하여 OPENAI_API_KEY 등 설정

# 데이터베이스 초기화
python -c "from core.database import init_db; init_db()"

# 데모 데이터 초기화 (AI 논문 상위 5개)
python init_demo_data.py

# 서버 실행
python main.py
```

서버는 `http://localhost:8000`에서 실행되며, API 문서는 `http://localhost:8000/docs`에서 확인할 수 있습니다.

### 주요 기능

1. **추천 논문 조회 API (POST `/api/recommendations`)**: 사용자 정보를 기반으로 추천 알고리즘을 통해 논문 반환
2. **자동화 파이프라인**: GitHub Actions를 통해 매일 arXiv에서 논문 크롤링 → 선별 → 요약 자동 실행

## 프로젝트 구조

```
src/
├── api/          # 라우트 엔트리/페이지 컴포넌트 (향후 pages/에서 마이그레이션)
├── crud/         # 서버 통신 함수 (향후 확장)
├── models/       # 도메인 타입/인터페이스
├── schemas/      # Validation schema (Zod 등)
├── core/         # 앱 기본 설정
│   ├── config/   # 환경 변수/설정
│   ├── router/   # 라우터 설정
│   ├── store/    # 상태 관리 (Zustand)
│   └── lib/      # 공통 유틸리티
├── components/   # 재사용 UI 컴포넌트
│   └── ui/       # shadcn-ui 기반 컴포넌트
├── hooks/        # 공통 React 훅
├── styles/       # 전역 스타일/디자인 토큰
├── assets/       # 정적 자산 (이미지, 아이콘)
└── data/         # 정적 데이터 (임시, 향후 API로 대체)
```

> **참고**: 현재는 점진적 마이그레이션 단계입니다. 기존 `pages/`, `store/`, `lib/` 폴더는 re-export를 통해 유지되며, 새로운 코드는 위 구조를 따릅니다.

## 모바일 전용 UI/UX 규격

### 뷰포트
- **기준**: 360×800px
- **지원 범위**: 320px ~ 430px 너비
- **데스크톱**: 최대 480px 너비로 중앙 정렬

### 레이아웃
- **1열 세로 스크롤** 기본
- **카드/피드 중심** 디자인
- **하단 탭바** 네비게이션 (홈/탐색/마이)

### Safe Area
- iOS 노치 및 Android 홈 인디케이터 대응
- `env(safe-area-inset-*)` CSS 변수 사용

### 터치 최적화
- **최소 터치 타겟**: 44×44px
- **주요 액션**: 엄지 영역(하단) 배치
- **스와이프 제스처**: 카드/피드 탐색

## 폴더 구조 마이그레이션

자세한 마이그레이션 계획은 [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)를 참조하세요.

## 라이센스

이 프로젝트는 팀 내부 프로젝트입니다.
