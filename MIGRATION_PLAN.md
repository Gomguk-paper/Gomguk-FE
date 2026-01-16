# 폴더 구조 마이그레이션 플랜

## 목표 레이어 분리 구조

```
src/
  ├── api/          # 라우트 엔트리/페이지 조립 (현재 pages/)
  ├── crud/         # 서버 통신 함수 (fetch/axios, repository)
  ├── models/       # 도메인 타입/인터페이스 (현재 data/의 타입)
  ├── schemas/      # Validation schema (zod/yup)
  ├── core/         # 앱 기본 설정
  │   ├── config/   # env/config
  │   ├── router/   # 라우터 설정
  │   ├── store/    # 상태 관리 (현재 store/)
  │   └── lib/       # 공통 유틸 (현재 lib/)
  ├── components/   # 재사용 UI 컴포넌트 (유지)
  ├── hooks/        # 공통 훅 (유지)
  ├── styles/       # 전역 스타일/토큰 (현재 index.css)
  └── assets/       # 아이콘/이미지
```

## 현재 구조 분석

### 현재 구조
- `src/pages/` → 페이지 컴포넌트 (라우트 엔트리)
- `src/data/` → 정적 데이터 + 타입 정의
- `src/store/` → Zustand 상태 관리
- `src/lib/` → 유틸리티 함수
- `src/index.css` → 전역 스타일
- `src/components/` → UI 컴포넌트 (유지)

### 마이그레이션 전략 (점진적)

#### Phase 1: 새 폴더 생성 및 타입/스타일 이동 (최소 영향)
1. `src/models/` 생성 → `src/data/papers.ts`의 타입 정의 이동
2. `src/styles/` 생성 → `src/index.css` 이동
3. `src/core/` 생성 → `src/store/`, `src/lib/` 이동

#### Phase 2: 페이지 → API 레이어 (점진적)
1. `src/api/` 생성
2. 기존 `src/pages/` 파일을 `src/api/`로 복사
3. `src/pages/index.ts`에서 re-export로 기존 import 유지
4. 점진적으로 import 업데이트

#### Phase 3: CRUD 레이어 준비 (향후 확장)
1. `src/crud/` 생성
2. API 호출 함수가 생기면 이곳으로 이동

#### Phase 4: Schema 레이어 (필요 시)
1. `src/schemas/` 생성
2. Zod 스키마 정의 시 이곳에 배치

## 실행 계획

### Step 1: 타입 및 스타일 분리 (즉시 실행 가능, 영향 최소)
- [x] `src/styles/` 생성 및 `index.css` 이동
- [ ] `src/models/` 생성 및 타입 정의 분리
- [ ] `src/core/` 생성 및 store/lib 이동

### Step 2: 페이지 레이어 정리 (점진적)
- [ ] `src/api/` 생성
- [ ] 페이지 파일 이동 및 re-export 설정
- [ ] import 경로 업데이트

### Step 3: 정리 및 문서화
- [ ] 불필요한 파일 정리
- [ ] README 업데이트

## 주의사항

1. **기존 import 유지**: re-export를 통해 기존 코드가 깨지지 않도록 함
2. **점진적 적용**: 한 번에 모든 것을 옮기지 않고 단계적으로 진행
3. **테스트**: 각 단계마다 빌드/실행 확인
4. **커밋**: 각 Phase별로 커밋하여 롤백 가능하게 유지
