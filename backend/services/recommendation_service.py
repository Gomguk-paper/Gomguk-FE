"""
추천 서비스 로직
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from models.database import Paper, UserAction, UserPreference
from schemas.recommendation import RecommendationRequest


class RecommendationService:
    """추천 알고리즘 서비스"""

    @staticmethod
    def calculate_recommendation_score(
        paper: Paper,
        user_prefs: Optional[UserPreference],
        user_actions: List[UserAction],
        request: RecommendationRequest,
    ) -> float:
        """
        논문 추천 점수를 계산합니다.

        Args:
            paper: 논문 객체
            user_prefs: 사용자 선호도
            user_actions: 사용자 행동 기록
            request: 요청 데이터

        Returns:
            추천 점수 (높을수록 추천)
        """
        score = 0.0

        # 1. 기본 점수 (인용수, 최신성, 트렌딩)
        score += paper.citations * 0.1  # 인용수 가중치
        score += paper.trending_score * 0.3
        score += paper.recency_score * 0.2

        # 2. 태그 매칭 점수
        tags = request.tags or (user_prefs.tags if user_prefs else [])
        if tags:
            paper_tags_lower = [t.lower() for t in (paper.tags or [])]
            for tag_pref in tags:
                tag_name = (
                    tag_pref.get("name", "").lower()
                    if isinstance(tag_pref, dict)
                    else str(tag_pref).lower()
                )
                weight = tag_pref.get("weight", 3) if isinstance(tag_pref, dict) else 3

                if tag_name in paper_tags_lower:
                    score += weight * 10

        # 3. 사용자 레벨에 따른 가중치
        level = request.level or (user_prefs.level if user_prefs else "undergraduate")
        if level == "researcher":
            score += paper.citations * 0.2  # 연구자는 인용수 중시
        elif level == "practitioner":
            score += paper.recency_score * 0.3  # 실무자는 최신성 중시

        # 4. 이미 본 논문은 점수 감소
        exclude_ids = request.exclude_ids or []
        if paper.id in exclude_ids:
            score *= 0.1

        # 5. 이미 좋아요/저장한 논문은 점수 증가
        for action in user_actions:
            if action.paper_id == paper.id:
                if action.liked:
                    score += 50
                if action.saved:
                    score += 30

        return score

    @staticmethod
    def get_user_preferences(db: Session, user_id: str) -> Optional[UserPreference]:
        """사용자 선호도 조회"""
        return (
            db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        )

    @staticmethod
    def get_user_actions(db: Session, user_id: str) -> List[UserAction]:
        """사용자 행동 기록 조회"""
        return db.query(UserAction).filter(UserAction.user_id == user_id).all()

    @staticmethod
    def get_all_papers(db: Session) -> List[Paper]:
        """모든 논문 조회"""
        return db.query(Paper).all()
