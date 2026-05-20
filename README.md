# nuevo MVP

nuevo is a mobile-first platform for posting already-built AI apps, letting visitors play them instantly from external links, continuing them into the next playable app, and growing creators through reactions, sharing, remix, and Fame/WES data.

## Core MVP

- External deep links with `?autoplay=true` from YouTube, Instagram, TikTok, etc. open directly into the full-screen **Play Shell** (YouTube Shorts–like experience).
- **Play tab** in the bottom nav: full-screen app experience with always-visible overlay controls, state machine (loading → playing → done).
- Upload supports an app URL, tags, and external resource links such as YouTube, Instagram, TikTok, and GitHub.
- Remix preserves original lineage, shows `N회 리믹스됨`, notifies the original creator, and re-exposes the original app.
- Creator Studio shows Fame/WES, traffic source breakdown, and CSV export.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase Auth + PostgreSQL
- Vercel deployment

## Local Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Required local env:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-supabase-anon-public-key
```

Supabase OAuth redirect URLs:

```text
http://localhost:3000/auth/callback
https://nuevo-instagram-test.vercel.app/auth/callback
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Public feed (compact card player) |
| `/play` | Play tab — full-screen Shorts/Reels-style app experience |
| `/play/[id]` | Full-screen Play Shell for a specific app |
| `/[handle]/[slug]` | Creator deep link |
| `/post/[id]` | Playable app detail (non-autoplay) |
| `/post/[id]?autoplay=true` | External deep link — redirects to `/play/[id]` |
| `/explore` | Search, tags, categories |
| `/upload` | Post an app URL and metadata |
| `/upload?remix=[postId]` | Remix an existing app |
| `/notifications` | Remix/reaction/comment notifications |
| `/profile/[username]` | Creator profile |
| `/studio` | Creator Fame/WES dashboard |
| `/settings` | MVP demo seed and internal QA links |
| `/settings/delete-account` | Account deletion request flow |
| `/terms` | Public MVP terms |
| `/privacy` | Public privacy policy |
| `/report/post/[id]` | Post safety/IP/privacy report request |
| `/qa` | Real-device MVP QA checklist |
| `/ux-flow` | Internal UX flow checklist |
| `/ux-prototype` | Internal mobile prototype board |

## UX Review

Use these internal pages before making more product changes:

- `/ux-flow`: compares the current MVP app with the intended UX flow, including routes, buttons, login guards, state messages, and internal/external movement.
- `/ux-prototype`: screen-first mobile prototype board for external deep link play, Play-first Vertical Stack, upload with external links, remix UX, Studio/WES, and settings QA.
- `/qa`: execution checklist for real-device deep links, mobile LCP, live WES export, and final visual QA. PASS/FAIL/notes and QA target values are stored locally in the browser, with runnable target URL generation, copyable target-link bundles, per-item runbooks, pass criteria, evidence-required notes, evidence-missing filtering, a release gate banner, `npm run qa:lcp` JSON import, WES CSV import, and shareable JSON/Markdown reports that include and restore target URLs.

## Trust and Safety

- Login and settings link to live `/terms` and `/privacy` pages instead of placeholder URLs.
- Post detail pages include a report link that opens `/report/post/[id]` with a structured safety/IP/privacy report request.
- `/settings/delete-account` creates a structured account deletion request for the signed-in user.
- Current MVP deletion/report handling is email-based. A database-backed moderation queue and automated auth-user deletion remain future hardening work before app-store submission.

## Validation

```bash
npm run lint
npx tsc --noEmit --pretty false
node --test src\lib\*.test.mjs
npm run build
```

Mobile LCP check:

```bash
npm run qa:lcp
```

The output includes a `summary` block with pass/fail checks for the 3 second mobile LCP target, network/runtime errors, and whether the autoplay deep-link route mounted an iframe immediately. Override the threshold with `LCP_TARGET_MS=3000`.

If local headless Chrome/Edge fails with a GPU startup error, run the LCP check on a real browser/device or CI browser environment.

## Documentation

- `HANDOFF.md`: **first read for new developers** — vision, current status, remaining work, gotchas
- `PRD.md`: product requirements and MVP intent
- `PRD_V3.md`: implementation-facing product spec
- `TASK.md`: current task tracker
- `Design Ref.md`: UI/UX and visual reference
- `WORKLOG.md`: full session history including planning discussions (sessions 3 → 14)
- `AGENTS.md`, `CLAUDE.md`: agent/project context
- `supabase/schema.sql`: DB single source of truth
