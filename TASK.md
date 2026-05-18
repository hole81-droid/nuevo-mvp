# nuevo MVP Task Tracker

**Updated:** 2026-05-18
**Current focus:** Make the MVP prove external deep-link play, upload with context links, remix growth, and creator Fame/WES.

## MVP Definition

MVP is complete when:

- A creator can upload an already-deployed app URL.
- A visitor can enter from an external app and play immediately.
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
- [ ] Real mobile QA: Instagram/TikTok/YouTube in-app browsers
- [ ] Real LCP QA: `/post/[id]` and `/post/[id]?autoplay=true` under 3 seconds target

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
- [x] QA: empty states and no-result states

## P1 Authentication / Guardrails

- [x] Google login exists
- [x] `/setup` profile setup exists
- [x] Upload requires login
- [x] Remix requires login
- [x] Reactions/comments/saves require login
- [x] Guest play remains available
- [x] QA: OAuth callback failure copy and next restoration

## Internal UX Review Surfaces

- [x] `/ux-flow` route created
- [x] `/ux-flow` compares prototype with current MVP app status
- [x] `/ux-flow` lists route/button/message/auth movement
- [x] `/ux-prototype` route created
- [x] `/ux-prototype` has screen-first mobile mockups
- [x] Prototype covers external deep link immediate play
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
