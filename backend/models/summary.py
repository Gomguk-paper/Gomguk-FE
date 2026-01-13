"""
논문 요약 ORM 모델
"""

from sqlalchemy import Column, DateTime, Integer, JSON, String, Text
from datetime import datetime
from core.database import Base


class Summary(Base):
    """논문 요약 모델"""

    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    paper_id = Column(String, index=True)
    hook_one_liner = Column(Text)
    key_points = Column(JSON)
    detailed = Column(Text)
    evidence_scope = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "paperId": self.paper_id,
            "hookOneLiner": self.hook_one_liner,
            "keyPoints": self.key_points or [],
            "detailed": self.detailed,
            "evidenceScope": self.evidence_scope,
        }
