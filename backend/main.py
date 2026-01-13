"""
FastAPI 서버 - 추천 논문 조회 API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from core.database import init_db
from api import (
    recommendation_router,
    papers_router,
    summaries_router,
    user_preferences_router,
)

load_dotenv()

app = FastAPI(title="Jaram Paper API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(recommendation_router)
app.include_router(papers_router)
app.include_router(summaries_router)
app.include_router(user_preferences_router)


@app.get("/")
async def root():
    """헬스 체크"""
    return {"message": "Jaram Paper API", "status": "running"}


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))

    uvicorn.run(app, host=host, port=port)
