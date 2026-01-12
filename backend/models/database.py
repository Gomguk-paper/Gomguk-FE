"""
데이터베이스 설정 및 모델 정의
"""

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    JSON,
    String,
    Text,
    create_engine,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/papers.db")

# 데이터베이스 디렉토리 생성
db_path = DATABASE_URL.replace("sqlite:///", "")
if db_path != ":memory:":
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Paper(Base):
    """논문 모델"""

    __tablename__ = "papers"

    id = Column(String, primary_key=True)  # arxiv_id
    arxiv_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    authors = Column(JSON)  # 리스트로 저장
    year = Column(Integer)
    venue = Column(String)
    tags = Column(JSON)  # 리스트로 저장
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


class Summary(Base):
    """논문 요약 모델"""

    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    paper_id = Column(String, index=True)
    hook_one_liner = Column(Text)
    key_points = Column(JSON)  # 리스트로 저장
    detailed = Column(Text)
    evidence_scope = Column(String)  # "abstract", "intro", "full"
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "paperId": self.paper_id,
            "hookOneLiner": self.hook_one_liner,
            "keyPoints": self.key_points or [],
            "detailed": self.detailed,
            "evidenceScope": self.evidence_scope,
        }


class UserAction(Base):
    """사용자 행동 모델 (좋아요, 저장, 읽음)"""

    __tablename__ = "user_actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, index=True)
    paper_id = Column(String, index=True)
    liked = Column(Boolean, default=False)
    saved = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserPreference(Base):
    """사용자 선호도 모델"""

    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, unique=True, index=True)
    tags = Column(JSON)  # [{"name": "NLP", "weight": 5}]
    level = Column(String)  # "undergraduate", "graduate", "researcher", "practitioner"
    daily_count = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "tags": self.tags or [],
            "level": self.level,
            "dailyCount": self.daily_count,
        }


def init_db():
    """데이터베이스 초기화"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """데이터베이스 세션 생성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
