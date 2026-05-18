# nuevo MVP

nuevo is a mobile-first platform for posting already-built AI apps, letting visitors play them instantly from external links, and growing them through reactions, sharing, remix, and creator Fame/WES data.

## Core MVP

- External deep links from YouTube, Instagram, TikTok, Reddit, GitHub, and other pages can open directly into playable detail pages.
- `?autoplay=true` starts the embedded app immediately.
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
| `/` | Public feed |
| `/[handle]/[slug]` | Creator deep link |
| `/post/[id]` | Playable app detail |
| `/explore` | Search, tags, categories |
| `/upload` | Post an app URL and metadata |
| `/upload?remix=[postId]` | Remix an existing app |
| `/notifications` | Remix/reaction/comment notifications |
| `/profile/[username]` | Creator profile |
| `/studio` | Creator Fame/WES dashboard |
| `/settings` | MVP demo seed and internal QA links |
| `/ux-flow` | Internal UX flow checklist |
| `/ux-prototype` | Internal mobile prototype board |

## UX Review

Use these internal pages before making more product changes:

- `/ux-flow`: compares the current MVP app with the intended UX flow, including routes, buttons, login guards, state messages, and internal/external movement.
- `/ux-prototype`: screen-first mobile prototype board for external deep link play, upload with external links, remix UX, Studio/WES, and settings QA.

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

- `PRD.md`: product requirements and MVP intent
- `PRD_V3.md`: implementation-facing product spec
- `TASK.md`: current task tracker
- `Design Ref.md`: UI/UX and visual reference
- `WORKLOG.md`: session history and operational notes
- `AGENTS.md`, `CLAUDE.md`: agent/project context
