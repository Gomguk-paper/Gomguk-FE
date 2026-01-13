"""
사용자 선호도 관련 CRUD 작업
"""

from sqlalchemy.orm import Session
from models.user_preference import UserPreference


def get_user_preference(db: Session, user_id: str) -> UserPreference | None:
    """사용자 선호도 조회"""
    return db.query(UserPreference).filter(UserPreference.user_id == user_id).first()


def save_user_preference(
    db: Session, user_id: str, tags: list, level: str, daily_count: int
) -> UserPreference:
    """사용자 선호도 저장 또는 업데이트"""
    user_pref = get_user_preference(db, user_id)

    if user_pref:
        user_pref.tags = tags
        user_pref.level = level
        user_pref.daily_count = daily_count
    else:
        user_pref = UserPreference(
            user_id=user_id, tags=tags, level=level, daily_count=daily_count
        )
        db.add(user_pref)

    db.commit()
    db.refresh(user_pref)
    return user_pref
