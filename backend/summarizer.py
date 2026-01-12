"""
논문 요약 생성 파이프라인
"""

import os
from typing import Dict, Optional
from models.database import SessionLocal, Paper, Summary
from dotenv import load_dotenv

load_dotenv()

# OpenAI API 키 확인
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def generate_summary(paper: Paper) -> Optional[Dict]:
    """
    논문 요약을 생성합니다.

    Args:
        paper: Paper 모델 인스턴스

    Returns:
        요약 딕셔너리 또는 None
    """
    if not OPENAI_API_KEY:
        print(
            "Warning: OPENAI_API_KEY가 설정되지 않았습니다. 데모용 요약을 생성합니다."
        )
        return generate_demo_summary(paper)

    try:
        from openai import OpenAI

        client = OpenAI(api_key=OPENAI_API_KEY)

        # 프롬프트 구성
        prompt = f"""다음 논문을 한국어로 요약해주세요.

제목: {paper.title}
저자: {', '.join(paper.authors or [])}
초록:
{paper.abstract[:2000]}  # 초록이 너무 길면 잘라냄

다음 형식으로 응답해주세요:
1. 한 줄 요약 (hook): 논문의 핵심을 한 문장으로
2. 주요 포인트 (3-5개): 핵심 내용을 나열
3. 상세 설명: 논문의 주요 기여와 방법론 설명

JSON 형식:
{{
  "hook_one_liner": "...",
  "key_points": ["...", "..."],
  "detailed": "...",
  "evidence_scope": "abstract"
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",  # 비용 효율적인 모델 사용
            messages=[
                {
                    "role": "system",
                    "content": "당신은 AI 논문을 전문적으로 요약하는 연구자입니다. 한국어로 명확하고 간결하게 요약해주세요.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=1000,
        )

        import json

        result_text = response.choices[0].message.content

        # JSON 파싱 시도
        try:
            # 코드 블록 제거
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()

            summary_data = json.loads(result_text)

            return {
                "hook_one_liner": summary_data.get("hook_one_liner", ""),
                "key_points": summary_data.get("key_points", []),
                "detailed": summary_data.get("detailed", ""),
                "evidence_scope": summary_data.get("evidence_scope", "abstract"),
            }
        except json.JSONDecodeError:
            # JSON 파싱 실패 시 텍스트에서 추출
            return parse_summary_from_text(result_text)

    except Exception as e:
        print(f"Error generating summary with OpenAI: {e}")
        return generate_demo_summary(paper)


def parse_summary_from_text(text: str) -> Dict:
    """텍스트에서 요약 정보 추출 (JSON 파싱 실패 시)"""
    lines = text.strip().split("\n")
    hook = lines[0] if lines else ""
    key_points = []
    detailed = ""

    in_key_points = False
    in_detailed = False

    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue

        if "주요 포인트" in line or "key_points" in line.lower():
            in_key_points = True
            in_detailed = False
            continue
        elif "상세" in line or "detailed" in line.lower():
            in_key_points = False
            in_detailed = True
            continue

        if in_key_points and (
            line.startswith("-") or line.startswith("•") or line[0].isdigit()
        ):
            key_points.append(line.lstrip("- •0123456789. ").strip())
        elif in_detailed:
            detailed += line + " "

    return {
        "hook_one_liner": hook,
        "key_points": key_points[:5],  # 최대 5개
        "detailed": detailed.strip(),
        "evidence_scope": "abstract",
    }


def generate_demo_summary(paper: Paper) -> Dict:
    """
    데모용 요약 생성 (OpenAI API 없이)
    """
    # 간단한 템플릿 기반 요약
    title_lower = paper.title.lower()

    # 태그 기반으로 요약 생성
    tags = paper.tags or []
    tag_keywords = ", ".join(tags[:3]) if tags else "AI"

    hook = f"{paper.title[:50]}... 논문이 {tag_keywords} 분야에서 중요한 기여를 합니다."

    key_points = [
        f"{paper.title}은 최신 {tag_keywords} 연구입니다.",
        f"저자: {', '.join((paper.authors or [])[:2])}",
        "상세한 내용은 논문을 참고하세요.",
    ]

    detailed = f"""
이 논문은 {tag_keywords} 분야의 최신 연구입니다.
{paper.abstract[:300]}...
"""

    return {
        "hook_one_liner": hook,
        "key_points": key_points,
        "detailed": detailed.strip(),
        "evidence_scope": "abstract",
    }


def save_summary(paper_id: str, summary_data: Dict) -> bool:
    """
    요약을 데이터베이스에 저장합니다.

    Args:
        paper_id: 논문 ID
        summary_data: 요약 데이터

    Returns:
        성공 여부
    """
    db = SessionLocal()
    try:
        # 기존 요약이 있으면 업데이트, 없으면 생성
        existing = db.query(Summary).filter(Summary.paper_id == paper_id).first()

        if existing:
            existing.hook_one_liner = summary_data["hook_one_liner"]
            existing.key_points = summary_data["key_points"]
            existing.detailed = summary_data["detailed"]
            existing.evidence_scope = summary_data["evidence_scope"]
        else:
            summary = Summary(
                paper_id=paper_id,
                hook_one_liner=summary_data["hook_one_liner"],
                key_points=summary_data["key_points"],
                detailed=summary_data["detailed"],
                evidence_scope=summary_data["evidence_scope"],
            )
            db.add(summary)

        # 논문의 is_summarized 플래그 업데이트
        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        if paper:
            paper.is_summarized = True

        db.commit()
        return True

    except Exception as e:
        print(f"Error saving summary: {e}")
        db.rollback()
        return False
    finally:
        db.close()
