"""
사용자 선호도 ORM 모델
"""

from sqlalchemy import Column, DateTime, Integer, JSON, String
from datetime import datetime
from core.database import Base


class UserPreference(Base):
    """사용자 선호도 모델"""

    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, unique=True, index=True)
    tags = Column(JSON)
    level = Column(String)
    daily_count = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "tags": self.tags or [],
            "level": self.level,
            "dailyCount": self.daily_count,
        }
