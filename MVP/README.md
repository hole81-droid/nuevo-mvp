# MVP Workspace

이 폴더는 nuevo의 **작동하는 MVP** 개발 기준 문서를 보관한다.

## 문서

- `PRD MVP.md`: MVP 제품 요구사항
- `CLAUDE MVP.md`: MVP 개발 지침
- `TASK MVP.md`: MVP 체크리스트

## 원칙

기존 프로토타입은 UI/UX 탐색 결과로 보존한다.  
MVP는 아래 루프가 실제 배포 환경에서 작동하는지에 집중한다.

```text
앱 URL 업로드 → 피드 노출 → 인라인 iframe 실행 → 댓글/반응/팔로우 → 체험 이벤트 저장
```

## 코드 위치

현재 Next.js 앱 코드는 루트의 `src/`를 그대로 사용한다.  
코드를 `MVP/` 하위로 옮기지 않는다. 폴더 이동은 Next.js 라우팅과 import 경로를 깨뜨릴 수 있다.
