"""
사용자 선호도 API 라우터
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.user import UserPreferenceRequest
from crud.user_preference import save_user_preference

router = APIRouter(prefix="/api/user-preferences", tags=["user-preferences"])


@router.post("")
async def save_user_preferences_endpoint(
    request: UserPreferenceRequest,
    db: Session = Depends(get_db),
):
    """사용자 선호도 저장"""
    save_user_preference(
        db, request.user_id, request.tags, request.level, request.daily_count
    )
    return {"message": "선호도 저장 완료"}
