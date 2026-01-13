"""
사용자 행동 ORM 모델
"""

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from datetime import datetime
from core.database import Base


class UserAction(Base):
    """사용자 행동 모델 (좋아요, 저장, 읽음)"""

    __tablename__ = "user_actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, index=True)
    paper_id = Column(String, index=True)
    liked = Column(Boolean, default=False)
    saved = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
