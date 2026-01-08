# Jaram Paper Backend

arXiv 논문 추천 및 요약 백엔드 시스템

## 기능

1. **추천 논문 조회 API (POST)**: 사용자 정보를 기반으로 추천 알고리즘을 통해 논문을 반환
2. **요약할 논문 선별 파이프라인 (CRON)**: 크롤링 → 선별 → 요약 자동화

## 설치

```bash
cd backend
pip install -r requirements.txt
```

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

## 데이터베이스 초기화

```bash
python -c "from database import init_db; init_db()"
```

## 데모 데이터 초기화

```bash
python init_demo_data.py
```

이 스크립트는 AI 논문 중 인용수가 많은 상위 5개 논문을 데이터베이스에 추가합니다:
- Attention Is All You Need (Transformer)
- BERT
- Denoising Diffusion Probabilistic Models
- Vision Transformer (ViT)
- GPT-4 Technical Report

## 서버 실행

```bash
python main.py
```

또는 uvicorn 직접 사용:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

서버는 `http://localhost:8000`에서 실행됩니다.

API 문서는 `http://localhost:8000/docs`에서 확인할 수 있습니다.

## 파이프라인 실행

크롤링-선별-요약 파이프라인을 수동으로 실행:

```bash
python pipeline.py
```

## API 엔드포인트

### POST /api/recommendations

추천 논문 조회

**요청 본문:**
```json
{
  "user_id": "user123",
  "tags": [{"name": "NLP", "weight": 5}, {"name": "Transformer", "weight": 3}],
  "level": "researcher",
  "daily_count": 10,
  "exclude_ids": ["arxiv_1706.03762"]
}
```

**응답:**
```json
{
  "papers": [
    {
      "id": "arxiv_1706.03762",
      "title": "Attention Is All You Need",
      "authors": ["Vaswani, A.", ...],
      "year": 2017,
      "venue": "NeurIPS",
      "tags": ["cs.CL", "cs.LG"],
      "abstract": "...",
      "pdf_url": "https://arxiv.org/pdf/1706.03762",
      "metrics": {
        "citations": 85000,
        "trendingScore": 95.0,
        "recencyScore": 60.0
      },
      "summary": {
        "paperId": "arxiv_1706.03762",
        "hookOneLiner": "...",
        "keyPoints": ["...", "..."],
        "detailed": "...",
        "evidenceScope": "abstract"
      }
    }
  ],
  "total": 10
}
```

### GET /api/papers/{paper_id}

특정 논문 조회

### GET /api/summaries/{paper_id}

논문 요약 조회

### POST /api/user-preferences

사용자 선호도 저장

## GitHub Actions

`.github/workflows/arxiv-pipeline.yml` 파일이 매일 자동으로 실행되어:
1. arXiv에서 최신 논문 크롤링
2. 인용수 기준 상위 5개 논문 선별
3. 선별된 논문 요약 생성
4. 데이터베이스 업데이트 및 커밋

수동 실행도 가능합니다 (GitHub Actions 탭에서 "Run workflow" 클릭).

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
