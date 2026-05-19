# nuevo Design / UI / UX Reference

**Updated:** 2026-05-19
**Purpose:** Keep the MVP app, `/ux-flow`, and `/ux-prototype` visually and behaviorally aligned.

## 1. Product Feeling

Core visual idea:

> Black stage, warm paper sheet, bold utilitarian type, clear mobile controls.

nuevo should feel like a fast mobile tool for playable apps, not a marketing landing page and not a generic SaaS dashboard. The app itself is the content. The UI should help people inspect, play, remix, and share with almost no explanation.

For external social traffic, the product should feel closer to Reels/Shorts/TikTok continuity than a directory. A visitor lands on one app, plays it, then scrolls into the next playable app before being asked to search.

## 2. Design Principles

- Mobile-first.
- Dense but readable.
- Clear black primary CTAs.
- Warm off-white surfaces.
- Strong type hierarchy.
- Minimal decoration.
- No card-inside-card layouts unless a repeated content item truly needs a frame.
- No decorative gradient orbs or generic AI glow.
- Keep feature text short. Let controls and state do the explaining.
- External-entry sessions use a Play-first Vertical Stack: first app in focus, next app below.

## 3. Core Tokens

```css
:root {
  --nuevo-black: #000000;
  --nuevo-ink: #050505;
  --nuevo-sheet: #F8F8F3;
  --nuevo-sheet-2: #E2E2DC;
  --nuevo-soft: #EFEFE8;
  --nuevo-line: #D7D7CF;
  --nuevo-muted: #7D7D78;
}
```

Usage:

- `--nuevo-black` / `#000000`: background stage, primary CTA, selected state.
- `--nuevo-sheet` / `#F8F8F3`: main sheet background.
- `--nuevo-soft` / `#EFEFE8`: secondary surface, disabled/soft groups.
- `--nuevo-line` / `#D7D7CF`: borders and dividers.
- `--nuevo-ink` / `#050505`: primary text.
- `--nuevo-muted` / `#7D7D78`: helper text and metadata.

Note: `@theme inline` maps `--color-warm` and `--color-cool` to `#000000`. Use `--nuevo-*` variables directly for design work.

## 4. Layout Pattern

The app should read as a mobile sheet on a black stage.

```css
body {
  background: #000;
}

.app-shell {
  max-width: 430px;
  min-height: calc(100dvh - 12px);
  margin: 12px auto 0;
  background: #F8F8F3;
  border-radius: 18px 18px 0 0;
  overflow: hidden;
}
```

The internal review pages can be wider boards, but their individual screens should still use the same mobile sheet language.

## 5. Typography

Use the system sans stack.

```css
font-family:
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Guidelines:

- Hero/form titles can be large and heavy.
- Compact panels should use smaller headings.
- Avoid negative letter spacing beyond existing local style when text can overflow.
- Keep button labels short.
- Korean text should not be clipped inside pills or cards.

## 6. Buttons and Controls

Primary CTA:

```css
.primary-button {
  height: 56px;
  border-radius: 999px;
  background: #000;
  color: white;
  font-weight: 900;
}
```

Use primary CTAs for:

- Start playing
- Publish
- Remix
- Continue with Google
- Export

Secondary actions use a bordered or soft background treatment.

Small icon actions should be round or compact, with text labels only when ambiguity would hurt UX.

## 7. Required MVP UX Surfaces

### External Deep Link

Must communicate:

- User came from an external app.
- `autoplay=true` means the experience is already running.
- Source is captured as YouTube/TikTok/Instagram/Reddit/Direct.
- User can play without login.
- Back keeps social deep-link visitors inside nuevo instead of ejecting them to the previous social app.

Prototype screen: `/ux-prototype`, “외부 앱 딥링크” and “상세 바로 체험”.

### Play-first Vertical Stack

Must communicate:

- The app is the full-focus content, not a preview card.
- The next app is available by scrolling down, not by learning search first.
- The transition is user-controlled scroll, never a forced timed autoplay.
- Recommended content should feel related: same tag, same creator, remix lineage, or similar play pattern.
- After 2-3 plays, feed/search/follow CTAs can appear as broader exploration.

Layout guidance:

- Keep top chrome compact on external-entry detail.
- Keep the embedded app large enough to feel like the main screen.
- The next-app section should start below the first app/result area with a clear title, creator, reason, and play CTA.
- Do not place the next app inside nested decorative cards.
- Avoid UI that steals touch/scroll from the embedded iframe.

Prototype status: needs update. The next `/ux-prototype` pass should add “외부 유입 → 첫 앱 전체화면 체험 → 다음 앱 스크롤 진입”.

### Upload

Must communicate:

- Paste an already-deployed app URL.
- URL compatibility check result.
- Add tags.
- Add up to 3 external resource links.
- Examples should include YouTube, Instagram, TikTok, GitHub.
- Publishing redirects to the new detail page.

Prototype screen: “올리기 + 외부 자료”.

### Remix

Must communicate:

- Remix is a growth/Fame loop, not just an edit action.
- Show original banner in upload mode.
- Show `N회 리믹스됨` on original cards/details.
- Show “이 앱의 리믹스들” on original detail.
- Notify original creator after remix publish.

Prototype screen: “리믹스 UX”.

### Studio

Must communicate:

- Fame and WES are the current MVP value.
- Revenue copy is conservative and secondary.
- Traffic source and CSV export are trust-building tools.

Prototype screen: “Fame Studio”.

## 8. Copy Guidelines

Use:

- “바로 체험”
- “다음 앱 바로 보기”
- “방금 본 앱과 비슷해요”
- “이 앱을 다르게 바꿔보기”
- “N회 리믹스됨”
- “외부 자료 링크”
- “Fame / WES”
- “예상 수익은 보조 정보”

Avoid:

- “수익 보장”
- “정산 완료”
- “브랜드 마켓플레이스 오픈”
- “AI가 앱을 만들어드립니다” as an MVP promise

## 9. Do / Don’t

Do:

- Keep primary actions visually obvious.
- Show state messages near the action that caused them.
- Preserve the user’s current path through login.
- Make external navigation explicit.
- Make remix lineage visible.

Don’t:

- Hide the app experience behind marketing copy.
- Over-focus on creator payouts before WES trust is proven.
- Add decorative visual noise.
- Use vague labels like “more” where route/action matters.
- Let internal QA pages drift from the real app.

## 10. Design QA Checklist

- Does an external visitor understand they can play now?
- Does an external visitor see a next playable app without searching?
- Does the vertical stack preserve iframe touch/scroll controls?
- Does upload clearly accept YouTube/Instagram/TikTok/GitHub links as supporting material?
- Is remix visible as a core loop, not a tucked-away icon?
- Is the login boundary clear and non-destructive?
- Are Studio metrics framed as Fame/WES before payout?
- Are all routes in `/ux-flow` reflected in actual app routes?
- Are `/ux-flow` and `/ux-prototype` reachable from Settings?
