# Visual Concept Reference

이 문서는 nuevo에서 확정된 visual concept을 다른 앱 개발에도 재사용하기 위한 디자인 레퍼런스다.

핵심 감각은 **검은 무대 위에 올라온 따뜻한 모바일 시트**, **강한 블랙 CTA**, **과장된 굵기의 타이포그래피**, **둥글지만 장난감처럼 보이지 않는 실용적 UI**다.

---

## 1. 한 줄 정의

**Black stage, warm paper sheet, huge utilitarian type, soft rounded controls.**

한국어로 풀면:

> 검은 배경 위에 따뜻한 종이 같은 앱 화면이 카드처럼 올라오고,  
> 안쪽 UI는 흑백 중심의 강한 대비와 큰 버튼으로 명확하게 작동한다.

이 디자인은 화려한 컬러 브랜드가 아니라, **제품 행위 자체를 선명하게 보이게 하는 모바일 도구감**이 중요하다.

---

## 2. 전체 분위기

### 키워드

- 모바일-first
- utilitarian
- bold
- tactile
- warm monochrome
- premium but casual
- receipt / order form / app sheet 감각
- 손에 잡히는 UI

### 피해야 할 느낌

- SaaS 대시보드처럼 차갑고 넓은 레이아웃
- 인스타그램처럼 완전한 흰 배경만 있는 평면 피드
- 컬러 그라디언트가 많은 AI 서비스풍
- 유리morphism, 보라색 AI 감성, 과도한 glow
- 귀여운 이모지 중심 UI
- 카드가 너무 많아 보이는 카드 안의 카드 구조

---

## 3. 컬러 시스템

이 컨셉의 컬러는 “많은 색”이 아니라 **거의 흑백 + 따뜻한 종이색 + 회색 라인**으로 구성한다.

### Core Tokens

```css
:root {
  --black: #000000;
  --sheet: #F8F8F3;
  --sheet-2: #E2E2DC;
  --soft: #EFEFE8;
  --line: #D7D7CF;
  --ink: #050505;
  --muted: #7D7D78;
  --cream: #FFFDF5;
}
```

### 역할

| Token | 사용처 |
|---|---|
| `#000000` | 앱 바깥 배경, CTA, 선택 상태, 주요 아이콘 |
| `#F8F8F3` | 메인 앱 시트 배경 |
| `#E2E2DC` | 뒤에 겹쳐 보이는 보조 시트 |
| `#EFEFE8` | 입력 배경, 비활성 면, hover/pressed 면 |
| `#D7D7CF` | 얇은 경계선 |
| `#050505` | 제목/본문의 주요 텍스트 |
| `#7D7D78` | 설명, 보조 텍스트, placeholder |
| `#FFFDF5` | 카드 내부 하이라이트, 아이콘 배경 |

### 컬러 사용 원칙

- CTA는 거의 항상 검정 배경 + 흰 글자.
- 컬러는 상태를 설명할 때만 제한적으로 쓴다.
- 콘텐츠 타입도 화려한 색보다 아이콘/라벨/구조로 구분한다.
- 회색은 차가운 `#F3F4F6`보다 따뜻한 `#EFEFE8`, `#D7D7CF` 계열을 쓴다.
- 배경은 순백 `#FFFFFF`보다 `#F8F8F3`가 기본이다.

---

## 4. 레이아웃 구조

### 모바일 프레임

앱은 검은 배경 위에 놓인 하나의 모바일 시트처럼 보인다.

```css
body {
  background: #000;
}

.app-shell {
  max-width: 430px;
  min-height: calc(100vh - 80px);
  margin: 80px auto 0;
  background: #F8F8F3;
  border-radius: 18px 18px 0 0;
  overflow: hidden;
}
```

### Stacked Sheet

상단 뒤쪽에 살짝 보이는 보조 시트를 둔다.

```css
body::before {
  content: "";
  position: fixed;
  left: 50%;
  top: 68px;
  width: min(394px, calc(100vw - 36px));
  height: 780px;
  transform: translateX(-50%);
  border-radius: 18px 18px 0 0;
  background: #E2E2DC;
}
```

이 레이어가 있으면 화면이 단순한 웹페이지가 아니라 **앱 안의 모달/주문서/작업 시트**처럼 느껴진다.

---

## 5. 타이포그래피

### 기본 방향

폰트는 장식적인 브랜드 폰트보다 **시스템 sans-serif를 아주 굵고 크게 쓰는 방식**이 맞다.

추천:

```css
font-family:
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

### Hero / Form Title

큰 화면 제목은 거의 포스터처럼 쓴다.

```css
.screen-title {
  font-size: 42px;
  line-height: 0.92;
  font-weight: 900;
  letter-spacing: -0.06em;
  text-transform: uppercase;
}
```

예:

```text
UPLOAD
AN APP.
```

```text
ADD
DETAILS.
```

### Header Title

상단바 타이틀은 작지만 매우 단단하게.

```css
.top-title {
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.06em;
  text-transform: uppercase;
}
```

### Body / Helper Text

본문은 크게 꾸미지 않는다.

```css
.helper {
  font-size: 17px;
  line-height: 1.25;
  color: #7D7D78;
  letter-spacing: -0.03em;
}
```

### 원칙

- 제목은 크게, 굵게, 촘촘하게.
- 설명은 회색, 낮은 대비, 짧게.
- 버튼 안 텍스트도 굵게.
- 작은 라벨도 너무 얇게 만들지 않는다.
- serif, hand-written, futuristic font는 쓰지 않는다.

---

## 6. 버튼

### Primary CTA

가장 중요한 액션은 검정색 pill 버튼이다.

```css
.primary-button {
  width: 100%;
  height: 66px;
  border-radius: 999px;
  background: #000;
  color: #fff;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.04em;
  box-shadow: 0 28px 40px rgba(0, 0, 0, 0.18);
}

.primary-button:active {
  transform: scale(0.98);
}

.primary-button:disabled {
  background: #CFCFC7;
  box-shadow: none;
}
```

버튼은 “예쁜 버튼”보다 **누르면 확실히 다음으로 넘어갈 것 같은 물성**이 중요하다.

### Secondary Button

보조 버튼은 검정 채움 대신 선/연한 면으로 처리한다.

```css
.secondary-button {
  border: 2px solid #D7D7CF;
  background: #FFFDF5;
  color: #050505;
  border-radius: 24px;
  font-weight: 800;
}
```

### Icon Button

작은 액션은 원형 버튼.

```css
.icon-button {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

## 7. 선택 카드

선택지는 크고 넓은 pill-card 형태가 좋다.

```css
.choice-card {
  min-height: 86px;
  padding: 20px;
  border-radius: 32px;
  border: 2px solid #D8D8D0;
  background: #F8F8F3;
}

.choice-card.selected {
  border-color: #000;
  background: #FFFDF5;
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.08);
}
```

구성:

- 왼쪽: 커스텀 라인 아이콘
- 중앙: 굵은 제목 + 짧은 설명
- 오른쪽: 선택 시 검정 원 안의 체크

이모지 아이콘은 피하고, 단순한 라인 아이콘을 쓴다.

---

## 8. 아이콘 스타일

아이콘은 `NuevoGlyph`처럼 **원형/캡슐 안에 들어간 검정 라인 SVG**가 기준이다.

### Icon Container

```css
.glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 2px solid #D8D8D0;
  background: #FFFDF5;
  color: #000;
}

.glyph.selected {
  border-color: #000;
  background: #000;
  color: #fff;
}
```

### SVG 규칙

- stroke: currentColor
- stroke-width: 2.5-3
- fill은 최소화
- 복잡한 illustration 금지
- 이모지 대체용이 아니라 UI language로 쓰기

콘텐츠 타입 예시:

- interactive: 작은 스크린 + play 삼각형
- audio: 세로 wave bar
- image: 사각 프레임 + 산/점 형태
- revenue: dollar/line mark
- remix: 순환 arrow

---

## 9. 입력 필드

입력 필드는 흰 박스보다 **투명한 종이 위의 라인 입력**에 가깝게 둔다.

```css
.field {
  width: 100%;
  padding: 12px 16px;
  border-radius: 18px;
  border: 1px solid #D7D7CF;
  background: transparent;
  color: #050505;
  font-size: 15px;
}

.field::placeholder {
  color: #B7B7AF;
}

.field:focus {
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}
```

폼 라벨은 작지만 굵게.

```css
.field-label {
  font-size: 14px;
  font-weight: 800;
  color: #050505;
}
```

---

## 10. Bottom Navigation

하단 네비게이션은 앱 시트 안쪽이 아니라 **검정/짙은 회색 바**처럼 느껴져야 한다.

```css
.bottom-nav {
  height: 68px;
  background: #30302F;
  color: #fff;
  border: 0;
}

.bottom-nav .create-button {
  width: 54px;
  height: 42px;
  border-radius: 999px;
  background: #fff;
  color: #000;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
}
```

원칙:

- 하단 바는 명확히 어둡게.
- 중앙 핵심 버튼은 흰 pill로 띄운다.
- 텍스트 라벨보다 아이콘 중심.
- 선택 상태도 과한 컬러 대신 weight/contrast로 표현.

---

## 11. 모션

모션은 작고 물리적으로.

```css
.pressable {
  transition: transform 120ms ease, opacity 120ms ease;
}

.pressable:active {
  transform: scale(0.98);
}
```

사용:

- 버튼 누를 때 `scale(0.98)`
- 선택 카드 누를 때 살짝 눌림
- 완료 상태는 짧은 bounce 가능

피하기:

- 과한 spring
- 긴 fade
- floating decorative animation
- gradient orb animation

---

## 12. 화면 구성 패턴

### Form Screen

```text
Black background
  └─ warm sheet
      ├─ top bar
      ├─ step indicator
      ├─ huge title
      ├─ helper copy
      ├─ form controls
      └─ fixed bottom CTA
```

### Feed Screen

```text
Warm sheet
  ├─ compact top bar
  ├─ timeline/feed
  │   ├─ avatar + author row
  │   ├─ short text
  │   ├─ content viewer
  │   └─ action row
  └─ dark bottom nav
```

### Detail / Expanded Area

- 페이지 이동보다 인라인 확장 선호.
- 상단에 바로 실행/감상 영역.
- 반응/댓글/리믹스는 실행 영역 아래.
- 정보는 접힌 상태가 기본.

---

## 13. Do / Don't

### Do

- 검정 CTA를 크게 쓴다.
- 배경은 따뜻한 off-white로 둔다.
- radius는 충분히 크게 주되, 형태는 단순하게 유지한다.
- 헤드라인은 크고 짧게 쓴다.
- 아이콘은 직접 그린 듯한 간단한 SVG line으로 통일한다.
- 모바일 화면 하나가 “손에 잡히는 조작 패널”처럼 보이게 만든다.

### Don't

- CTA에 브랜드 컬러 여러 개를 섞지 않는다.
- 콘텐츠 타입에 이모지 아이콘을 그대로 쓰지 않는다.
- 카드 안에 카드 안에 카드를 넣지 않는다.
- 너무 많은 그림자와 gradient를 쓰지 않는다.
- 넓은 데스크톱 레이아웃을 먼저 설계하지 않는다.
- 설명 문구를 길게 늘리지 않는다.

---

## 14. 빠른 복사용 CSS

```css
:root {
  --black: #000000;
  --sheet: #F8F8F3;
  --sheet-2: #E2E2DC;
  --soft: #EFEFE8;
  --line: #D7D7CF;
  --ink: #050505;
  --muted: #7D7D78;
  --cream: #FFFDF5;
}

body {
  background: var(--black);
  color: var(--ink);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app-shell {
  max-width: 430px;
  min-height: calc(100vh - 80px);
  margin: 80px auto 0;
  background: var(--sheet);
  border-radius: 18px 18px 0 0;
  overflow: hidden;
}

.screen-title {
  font-size: 42px;
  line-height: 0.92;
  font-weight: 900;
  letter-spacing: -0.06em;
  text-transform: uppercase;
}

.primary-button {
  height: 66px;
  border-radius: 999px;
  background: var(--black);
  color: white;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.04em;
  box-shadow: 0 28px 40px rgba(0,0,0,0.18);
}

.choice-card {
  min-height: 86px;
  padding: 20px;
  border-radius: 32px;
  border: 2px solid var(--line);
  background: var(--sheet);
}

.choice-card.selected {
  border-color: var(--black);
  background: var(--cream);
  box-shadow: 0 18px 34px rgba(0,0,0,0.08);
}
```

---

## 15. 디자인 판단 기준

새 화면을 만들 때 아래 질문으로 판단한다.

1. 검은 무대 위에 올라온 따뜻한 앱 시트처럼 보이는가?
2. 가장 중요한 액션이 검정 pill CTA로 즉시 보이는가?
3. 제목은 충분히 크고 단단한가?
4. 설명 문구는 짧고 회색으로 물러나 있는가?
5. 이모지가 아니라 같은 계열의 라인 아이콘을 쓰고 있는가?
6. 모바일에서 손가락으로 누르기 편한 크기인가?
7. 컬러보다 대비, 여백, 형태로 위계를 만들었는가?

이 질문에 대부분 “예”라면 같은 visual concept 안에 있다.
