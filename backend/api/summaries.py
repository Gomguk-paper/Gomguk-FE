"""
논문 요약 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from crud.summary import get_summary_by_paper_id

router = APIRouter(prefix="/api/summaries", tags=["summaries"])


@router.get("/{paper_id}")
async def get_summary(paper_id: str, db: Session = Depends(get_db)):
    """논문 요약 조회"""
    summary = get_summary_by_paper_id(db, paper_id)
    if not summary:
        raise HTTPException(status_code=404, detail="요약을 찾을 수 없습니다.")

    return summary.to_dict()
