"""
논문 조회 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from crud.paper import get_paper
from crud.summary import get_summary_by_paper_id

router = APIRouter(prefix="/api/papers", tags=["papers"])


@router.get("/{paper_id}")
async def get_paper_endpoint(paper_id: str, db: Session = Depends(get_db)):
    """특정 논문 조회"""
    paper = get_paper(db, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="논문을 찾을 수 없습니다.")

    summary = get_summary_by_paper_id(db, paper_id)

    return {
        **paper.to_dict(),
        "summary": summary.to_dict() if summary else None,
    }
