"""
크롤링-선별-요약 파이프라인
"""

from models.database import SessionLocal, Paper, init_db
from crawler import fetch_arxiv_papers
from selector import select_papers_for_summarization
from summarizer import generate_summary, save_summary
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()


def save_papers_to_db(papers: list):
    """
    크롤링한 논문을 데이터베이스에 저장합니다.

    Args:
        papers: 논문 딕셔너리 리스트
    """
    db = SessionLocal()
    try:
        for paper_data in papers:
            # 기존 논문 확인
            existing = (
                db.query(Paper).filter(Paper.arxiv_id == paper_data["arxiv_id"]).first()
            )

            if existing:
                # 업데이트
                for key, value in paper_data.items():
                    if key != "id" and hasattr(existing, key):
                        setattr(existing, key, value)
            else:
                # 새 논문 추가
                paper = Paper(**paper_data)
                db.add(paper)

        db.commit()
        print(f"✅ {len(papers)}개 논문 저장 완료")

    except Exception as e:
        print(f"❌ 논문 저장 중 오류: {e}")
        db.rollback()
    finally:
        db.close()


def run_pipeline():
    """
    전체 파이프라인 실행:
    1. arXiv 크롤링
    2. DB 저장
    3. 논문 선별
    4. 요약 생성 및 저장
    """
    print("=" * 50)
    print(f"파이프라인 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)

    # 1. 크롤링
    print("\n[1단계] arXiv 논문 크롤링 중...")
    papers = fetch_arxiv_papers()
    print(f"   → {len(papers)}개 논문 수집 완료")

    if not papers:
        print("⚠️  수집된 논문이 없습니다.")
        return

    # 2. DB 저장
    print("\n[2단계] 데이터베이스 저장 중...")
    save_papers_to_db(papers)

    # 3. 논문 선별
    print("\n[3단계] 요약할 논문 선별 중...")
    selected_ids = select_papers_for_summarization()
    print(f"   → {len(selected_ids)}개 논문 선별 완료")

    if not selected_ids:
        print("⚠️  선별된 논문이 없습니다.")
        return

    # 4. 요약 생성 및 저장
    print("\n[4단계] 논문 요약 생성 중...")
    db = SessionLocal()
    try:
        for paper_id in selected_ids:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            if not paper:
                print(f"   ⚠️  논문 {paper_id}를 찾을 수 없습니다.")
                continue

            print(f"   → {paper.title[:50]}... 요약 생성 중")
            summary_data = generate_summary(paper)

            if summary_data:
                success = save_summary(paper_id, summary_data)
                if success:
                    print(f"   ✅ 요약 저장 완료")
                else:
                    print(f"   ❌ 요약 저장 실패")
            else:
                print(f"   ❌ 요약 생성 실패")
    finally:
        db.close()

    print("\n" + "=" * 50)
    print("파이프라인 완료!")
    print("=" * 50)


if __name__ == "__main__":
    # 데이터베이스 초기화
    init_db()

    # 파이프라인 실행
    run_pipeline()
