"""
API 라우터 모듈
"""

from .recommendation import router as recommendation_router
from .papers import router as papers_router
from .summaries import router as summaries_router
from .user_preferences import router as user_preferences_router

__all__ = [
    "recommendation_router",
    "papers_router",
    "summaries_router",
    "user_preferences_router",
]
