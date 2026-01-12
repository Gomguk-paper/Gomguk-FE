"""
arXiv 논문 크롤링 스크립트
"""

import feedparser
import arxiv
from datetime import datetime
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

ARXIV_CATEGORIES = os.getenv("ARXIV_CATEGORIES", "cs.AI,cs.LG,cs.CV,cs.CL").split(",")
MAX_PAPERS_PER_CRAWL = int(os.getenv("MAX_PAPERS_PER_CRAWL", "100"))


def fetch_arxiv_papers(max_results: int = None) -> List[Dict]:
    """
    arXiv에서 최신 논문을 가져옵니다.

    Args:
        max_results: 가져올 최대 논문 수

    Returns:
        논문 정보 리스트
    """
    if max_results is None:
        max_results = MAX_PAPERS_PER_CRAWL

    papers = []

    # 각 카테고리별로 논문 가져오기
    for category in ARXIV_CATEGORIES:
        try:
            # RSS 피드 사용
            rss_url = f"http://export.arxiv.org/rss/{category}"
            feed = feedparser.parse(rss_url)

            for entry in feed.entries[: max_results // len(ARXIV_CATEGORIES)]:
                # arXiv ID 추출
                arxiv_id = entry.id.split("/")[-1]

                # 상세 정보 가져오기
                try:
                    search = arxiv.Search(id_list=[arxiv_id])
                    paper = next(search.results())

                    # 저자 정보
                    authors = [str(author) for author in paper.authors]

                    # 태그 추출 (주제 분류)
                    tags = []
                    if hasattr(paper, "categories"):
                        tags = paper.categories

                    paper_data = {
                        "arxiv_id": arxiv_id,
                        "id": f"arxiv_{arxiv_id}",
                        "title": paper.title,
                        "authors": authors,
                        "year": paper.published.year if paper.published else None,
                        "venue": "arXiv",
                        "tags": tags,
                        "abstract": paper.summary,
                        "pdf_url": paper.pdf_url,
                        "arxiv_url": paper.entry_id,
                        "published_date": paper.published,
                        "updated_date": (
                            paper.updated
                            if hasattr(paper, "updated")
                            else paper.published
                        ),
                        "citations": 0,  # 기본값, 실제로는 외부 API 필요
                        "trending_score": 0.0,
                        "recency_score": (
                            calculate_recency_score(paper.published)
                            if paper.published
                            else 0.0
                        ),
                    }

                    papers.append(paper_data)

                except Exception as e:
                    print(f"Error fetching paper {arxiv_id}: {e}")
                    continue

        except Exception as e:
            print(f"Error fetching category {category}: {e}")
            continue

    # 중복 제거 (arxiv_id 기준)
    seen = set()
    unique_papers = []
    for paper in papers:
        if paper["arxiv_id"] not in seen:
            seen.add(paper["arxiv_id"])
            unique_papers.append(paper)

    return unique_papers[:max_results]


def calculate_recency_score(published_date: datetime) -> float:
    """
    최신성 점수 계산 (최근일수록 높은 점수)

    Args:
        published_date: 발행일

    Returns:
        0-100 사이의 점수
    """
    if not published_date:
        return 0.0

    now = (
        datetime.now(published_date.tzinfo)
        if published_date.tzinfo
        else datetime.utcnow()
    )
    days_ago = (now - published_date).days

    # 30일 이내: 100점, 90일 이내: 70점, 180일 이내: 40점, 그 외: 20점
    if days_ago <= 30:
        return 100.0
    elif days_ago <= 90:
        return 70.0
    elif days_ago <= 180:
        return 40.0
    else:
        return 20.0


def get_top_cited_papers(papers: List[Dict], top_n: int = 5) -> List[Dict]:
    """
    인용수가 많은 상위 논문 반환 (데모용)

    실제로는 Semantic Scholar API 등을 사용해야 하지만,
    데모를 위해 citations 필드 기준으로 정렬

    Args:
        papers: 논문 리스트
        top_n: 반환할 상위 논문 수

    Returns:
        상위 n개 논문
    """
    # citations 기준으로 정렬 (내림차순)
    sorted_papers = sorted(papers, key=lambda x: x.get("citations", 0), reverse=True)
    return sorted_papers[:top_n]


if __name__ == "__main__":
    # 테스트 실행
    print("arXiv 논문 크롤링 시작...")
    papers = fetch_arxiv_papers(max_results=50)
    print(f"총 {len(papers)}개 논문 수집 완료")

    if papers:
        print("\n첫 번째 논문 예시:")
        print(f"제목: {papers[0]['title']}")
        print(f"저자: {', '.join(papers[0]['authors'][:3])}")
        print(f"발행일: {papers[0]['published_date']}")
