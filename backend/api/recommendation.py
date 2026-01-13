"""
추천 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    PaperResponse,
)
from services.recommendation_service import RecommendationService
from crud.summary import get_summary_by_paper_id

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendationResponse)
async def get_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
):
    """
    추천 논문 조회 API

    사용자 정보를 기반으로 추천 알고리즘을 통해 논문을 반환합니다.
    """
    try:
        user_prefs = RecommendationService.get_user_preferences(db, request.user_id)
        user_actions = RecommendationService.get_user_actions(db, request.user_id)
        all_papers = RecommendationService.get_all_papers(db)

        if not all_papers:
            return RecommendationResponse(papers=[], total=0)

        scored_papers = []
        for paper in all_papers:
            score = RecommendationService.calculate_recommendation_score(
                paper, user_prefs, user_actions, request
            )
            scored_papers.append((paper, score))

        scored_papers.sort(key=lambda x: x[1], reverse=True)
        daily_count = request.daily_count or 10
        top_papers = scored_papers[:daily_count]

        paper_responses = []
        for paper, score in top_papers:
            summary = get_summary_by_paper_id(db, paper.id)

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
            papers=paper_responses, total=len(paper_responses)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"추천 생성 중 오류: {str(e)}")
