# Prototype Archive

이 폴더는 지금까지 만든 nuevo 프로토타입의 역할을 명확히 구분하기 위한 참조 공간이다.

## 프로토타입의 목적

프로토타입은 아래를 검증하기 위해 만들었다.

- 모바일-first visual concept
- Instagram/X 스타일 피드 UX
- 인라인 확장 interaction
- 업로드 3단계 플로우
- iframe 미리보기/실행 감각
- 크리에이터 스튜디오/수익 UI 방향
- 리믹스/댓글/반응/팔로우 UX

## 프로토타입 산출물

현재 루트 코드베이스에는 프로토타입에서 출발한 화면들이 포함되어 있다.

```text
src/app/create
src/app/onboarding
src/app/brand
src/app/guide
src/app/leaderboard
src/app/demo/[id]
src/lib/mock-data.ts
```

이 화면들은 MVP 핵심 루프에 직접 필요하지 않을 수 있다. 다만 visual/UX 참조 가치가 있으므로 삭제하지 않는다.

## MVP와의 차이

| 구분 | Prototype | MVP |
|---|---|---|
| 목적 | 감각/UX 탐색 | 실제 사용 가능한 제품 |
| 데이터 | mock 중심 | Supabase 실 데이터 |
| 핵심 | 넓은 기능 시연 | 업로드 → 실행 루프 |
| 만들기 | UI 존재 가능 | 제외 |
| 수익 | UI/컨셉 포함 | 체험 이벤트 저장까지만 우선 |

## 디자인 참조

프로토타입에서 확정한 visual concept은 루트의 `Design Ref.md`에 정리했다.

## 보존 규칙

- MVP 개발 중 프로토타입 화면을 무리하게 삭제하지 않는다.
- MVP 핵심 플로우를 방해하는 경우에만 숨기거나 진입점을 제거한다.
- 새 MVP 요구사항은 `MVP/` 폴더의 문서를 기준으로 판단한다.
