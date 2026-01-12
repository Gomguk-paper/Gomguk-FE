"""
사용자 관련 스키마
"""

from pydantic import BaseModel
from typing import Dict, List


class UserPreferenceRequest(BaseModel):
    """사용자 선호도 요청 스키마"""

    user_id: str
    tags: List[Dict]
    level: str
    daily_count: int
