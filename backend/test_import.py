#!/usr/bin/env python3
"""
간단한 import 테스트 스크립트
타입 오류가 있는지 확인합니다.
"""
import sys

try:
    print("📦 모듈 import 테스트 시작...")
    from main import app
    print("✅ 모든 모듈 import 성공!")
    print(f"✅ FastAPI 앱 생성 완료: {app.title}")
    sys.exit(0)
except ImportError as e:
    print(f"❌ Import 오류: {e}")
    print("   → 의존성 패키지가 설치되지 않았습니다.")
    print("   → pip3 install -r requirements.txt 실행하세요")
    sys.exit(1)
except Exception as e:
    print(f"❌ 오류 발생: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
