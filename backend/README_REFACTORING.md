# 리팩토링 가이드

## 개발 환경 통일화

### 프론트엔드
- **Prettier**: 코드 포매팅
  - 설정 파일: `.prettierrc`
  - 실행: `npm run format`
  - 체크: `npm run format:check`
- **ESLint**: 코드 린팅
  - 설정 파일: `eslint.config.js`
  - 실행: `npm run lint`
- **Vite**: 빌드 도구 (이미 설정됨)

### 백엔드
- **PEP 8**: Python 코딩 컨벤션
- **BLACK**: 코드 포매터
  - 설정 파일: `pyproject.toml`
  - 실행: `black .`
- **UV**: 패키지 관리자
  - 설정 파일: `pyproject.toml`
  - 설치: `uv pip install -r requirements.txt`
  - 동기화: `uv pip sync`

## 백엔드 구조

리팩토링된 백엔드 구조:

```
backend/
├── models/          # 데이터베이스 모델
│   ├── __init__.py
│   └── database.py
├── schemas/         # Pydantic 스키마 (요청/응답)
│   ├── __init__.py
│   ├── recommendation.py
│   └── user.py
├── services/        # 비즈니스 로직
│   ├── __init__.py
│   └── recommendation_service.py
├── routers/         # API 라우터
│   ├── __init__.py
│   ├── recommendation.py
│   ├── papers.py
│   ├── summaries.py
│   └── user_preferences.py
├── main.py          # FastAPI 앱 초기화
├── crawler.py       # 크롤링 로직
├── selector.py      # 논문 선별 로직
├── summarizer.py    # 요약 생성 로직
├── pipeline.py      # 파이프라인 실행
└── pyproject.toml   # 프로젝트 설정 (BLACK, UV)
```

## 사용 방법

### 프론트엔드 포매팅
```bash
npm run format
```

### 백엔드 포매팅
```bash
cd backend
black .
```

### 백엔드 패키지 관리 (UV)
```bash
cd backend
uv pip install -r requirements.txt
# 또는 pyproject.toml 기반
uv pip install -e .
```
