# API 사용 가이드

## 1. 서버 실행 확인

서버가 실행 중이면 다음 주소로 접속할 수 있습니다:
- **API 문서**: http://localhost:8000/docs
- **서버 상태 확인**: http://localhost:8000

## 2. 브라우저에서 API 테스트하기

### 방법 1: Swagger UI 사용 (가장 쉬움)

1. 브라우저에서 **http://localhost:8000/docs** 접속
2. 화면에 여러 API 엔드포인트가 보입니다
3. **POST /api/recommendations** 섹션을 찾아서 클릭
4. "Try it out" 버튼 클릭
5. Request body에 다음 내용 입력:

```json
{
  "user_id": "test_user",
  "tags": [
    {"name": "NLP", "weight": 5},
    {"name": "Transformer", "weight": 3}
  ],
  "level": "researcher",
  "daily_count": 5
}
```

6. "Execute" 버튼 클릭
7. 아래에 응답 결과가 표시됩니다!

### 방법 2: curl 명령어 사용 (터미널)

```bash
curl -X POST "http://localhost:8000/api/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "tags": [{"name": "NLP", "weight": 5}],
    "level": "researcher",
    "daily_count": 5
  }'
```

### 방법 3: Python 스크립트 사용

`test_api.py` 파일을 만들어서 실행:

```python
import requests

url = "http://localhost:8000/api/recommendations"
data = {
    "user_id": "test_user",
    "tags": [{"name": "NLP", "weight": 5}],
    "level": "researcher",
    "daily_count": 5
}

response = requests.post(url, json=data)
print(response.json())
```

## 3. 주요 API 엔드포인트

### POST /api/recommendations
**추천 논문 조회**

요청 예시:
```json
{
  "user_id": "user123",
  "tags": [{"name": "NLP", "weight": 5}],
  "level": "researcher",
  "daily_count": 10,
  "exclude_ids": []
}
```

응답 예시:
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
      "summary": null
    }
  ],
  "total": 5
}
```

### GET /api/papers/{paper_id}
**특정 논문 조회**

예시: http://localhost:8000/api/papers/arxiv_1706.03762

### GET /api/summaries/{paper_id}
**논문 요약 조회**

예시: http://localhost:8000/api/summaries/arxiv_1706.03762

### POST /api/user-preferences
**사용자 선호도 저장**

요청 예시:
```json
{
  "user_id": "user123",
  "tags": [{"name": "NLP", "weight": 5}],
  "level": "researcher",
  "daily_count": 10
}
```

## 4. 파이프라인 실행 (크롤링-선별-요약)

새로운 논문을 크롤링하고 요약하려면:

```bash
cd backend
python3 pipeline.py
```

이 명령은:
1. arXiv에서 최신 논문 크롤링
2. 인용수 기준 상위 5개 선별
3. 선별된 논문 요약 생성
4. 데이터베이스에 저장

## 5. 문제 해결

### 서버가 실행되지 않을 때
```bash
cd backend
python3 main.py
```

### 데이터베이스 초기화
```bash
cd backend
python3 -c "from database import init_db; init_db()"
python3 init_demo_data.py
```

### 포트가 이미 사용 중일 때
`.env` 파일에서 `API_PORT=8001`로 변경하거나:
```bash
uvicorn main:app --port 8001
```
