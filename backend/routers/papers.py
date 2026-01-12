"""
논문 조회 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, Paper, Summary

router = APIRouter(prefix="/api/papers", tags=["papers"])


@router.get("/{paper_id}")
async def get_paper(paper_id: str, db: Session = Depends(get_db)):
    """특정 논문 조회"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="논문을 찾을 수 없습니다.")

    summary = db.query(Summary).filter(Summary.paper_id == paper_id).first()

    return {
        **paper.to_dict(),
        "summary": summary.to_dict() if summary else None,
    }
