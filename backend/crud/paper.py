"""
논문 관련 CRUD 작업
"""

from sqlalchemy.orm import Session
from models.paper import Paper


def get_paper(db: Session, paper_id: str) -> Paper | None:
    """특정 논문 조회"""
    return db.query(Paper).filter(Paper.id == paper_id).first()


def get_all_papers(db: Session) -> list[Paper]:
    """모든 논문 조회"""
    return db.query(Paper).all()
