"""
FastAPI 서버 - 추천 논문 조회 API
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from database import get_db, Paper, Summary, UserAction, UserPreference
from datetime import datetime
import os
from dotenv import load_dotenv

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


# 요청 모델
class RecommendationRequest(BaseModel):
    user_id: str
    tags: Optional[List[Dict[str, Any]]] = None  # [{"name": "NLP", "weight": 5}]
    level: Optional[str] = None  # "undergraduate", "graduate", "researcher", "practitioner"
    daily_count: Optional[int] = 10
    exclude_ids: Optional[List[str]] = None  # 이미 본 논문 ID 리스트
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "tags": [{"name": "NLP", "weight": 5}, {"name": "Transformer", "weight": 3}],
                "level": "researcher",
                "daily_count": 10,
                "exclude_ids": []
            }
        }


# 응답 모델
class PaperResponse(BaseModel):
    id: str
    title: str
    authors: List[str]
    year: Optional[int]
    venue: Optional[str]
    tags: List[str]
    abstract: str
    pdf_url: Optional[str]
    metrics: Dict[str, Any]
    summary: Optional[Dict] = None


class RecommendationResponse(BaseModel):
    papers: List[PaperResponse]
    total: int


def calculate_recommendation_score(
    paper: Paper,
    user_prefs: Optional[UserPreference],
    user_actions: List[UserAction],
    request: RecommendationRequest
) -> float:
    """
    논문 추천 점수를 계산합니다.
    
    Args:
        paper: 논문 객체
        user_prefs: 사용자 선호도
        user_actions: 사용자 행동 기록
        request: 요청 데이터
        
    Returns:
        추천 점수 (높을수록 추천)
    """
    score = 0.0
    
    # 1. 기본 점수 (인용수, 최신성, 트렌딩)
    score += paper.citations * 0.1  # 인용수 가중치
    score += paper.trending_score * 0.3
    score += paper.recency_score * 0.2
    
    # 2. 태그 매칭 점수
    tags = request.tags or (user_prefs.tags if user_prefs else [])
    if tags:
        paper_tags_lower = [t.lower() for t in (paper.tags or [])]
        for tag_pref in tags:
            tag_name = tag_pref.get("name", "").lower() if isinstance(tag_pref, dict) else str(tag_pref).lower()
            weight = tag_pref.get("weight", 3) if isinstance(tag_pref, dict) else 3
            
            if tag_name in paper_tags_lower:
                score += weight * 10
    
    # 3. 사용자 레벨에 따른 가중치
    level = request.level or (user_prefs.level if user_prefs else "undergraduate")
    if level == "researcher":
        score += paper.citations * 0.2  # 연구자는 인용수 중시
    elif level == "practitioner":
        score += paper.recency_score * 0.3  # 실무자는 최신성 중시
    
    # 4. 이미 본 논문은 점수 감소
    exclude_ids = request.exclude_ids or []
    if paper.id in exclude_ids:
        score *= 0.1
    
    # 5. 이미 좋아요/저장한 논문은 점수 증가
    for action in user_actions:
        if action.paper_id == paper.id:
            if action.liked:
                score += 50
            if action.saved:
                score += 30
    
    return score


@app.get("/")
async def root():
    """헬스 체크"""
    return {"message": "Jaram Paper API", "status": "running"}


@app.post("/api/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    추천 논문 조회 API
    
    사용자 정보를 기반으로 추천 알고리즘을 통해 논문을 반환합니다.
    """
    try:
        # 사용자 선호도 조회
        user_prefs = db.query(UserPreference).filter(
            UserPreference.user_id == request.user_id
        ).first()
        
        # 사용자 행동 기록 조회
        user_actions = db.query(UserAction).filter(
            UserAction.user_id == request.user_id
        ).all()
        
        # 모든 논문 조회
        all_papers = db.query(Paper).all()
        
        if not all_papers:
            # 논문이 없으면 데모 데이터 반환
            return RecommendationResponse(
                papers=[],
                total=0
            )
        
        # 각 논문에 대해 추천 점수 계산
        scored_papers = []
        for paper in all_papers:
            score = calculate_recommendation_score(
                paper, user_prefs, user_actions, request
            )
            scored_papers.append((paper, score))
        
        # 점수 기준으로 정렬 (내림차순)
        scored_papers.sort(key=lambda x: x[1], reverse=True)
        
        # 상위 N개 선택
        daily_count = request.daily_count or 10
        top_papers = scored_papers[:daily_count]
        
        # 응답 형식으로 변환
        paper_responses = []
        for paper, score in top_papers:
            # 요약 정보 조회
            summary = db.query(Summary).filter(Summary.paper_id == paper.id).first()
            
            paper_response = PaperResponse(
                id=paper.id,
                title=paper.title,
                authors=paper.authors or [],
                year=paper.year,
                venue=paper.venue,
                tags=paper.tags or [],
                abstract=paper.abstract or "",
                pdf_url=paper.pdf_url,
                metrics={
                    "citations": paper.citations,
                    "trendingScore": paper.trending_score,
                    "recencyScore": paper.recency_score,
                },
                summary=summary.to_dict() if summary else None,
            )
            paper_responses.append(paper_response)
        
        return RecommendationResponse(
            papers=paper_responses,
            total=len(paper_responses)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"추천 생성 중 오류: {str(e)}")


@app.get("/api/papers/{paper_id}")
async def get_paper(paper_id: str, db: Session = Depends(get_db)):
    """특정 논문 조회"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="논문을 찾을 수 없습니다.")
    
    summary = db.query(Summary).filter(Summary.paper_id == paper_id).first()
    
    return {
        **paper.to_dict(),
        "summary": summary.to_dict() if summary else None,
    }


@app.get("/api/summaries/{paper_id}")
async def get_summary(paper_id: str, db: Session = Depends(get_db)):
    """논문 요약 조회"""
    summary = db.query(Summary).filter(Summary.paper_id == paper_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="요약을 찾을 수 없습니다.")
    
    return summary.to_dict()


class UserPreferenceRequest(BaseModel):
    user_id: str
    tags: List[Dict]
    level: str
    daily_count: int


@app.post("/api/user-preferences")
async def save_user_preferences(
    request: UserPreferenceRequest,
    db: Session = Depends(get_db)
):
    """사용자 선호도 저장"""
    user_pref = db.query(UserPreference).filter(
        UserPreference.user_id == request.user_id
    ).first()
    
    if user_pref:
        user_pref.tags = request.tags
        user_pref.level = request.level
        user_pref.daily_count = request.daily_count
        user_pref.updated_at = datetime.utcnow()
    else:
        user_pref = UserPreference(
            user_id=request.user_id,
            tags=request.tags,
            level=request.level,
            daily_count=request.daily_count
        )
        db.add(user_pref)
    
    db.commit()
    return {"message": "선호도 저장 완료"}


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    uvicorn.run(app, host=host, port=port)
