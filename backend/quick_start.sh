#!/bin/bash

echo "🚀 Jaram Paper Backend 빠른 시작"
echo "=================================="

# 현재 디렉토리 확인
if [ ! -f "main.py" ]; then
    echo "❌ 오류: backend 디렉토리에서 실행해주세요"
    exit 1
fi

# Python 확인
if ! command -v python3 &> /dev/null; then
    echo "❌ 오류: python3가 설치되어 있지 않습니다"
    exit 1
fi

echo ""
echo "📦 1단계: 의존성 확인 중..."

# 필수 패키지 확인
python3 -c "import fastapi" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  FastAPI가 설치되지 않았습니다."
    echo "   다음 명령으로 설치하세요:"
    echo "   pip3 install --user -r requirements.txt"
    echo "   또는 가상환경을 사용하세요"
    read -p "계속하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ 의존성 확인 완료"
echo ""

# 데이터베이스 확인
if [ ! -d "data" ] || [ ! -f "data/papers.db" ]; then
    echo "📦 2단계: 데이터베이스 초기화 중..."
    python3 -c "from core.database import init_db; init_db()"
    echo "✅ 데이터베이스 초기화 완료"
    echo ""
    
    echo "📚 3단계: 데모 데이터 추가 중..."
    python3 init_demo_data.py
    echo ""
fi

echo "🌐 4단계: 서버 시작 중..."
echo "   서버 주소: http://localhost:8000"
echo "   API 문서: http://localhost:8000/docs"
echo ""
echo "   종료하려면 Ctrl+C를 누르세요"
echo ""

# 서버 실행
python3 main.py
