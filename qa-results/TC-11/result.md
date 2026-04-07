# TC-11: 프로토타입 버전 체험 링크 동작

**Status**: FAIL
**Date**: 2026-04-07
**URL Tested**: https://gomguk.cloud/login

## Requirement
"실제 로그인 없이 체험" 클릭 시 앱 진입 가능

## Steps Executed
1. /login 접속
2. "프로토타입 버전 • 실제 로그인 없이 체험" 텍스트 클릭
3. URL 및 화면 변화 확인

## Evidence
![클릭 후 상태](prototype-click.png)

## Result
클릭 후 아무 동작 없음. URL /login 그대로 유지.

접근성 스냅샷 확인 결과 해당 요소는 `paragraph` 태그로 클릭 핸들러 없음.

## Notes
- 시각적으로는 링크처럼 보이지만 실제로는 비기능 텍스트.
- 프로토타입 체험 기능이 의도된 기능이라면 링크 또는 버튼으로 구현 필요.
- 로그인 모달에서도 이 텍스트가 보이지 않아 체험 진입 경로가 완전히 막혀있음.
