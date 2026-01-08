#!/bin/bash

# 백엔드 서버 실행 스크립트

echo "🚀 Jaram Paper Backend 서버 시작..."

# 가상환경 활성화 (있는 경우)
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# 데이터베이스 초기화
echo "📦 데이터베이스 초기화 중..."
python -c "from database import init_db; init_db()"

# 데모 데이터 초기화 (데이터가 없을 경우)
echo "📚 데모 데이터 확인 중..."
python init_demo_data.py

# 서버 실행
echo "🌐 FastAPI 서버 시작..."
python main.py
