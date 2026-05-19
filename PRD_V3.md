# nuevo MVP Product Spec

**Version:** 3.2
**Updated:** 2026-05-19
**Source of truth:** `PRD.md` for product intent, this file for implementation-facing spec.

## 1. MVP Scope Summary

The MVP must prove one thing:

> A creator can post an already-built AI app, send traffic from external platforms, let visitors play instantly, continue into another playable app, and grow through remix/Fame loops.

## 2. Route Spec

| Route | Purpose | Auth | Required UX |
| --- | --- | --- | --- |
| `/` | Public feed | Public | Cards, play entry, share, remix social proof |
| `/[handle]/[slug]` | Creator deep link | Public | Resolve to post detail, preserve autoplay/source |
| `/post/[id]` | App detail and play | Public | Guest play, deferred/autoplay iframe, external entry context, next playable app |
| `/explore` | Discovery | Public | Search, tags, categories, external-link label search |
| `/upload` | Post an app | Login | URL check, metadata, tags, external links, publish |
| `/upload?remix=[postId]` | Remix flow | Login | Original banner, remixability check, lineage |
| `/notifications` | User notifications | Conditional | Remix, reaction, comment, revenue/tier notices |
| `/profile/[username]` | Creator profile | Conditional | Originals, remixes, liked/saved sections |
| `/studio` | Creator Fame dashboard | Login | WES, traffic source, export |
| `/settings` | Operations and QA | Login-designed | Demo seed, UX review links |
| `/ux-flow` | Internal UX checklist | Internal | Flow and route comparison |
| `/ux-prototype` | Internal prototype board | Internal | Screen-first review of core MVP |

## 3. Deep Link Spec

### Input

External links may come from:

- YouTube description
- Instagram bio/reel/link sticker
- TikTok bio/video description
- Reddit/Discord/GitHub/README links

### URL Shape

```text
https://nuevo.app/@{handle}/{slug}
https://nuevo.app/@{handle}/{slug}?autoplay=true&utm_source=youtube
https://nuevo.app/post/{id}?autoplay=true&utm_source=tiktok
```

### Behavior

- `autoplay=true` mounts iframe immediately.
- Missing `autoplay` uses a tap-to-start detail screen.
- `utm_source` wins over referrer if both exist.
- Social aliases such as `ig`, `tt_bio`, and `yt_shorts` normalize to Instagram/TikTok/YouTube.
- External social autoplay visits show source-aware entry copy.
- External social autoplay visits use internal back fallback instead of sending the user back out of nuevo.
- Guest users can play.
- Protected actions redirect to `/login?next=[current path/query/hash]`.
- After the first app experience, the detail page should expose the next recommended playable app through the vertical stack.

### Acceptance Criteria

- From a deep link, user sees playable detail without landing-page detour.
- Autoplay detail and normal detail both render correctly.
- Source is classified as Instagram/TikTok/YouTube/Reddit/Direct.
- User understands they came from an external social app and that the app is already running.
- Back from an external autoplay session keeps the user inside nuevo.
- A next playable app is visible by scrolling below the first experience.
- Login redirect preserves current URL.

## 4. Play-first Vertical Stack Spec

### Product Rule

External SNS users should not be asked to search or understand the feed before getting a second play. The default continuation is a vertical stack: first app in focus, then the next recommended playable app below it.

### Layout

- The first app detail uses an app-first view with minimal chrome.
- The embedded app remains the main surface above the fold.
- Below the first app, render a "next playable app" section that can become a full next detail card in later iterations.
- Keep feed/search/creator profile as secondary CTAs after the user has seen at least one more app option.

### Recommendation Source

MVP recommendation can be heuristic-based:

- `getSimilarPosts()` result from shared tags/title/text
- Same creator's other apps
- Remix siblings or original/remix lineage
- Daily playable / most remixed / longest played fallback

Advanced ranking is explicitly not required for MVP.

### Interaction Rules

- Do not auto-scroll or auto-advance while the iframe is being used.
- Use scroll, not a timed autoplay, as the user-controlled transition.
- Preserve guest play.
- Protected actions keep existing login redirect behavior.
- If no recommendation exists, fall back to public feed/explore CTAs.

### Acceptance Criteria

- Instagram/TikTok/YouTube deep-link session can move from first app to second app without opening search.
- Second app exposure is measurable.
- 2+ app session rate can be tracked separately from generic feed browsing.
- Touch/scroll behavior does not break embedded app controls.

## 5. Upload Spec

### Required Fields

- Content type
- App URL
- Title
- Description/text
- Tags, max 5
- External links, max 3
- Remix allowed toggle

### External Links

Supported as generic URL + label pairs. The UI should make these examples obvious:

- YouTube tutorial or demo
- Instagram post/reel
- TikTok video
- GitHub repository
- Original app/demo page

### URL Check

`POST /api/check-url` should detect:

- HTTPS/public reachability
- X-Frame-Options
- CSP `frame-ancestors`
- Basic iframe compatibility warnings

### Acceptance Criteria

- Invalid or blocked URLs explain why posting is risky.
- Posted detail page shows external resource links.
- External links do not open in the same app context unexpectedly.

## 6. Remix Spec

### Required Data

- `posts.remix_of`
- `posts.remixable`
- remix notification with `remix_post_id`
- remix count for original posts

### Required UX

- Original detail/card: show remix CTA only when the post is remixable and not already a remix child.
- Upload remix mode: show original banner.
- Remix blocked state: explain that the original does not allow remix.
- Original detail: show remix list.
- Feed/card: show `N회 리믹스됨` only when count > 0.
- Notification: tell original creator when a remix is posted.

### Acceptance Criteria

- `/upload?remix=[postId]` loads original metadata.
- Remix post saves `remix_of`.
- Original creator receives notification.
- Original post gains social proof and related remix list.

## 7. Fame / WES Spec

### WES Formula

```text
WES = sessions*1.0 + minutes*0.8 + reactions*1.5 + comments*2.0 + remixes*5.0
```

### Studio Must Show

- Session count
- Play minutes
- Reactions
- Comments
- Remixes
- Traffic source breakdown
- WES breakdown
- CSV export

### Copy Rule

Use “Fame”, “성과”, “WES”, “예상/보조 정보” wording. Avoid implying guaranteed payout or actual withdrawal in MVP.

## 8. Prototype Comparison

Current prototype coverage:

| MVP Experience | App status | Prototype status |
| --- | --- | --- |
| External deep link immediate play | Implemented | First screen |
| Play-first vertical stack after external entry | Planned | Needs prototype update |
| Upload external resource links | Implemented | Upload mock |
| Remix social proof and lineage | Implemented | Dedicated remix mock |
| Creator Fame Studio | Implemented | Studio mock |
| Settings QA links | Implemented | Settings mock |
| Mobile LCP proof | Script exists, local browser blocked | Gap noted |
| Real in-app browser QA | Not yet verified | Gap noted |

## 9. Remaining MVP Work

P0 verification:

- Run mobile LCP on a working Chrome/real device.
- Test external links inside Instagram/TikTok/YouTube in-app browsers.
- Add and QA the external-entry vertical stack / next playable app.
- Confirm live Supabase schema matches `posts.tags`, `posts.external_links`, traffic source, remix notification fields.

P1 polish:

- Make upload external-link examples explicit in production UI copy.
- Add clearer inline error text for iframe-blocked URLs.
- Update `/ux-prototype` to show the app-first vertical continuation.
- Review Korean copy across protected actions and post-publish success states.

P2 after MVP:

- In-app app generator
- Public brand dashboard
- Real payout/withdrawal
- Advanced recommendation and settlement chain
