"""
논문 요약 관련 CRUD 작업
"""

from sqlalchemy.orm import Session
from models.summary import Summary


def get_summary_by_paper_id(db: Session, paper_id: str) -> Summary | None:
    """논문 ID로 요약 조회"""
    return db.query(Summary).filter(Summary.paper_id == paper_id).first()
