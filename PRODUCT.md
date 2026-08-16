# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, served by separate surfaces of this same site:

- **Consumers** looking for something to play in a social moment — a pub table, a house party, a dorm common room, a long car ride — who don't want to browse a fixed category list. They want to describe the situation ("quick card game, 4 people, no equipment") and get real options.
- **Venue operators** (pubs/bars, schools/universities, hostels/hotels, corporate offices) evaluating whether the app can drive engagement, dwell time, or social interaction on their premises. Reached via the Business Portal (`business.html`), currently **lead-gen only**: a contact form, no self-serve signup, pricing, or dashboard exists yet. Success on that surface is inquiries, not conversions.

## Product Purpose

A crowd-sourced library of social games (card, drinking, party, trivia, word, physical, strategy, guessing, acting, drawing, music, and more) that's findable by describing the moment rather than browsing a fixed deck. Every game is submitted by someone who actually plays it, so the library is meant to deepen with use rather than ship as a static content pack.

## Positioning

Most game apps ship a fixed deck someone wrote once. This one is community-submitted and grows with its users, with two mechanisms a static content pack can't truthfully copy:
- **Search by moment, not category** — plain-language input ("a quick card game for 4 people, no equipment") returns ranked real results instead of requiring the user to already know the right category.
- **AI-vetted structure, not AI-generated content** — users dictate or type a rough description of a game they know; AI normalizes it into a consistent structure (objective, setup, rules, difficulty, duration, player count). The AI's job is structuring submissions, not inventing them.

## Operating Context

- Mobile app: iOS was in App Store review and Android was "coming soon" as of the current site copy (2026-08-16) — this is a real-time launch-status claim on the homepage, not a fixed fact; check `index.html`'s hero badge before reusing it elsewhere, as it will go stale.
- Mailing list signup (consumer) and inquiry form (business) are the two live conversion points on the site today.
- Auth flow: password reset (`reset-password.html`) is a standalone, security-sensitive surface reached via emailed token link, deliberately isolated from the rest of the site's chrome (no nav/footer) and its motion is one-shot only (no perpetual/looping animation) since it's a trust-sensitive flow.
- Backend: a Railway-hosted API (`whats-that-game-backend-production.up.railway.app`) handles auth/password-reset; a separate API (`api.whatsthatgame.co.uk`) serves mailing-list signup, contact form, and live game/category counts. Deployed as a static site via Vercel (`vercel.json`, `outputDirectory: "."`).

## Capabilities and Constraints

- Live stats shown on the homepage (game count, category count) are fetched from the backend at load and fall back to static numbers if the call fails (CORS not yet configured for every origin) — this is a known, accepted gap, not a bug to silently "fix" by hardcoding.
- Business Portal is lead-gen only today (see Users) — do not design or write copy that implies self-serve venue signup, pricing, or a live dashboard exists.
- **App-side features under discussion, not committed and not yet built** (flagged 2026-08-16, unrefined): a social layer (profiles, seeing games other users liked), an ads-based monetization layer, a freemium tier gating an AI chatbot, and an i18n spike scoped narrowly to AI-translating only the structured game fields (objective/rules/setup) — not the whole UI. None of these should appear as marketing claims until confirmed; treat them as roadmap context only.
- No accessibility standard is formally set yet (confirmed 2026-08-16) — build sensibly, don't invent or claim a compliance target (e.g. WCAG AA) that hasn't been adopted.

## Brand Commitments

- Name: "What's That Game?" — always keep the question mark.
- Contact: hello@whatsthatgame.info; Instagram @whatsthatgame_ (public-facing contact channel; no phone contact).
- Logo: dice/game-die mark at `assets/wtg-logo.png` (also `assets/favicon.png`), used consistently across every page.

## Evidence on Hand

- Real, current homepage copy (hero, features, how-it-works, stats) exists in `index.html` and is the strongest source of truth for consumer-facing voice.
- Real venue-segment copy (pubs, schools/universities, hostels/hotels, corporate) exists in `business.html`.
- No testimonials, case studies, press mentions, or customer logos exist anywhere in the repo — do not fabricate any for future work.
- No pricing information exists anywhere in the repo (consumer or business) — treat pricing as undecided, not free-forever or paid-by-default.

## Product Principles

1. The library's value is real submissions from real players, not curated/generated content — never let a design or feature imply otherwise (e.g. no fake "editor's picks" that read as official content).
2. Consumer and Business are different products sharing one shell — don't blur B2C conversion patterns (mailing list, "notify me") into the B2B surface (inquiry-based) or vice versa.
3. The password-reset flow's calm, one-shot motion is a deliberate trust decision for a security-sensitive surface — don't inherit the marketing pages' more playful/looping motion language there.
4. Don't state or imply commitments from the roadmap discussion (social, ads, freemium, i18n) as shipped or confirmed — they're unrefined and unticketed.
