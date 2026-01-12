"""
논문 선별 로직
인용수가 많은 상위 논문을 선별합니다.
"""

from typing import List
from models.database import SessionLocal, Paper
import os
from dotenv import load_dotenv

load_dotenv()

TOP_CITATIONS_COUNT = int(os.getenv("TOP_CITATIONS_COUNT", "5"))


def select_papers_for_summarization() -> List[str]:
    """
    요약할 논문을 선별합니다.
    인용수가 많은 상위 논문을 반환합니다.

    Returns:
        선별된 논문 ID 리스트
    """
    db = SessionLocal()
    try:
        # 아직 요약되지 않은 논문 중에서 인용수 기준 상위 논문 선택
        papers = (
            db.query(Paper)
            .filter(Paper.is_summarized == False)
            .order_by(Paper.citations.desc())
            .limit(TOP_CITATIONS_COUNT)
            .all()
        )

        # 인용수가 0인 경우, 최신 논문 우선
        if len(papers) < TOP_CITATIONS_COUNT:
            additional_papers = (
                db.query(Paper)
                .filter(Paper.is_summarized == False)
                .order_by(Paper.published_date.desc())
                .limit(TOP_CITATIONS_COUNT - len(papers))
                .all()
            )
            papers.extend(additional_papers)

        return [paper.id for paper in papers]

    finally:
        db.close()


def update_citation_counts():
    """
    논문의 인용수를 업데이트합니다.
    실제로는 Semantic Scholar API 등을 사용해야 하지만,
    데모를 위해 간단한 로직 사용
    """
    # TODO: 실제 API 연동
    # 현재는 크롤링 시점의 기본값(0) 사용
    pass
