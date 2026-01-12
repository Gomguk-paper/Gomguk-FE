"""
추천 관련 스키마
"""

from pydantic import BaseModel
from typing import Dict, List, Optional, Any


class RecommendationRequest(BaseModel):
    """추천 요청 스키마"""

    user_id: str
    tags: Optional[List[Dict[str, Any]]] = None  # [{"name": "NLP", "weight": 5}]
    level: Optional[str] = (
        None  # "undergraduate", "graduate", "researcher", "practitioner"
    )
    daily_count: Optional[int] = 10
    exclude_ids: Optional[List[str]] = None  # 이미 본 논문 ID 리스트

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "tags": [
                    {"name": "NLP", "weight": 5},
                    {"name": "Transformer", "weight": 3},
                ],
                "level": "researcher",
                "daily_count": 10,
                "exclude_ids": [],
            }
        }


class PaperResponse(BaseModel):
    """논문 응답 스키마"""

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
    """추천 응답 스키마"""

    papers: List[PaperResponse]
    total: int
