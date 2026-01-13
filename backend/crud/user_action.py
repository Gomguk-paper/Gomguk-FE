"""
사용자 행동 관련 CRUD 작업
"""

from sqlalchemy.orm import Session
from models.user_action import UserAction


def get_user_actions(db: Session, user_id: str) -> list[UserAction]:
    """사용자 행동 기록 조회"""
    return db.query(UserAction).filter(UserAction.user_id == user_id).all()
