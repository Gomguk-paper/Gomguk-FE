"""
사용자 선호도 API 라우터
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from models.database import get_db, UserPreference
from schemas.user import UserPreferenceRequest

router = APIRouter(prefix="/api/user-preferences", tags=["user-preferences"])


@router.post("")
async def save_user_preferences(
    request: UserPreferenceRequest,
    db: Session = Depends(get_db),
):
    """사용자 선호도 저장"""
    user_pref = (
        db.query(UserPreference)
        .filter(UserPreference.user_id == request.user_id)
        .first()
    )

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
            daily_count=request.daily_count,
        )
        db.add(user_pref)

    db.commit()
    return {"message": "선호도 저장 완료"}
