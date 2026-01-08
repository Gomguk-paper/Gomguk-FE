#!/usr/bin/env python3
"""
API 테스트 스크립트
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_root():
    """루트 엔드포인트 테스트"""
    print("=" * 50)
    print("1. 루트 엔드포인트 테스트")
    print("=" * 50)
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_recommendations():
    """추천 API 테스트"""
    print("=" * 50)
    print("2. 추천 논문 조회 API 테스트")
    print("=" * 50)
    
    url = f"{BASE_URL}/api/recommendations"
    data = {
        "user_id": "test_user",
        "tags": [
            {"name": "NLP", "weight": 5},
            {"name": "Transformer", "weight": 3}
        ],
        "level": "researcher",
        "daily_count": 5
    }
    
    print(f"Request URL: {url}")
    print(f"Request Data: {json.dumps(data, indent=2, ensure_ascii=False)}")
    print()
    
    try:
        response = requests.post(url, json=data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 성공! 총 {result['total']}개 논문 추천")
            print()
            print("추천된 논문:")
            for i, paper in enumerate(result['papers'], 1):
                print(f"\n{i}. {paper['title']}")
                print(f"   저자: {', '.join(paper['authors'][:3])}")
                print(f"   인용수: {paper['metrics']['citations']}")
                print(f"   태그: {', '.join(paper['tags'][:3])}")
        else:
            print(f"❌ 오류: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다.")
        print("   서버가 실행 중인지 확인하세요: python3 main.py")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
    print()

def test_get_paper():
    """특정 논문 조회 테스트"""
    print("=" * 50)
    print("3. 특정 논문 조회 테스트")
    print("=" * 50)
    
    paper_id = "arxiv_1706.03762"
    url = f"{BASE_URL}/api/papers/{paper_id}"
    
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            paper = response.json()
            print(f"✅ 성공!")
            print(f"제목: {paper['title']}")
            print(f"저자: {', '.join(paper['authors'][:3])}")
        else:
            print(f"❌ 오류: {response.text}")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
    print()

if __name__ == "__main__":
    print("🚀 API 테스트 시작")
    print()
    
    try:
        test_root()
        test_recommendations()
        test_get_paper()
        
        print("=" * 50)
        print("✅ 모든 테스트 완료!")
        print("=" * 50)
        print()
        print("💡 더 많은 테스트는 브라우저에서 http://localhost:8000/docs 접속하세요")
        
    except KeyboardInterrupt:
        print("\n\n테스트 중단됨")
