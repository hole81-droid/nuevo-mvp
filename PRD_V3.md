# nuevo MVP Product Spec

**Version:** 3.1
**Updated:** 2026-05-18
**Source of truth:** `PRD.md` for product intent, this file for implementation-facing spec.

## 1. MVP Scope Summary

The MVP must prove one thing:

> A creator can post an already-built AI app, send traffic from external platforms, let visitors play instantly, and grow through remix/Fame loops.

## 2. Route Spec

| Route | Purpose | Auth | Required UX |
| --- | --- | --- | --- |
| `/` | Public feed | Public | Cards, play entry, share, remix social proof |
| `/[handle]/[slug]` | Creator deep link | Public | Resolve to post detail, preserve autoplay/source |
| `/post/[id]` | App detail and play | Public | Guest play, deferred/autoplay iframe, protected social actions |
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
- Guest users can play.
- Protected actions redirect to `/login?next=[current path/query/hash]`.

### Acceptance Criteria

- From a deep link, user sees playable detail without landing-page detour.
- Autoplay detail and normal detail both render correctly.
- Source is classified as Instagram/TikTok/YouTube/Reddit/Direct.
- Login redirect preserves current URL.

## 4. Upload Spec

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

## 5. Remix Spec

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

## 6. Fame / WES Spec

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

## 7. Prototype Comparison

Current prototype coverage:

| MVP Experience | App status | Prototype status |
| --- | --- | --- |
| External deep link immediate play | Implemented | First screen |
| Upload external resource links | Implemented | Upload mock |
| Remix social proof and lineage | Implemented | Dedicated remix mock |
| Creator Fame Studio | Implemented | Studio mock |
| Settings QA links | Implemented | Settings mock |
| Mobile LCP proof | Script exists, local browser blocked | Gap noted |
| Real in-app browser QA | Not yet verified | Gap noted |

## 8. Remaining MVP Work

P0 verification:

- Run mobile LCP on a working Chrome/real device.
- Test external links inside Instagram/TikTok/YouTube in-app browsers.
- Confirm live Supabase schema matches `posts.tags`, `posts.external_links`, traffic source, remix notification fields.

P1 polish:

- Make upload external-link examples explicit in production UI copy.
- Add clearer inline error text for iframe-blocked URLs.
- Review Korean copy across protected actions and post-publish success states.

P2 after MVP:

- In-app app generator
- Public brand dashboard
- Real payout/withdrawal
- Advanced recommendation and settlement chain
