# 논문 추천 서비스 프로젝트

## 프로젝트 정보

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## 코드를 어떻게 편집할 수 있나요?

애플리케이션을 편집하는 여러 가지 방법이 있습니다.

**Lovable 사용**

[Lovable 프로젝트](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID)에 방문하여 프롬프트를 시작하세요.

Lovable을 통해 만든 변경사항은 자동으로 이 저장소에 커밋됩니다.

**선호하는 IDE 사용**

자신의 IDE를 사용하여 로컬에서 작업하려면 이 저장소를 클론하고 변경사항을 푸시할 수 있습니다. 푸시된 변경사항은 Lovable에도 반영됩니다.

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

## 이 프로젝트에서 사용되는 기술은 무엇인가요?

### 프론트엔드
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Router
- Zustand (상태 관리)
- React Query

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
python -c "from database import init_db; init_db()"

# 데모 데이터 초기화 (AI 논문 상위 5개)
python init_demo_data.py

# 서버 실행
python main.py
```

서버는 `http://localhost:8000`에서 실행되며, API 문서는 `http://localhost:8000/docs`에서 확인할 수 있습니다.

### 주요 기능

1. **추천 논문 조회 API (POST `/api/recommendations`)**: 사용자 정보를 기반으로 추천 알고리즘을 통해 논문 반환
2. **자동화 파이프라인**: GitHub Actions를 통해 매일 arXiv에서 논문 크롤링 → 선별 → 요약 자동 실행

## 이 프로젝트를 어떻게 배포할 수 있나요?

[Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID)을 열고 Share -> Publish를 클릭하세요.

## Lovable 프로젝트에 커스텀 도메인을 연결할 수 있나요?

네, 가능합니다!

도메인을 연결하려면 Project > Settings > Domains로 이동하여 Connect Domain을 클릭하세요.

자세한 내용은 여기를 참조하세요: [커스텀 도메인 설정](https://docs.lovable.dev/features/custom-domain#custom-domain)
