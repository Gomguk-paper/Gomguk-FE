"""
Pydantic 스키마 정의
"""

from .recommendation import (
    PaperResponse,
    RecommendationRequest,
    RecommendationResponse,
)
from .user import UserPreferenceRequest

__all__ = [
    "RecommendationRequest",
    "RecommendationResponse",
    "PaperResponse",
    "UserPreferenceRequest",
]
