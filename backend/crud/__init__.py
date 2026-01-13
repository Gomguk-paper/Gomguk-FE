"""
데이터 접근 로직 (CRUD)
"""

from .paper import get_paper, get_all_papers
from .summary import get_summary_by_paper_id
from .user_preference import get_user_preference, save_user_preference
from .user_action import get_user_actions

__all__ = [
    "get_paper",
    "get_all_papers",
    "get_summary_by_paper_id",
    "get_user_preference",
    "save_user_preference",
    "get_user_actions",
]
