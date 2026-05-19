# nuevo MVP Task Tracker

**Updated:** 2026-05-19
**Current focus:** Make the MVP prove external deep-link play, Play-first Vertical Stack retention, upload with context links, remix growth, creator Fame/WES, and minimum trust/safety readiness.

## MVP Definition

MVP is complete when:

- A creator can upload an already-deployed app URL.
- A visitor can enter from an external app and play immediately.
- After that first external app play, the visitor can scroll into a next recommended playable app without using search first.
- Upload supports external resource links such as YouTube, Instagram, TikTok, and GitHub.
- Remix creates lineage, social proof, notification, and feed/detail re-exposure.
- Creator can see Fame/WES and export event data.
- Product/design/QA can inspect the full flow through `/ux-flow` and `/ux-prototype`.

## P0 Product Experiences

### External app deep link

- [x] Creator slug route exists: `/[handle]/[slug]`
- [x] Post detail route exists: `/post/[id]`
- [x] `?autoplay=true` triggers immediate iframe mount
- [x] Normal detail entry defers iframe until user starts
- [x] `utm_source`/referrer traffic source classification exists
- [x] Guest users can play without login
- [x] Protected actions preserve `next` path through login
- [x] External-entry copy distinguishes Instagram/TikTok/YouTube autoplay visits
- [x] External social autoplay back button falls back to nuevo home
- [ ] Real mobile QA: Instagram/TikTok/YouTube in-app browsers
- [ ] Real LCP QA: `/post/[id]` and `/post/[id]?autoplay=true` under 3 seconds target

### Play-first Vertical Stack

- [x] Define external-entry detail layout for app-first vertical stack
- [x] Add next playable app section below first app detail
- [x] Reuse `getSimilarPosts()` or simple tag/creator/remix heuristics for MVP recommendations
- [x] Add fallback CTA to feed/explore when no next app exists
- [x] Ensure iframe touch/scroll interactions are not hijacked by stack behavior
- [x] Track next app reveal rate
- [x] Track second app play rate
- [x] Track 2+ app session rate from Instagram/TikTok/YouTube
- [x] Update `/ux-prototype` with “외부 유입 → 첫 앱 전체화면 체험 → 다음 앱 스크롤 진입”
- [x] Add QA runbook item for external-entry vertical stack on real mobile

### Upload with external resource links

- [x] `/upload` flow exists
- [x] App URL input exists
- [x] URL compatibility check exists: `/api/check-url`
- [x] Tags are stored
- [x] `posts.external_links` is supported
- [x] External links are normalized and limited to 3
- [x] Detail/card surfaces can render external links
- [x] Prototype explicitly shows YouTube, Instagram, TikTok, GitHub examples
- [x] Production upload copy should make those examples equally explicit
- [x] URL check errors should be reviewed for clarity in Korean

### Remix UX

- [x] `posts.remix_of` lineage exists
- [x] `posts.remixable` exists
- [x] `/upload?remix=[postId]` loads original post
- [x] `remixable=false` blocks remix
- [x] Remix CTA exists
- [x] `N회 리믹스됨` social proof exists
- [x] Original detail shows remix list
- [x] Remix publish notifies original creator
- [x] Feed can show remix-related cards/alerts
- [x] Prototype has a dedicated remix screen
- [x] QA: blocked remix state, missing original state, deleted original state

### Creator Fame / WES

- [x] `/studio` exists
- [x] WES formula exists
- [x] WES breakdown exists
- [x] Traffic source breakdown exists
- [x] Raw WES CSV export exists
- [x] WES export handles missing/malformed month parameters safely
- [x] WES export CSV columns and month range can be validated automatically
- [x] Revenue copy has been de-emphasized in PRD/design docs
- [ ] QA: export file columns and month filtering with live data

## P1 Discovery / Retention

- [x] Public feed exists
- [x] Explore page exists
- [x] Search covers title/body/tags/tool/author/external link labels
- [x] Category/tag discovery exists
- [x] Daily playable / most remixed / longest played logic exists
- [x] Related posts exist on detail
- [x] External-entry sessions prefer vertical next-app continuation before search/feed
- [x] QA: empty states and no-result states

## P1 Authentication / Guardrails

- [x] Google login exists
- [x] `/setup` profile setup exists
- [x] Upload requires login
- [x] Remix requires login
- [x] Reactions/comments/saves require login
- [x] Guest play remains available
- [x] QA: OAuth callback failure copy and next restoration

## P1 Trust / Safety / Store Readiness

- [x] Login links to public `/terms` and `/privacy` pages
- [x] Settings links to public terms/privacy pages
- [x] Settings links to an account deletion request flow
- [x] Post detail links to `/report/post/[id]`
- [x] Safety helper tests cover report/deletion request generation
- [x] Replace email-based report intake with a database-backed moderation queue
- [x] Add true auth-user deletion or service-role deletion workflow after Supabase secret handling is decided
- [ ] Add Sign in with Apple or store-specific login fallback if native App Store submission becomes the chosen path
- [ ] Add app-store privacy/data safety disclosure checklist before native submission

## Internal UX Review Surfaces

- [x] `/ux-flow` route created
- [x] `/ux-flow` compares prototype with current MVP app status
- [x] `/ux-flow` lists route/button/message/auth movement
- [x] `/ux-prototype` route created
- [x] `/ux-prototype` has screen-first mobile mockups
- [x] Prototype covers external deep link immediate play
- [x] Prototype covers external-entry Play-first Vertical Stack
- [x] Prototype covers upload external links
- [x] Prototype covers remix social proof, original banner, notification/re-exposure
- [x] Prototype covers Studio/WES/traffic source
- [x] Settings links to both UX review pages
- [x] `/qa` real-device QA checklist route created
- [x] `/qa` supports local PASS/FAIL/notes progress tracking
- [x] `/qa` supports status filtering, release gate, and JSON report export
- [x] `/qa` can import a saved QA JSON report on another PC/browser
- [x] `/qa` release gate blocks passed items that are missing required evidence notes
- [x] `/qa` can generate shareable Markdown QA reports
- [x] `/qa` can filter passed items that are missing required evidence notes
- [x] `/qa` includes per-item runbooks, evidence hints, and PASS criteria
- [x] `/qa` can import `npm run qa:lcp` JSON into the mobile LCP QA items
- [x] `/qa` can validate live WES CSV columns and month filtering from pasted export data
- [x] `/qa` can generate runnable target URLs from base URL, handle, slug, post ID, and month
- [x] `/qa` JSON and Markdown reports include the runnable target URLs used for QA
- [x] `/qa` JSON report import restores the saved QA target values
- [x] `/qa` persists QA target inputs locally across refreshes
- [x] `/qa` can copy/download a compact Markdown bundle of runnable QA target links

## Documentation

- [x] `PRD.md` rewritten as readable MVP PRD
- [x] `PRD_V3.md` rewritten as implementation-facing spec
- [x] `Design Ref.md` rewritten as UI/UX reference
- [x] `TASK.md` rewritten as current tracker
- [x] `README.md` documents UX review routes and validation commands
- [x] `WORKLOG.md` records current session updates
- [ ] Add screenshots after final visual QA if needed

## Validation Commands

Run before shipping:

```bash
npm run lint
npx tsc --noEmit --pretty false
node --test src\lib\*.test.mjs
npm run build
```

Optional LCP check:

```bash
npm run qa:lcp
```

`qa:lcp` now prints a summary with pass/fail checks for the 3 second LCP target, failed network requests, runtime exceptions, and autoplay iframe mounting. The real-device/mobile in-app browser QA items remain open until measured outside the local headless-browser limitation.

Known local issue: current Windows headless Chrome/Edge may fail with GPU startup errors. Use real Chrome/device or a CI/browser environment if this happens.

## Explicit Non-Goals For MVP

- [ ] In-app AI app generator
- [ ] Real payout/withdrawal
- [ ] Automated brand marketplace
- [ ] Advanced recommendation model
- [ ] Multi-level remix settlement
- [ ] Public brand dashboard
- [ ] Custom domain as launch blocker
