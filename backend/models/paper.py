"""
논문 ORM 모델
"""

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, JSON, String, Text
from datetime import datetime
from core.database import Base


class Paper(Base):
    """논문 모델"""

    __tablename__ = "papers"

    id = Column(String, primary_key=True)
    arxiv_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    authors = Column(JSON)
    year = Column(Integer)
    venue = Column(String)
    tags = Column(JSON)
    abstract = Column(Text)
    pdf_url = Column(String)
    arxiv_url = Column(String)
    published_date = Column(DateTime)
    updated_date = Column(DateTime)

    # 메트릭스
    citations = Column(Integer, default=0)
    trending_score = Column(Float, default=0.0)
    recency_score = Column(Float, default=0.0)

    # 크롤링 정보
    crawled_at = Column(DateTime, default=datetime.utcnow)
    is_summarized = Column(Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "arxiv_id": self.arxiv_id,
            "title": self.title,
            "authors": self.authors or [],
            "year": self.year,
            "venue": self.venue,
            "tags": self.tags or [],
            "abstract": self.abstract,
            "pdf_url": self.pdf_url,
            "arxiv_url": self.arxiv_url,
            "published_date": (
                self.published_date.isoformat() if self.published_date else None
            ),
            "updated_date": (
                self.updated_date.isoformat() if self.updated_date else None
            ),
            "metrics": {
                "citations": self.citations,
                "trending_score": self.trending_score,
                "recency_score": self.recency_score,
            },
            "is_summarized": self.is_summarized,
        }
