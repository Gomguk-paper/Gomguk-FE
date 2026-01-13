# Jaram Paper Backend

arXiv 논문 추천 및 요약 백엔드 시스템

## 기능

1. **추천 논문 조회 API**: 사용자 정보를 기반으로 추천 알고리즘을 통해 논문을 반환
2. **논문 크롤링 및 요약 파이프라인**: 크롤링 → 선별 → 요약 자동화

## 빠른 시작

```bash
cd backend
pip install -r requirements.txt
python -c "from core.database import init_db; init_db()"
python init_demo_data.py
python main.py
```

서버는 `http://localhost:8000`에서 실행되며, API 문서는 `http://localhost:8000/docs`에서 확인할 수 있습니다.

## 상세 가이드

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)**: 설치 및 실행 가이드
- **[API_GUIDE.md](API_GUIDE.md)**: API 사용 가이드
- **[README_STRUCTURE.md](README_STRUCTURE.md)**: 프로젝트 구조 설명

## 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
DATABASE_URL=sqlite:///./data/papers.db
OPENAI_API_KEY=your_openai_api_key_here
API_HOST=0.0.0.0
API_PORT=8000
ARXIV_CATEGORIES=cs.AI,cs.LG,cs.CV,cs.CL
MAX_PAPERS_PER_CRAWL=100
TOP_CITATIONS_COUNT=5
```

## 주요 API 엔드포인트

### POST /api/recommendations
추천 논문 조회

**요청:**
```json
{
  "user_id": "user123",
  "tags": [{"name": "NLP", "weight": 5}],
  "level": "researcher",
  "daily_count": 10,
  "exclude_ids": []
}
```

### GET /api/papers/{paper_id}
특정 논문 조회

### GET /api/summaries/{paper_id}
논문 요약 조회

### POST /api/user-preferences
사용자 선호도 저장

## 파이프라인 실행

크롤링-선별-요약 파이프라인을 수동으로 실행:

```bash
python pipeline.py
```

## 추천 알고리즘

추천 점수는 다음 요소들을 고려합니다:

1. **기본 점수**: 인용수, 트렌딩 점수, 최신성 점수
2. **태그 매칭**: 사용자 관심 태그와 논문 태그 일치도
3. **사용자 레벨**: 연구자는 인용수 중시, 실무자는 최신성 중시
4. **사용자 행동**: 좋아요/저장한 논문은 점수 증가
5. **제외 목록**: 이미 본 논문은 점수 감소

## 주의사항

- OpenAI API 키가 없으면 데모용 요약이 생성됩니다
- 실제 인용수는 Semantic Scholar API 등을 연동해야 정확합니다 (현재는 데모 데이터 사용)
- 프로덕션 환경에서는 CORS 설정을 특정 도메인으로 제한하세요
