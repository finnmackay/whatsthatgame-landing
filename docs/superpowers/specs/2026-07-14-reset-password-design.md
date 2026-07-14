# Reset Password Page — Design

## Context

Backend added password-reset flow (`POST /auth/forgot-password`, `POST /auth/reset-password`).
Reset emails link to `{FRONTEND_URL}/reset-password?token=<token>` on this static
marketing site (`whatsthatgame.co.uk`), which the backend requires the frontend
to serve.

This site is a build-step-free static HTML site (`index.html`, `business.html`,
deployed via Vercel per `vercel.json`). There is no login screen, no
forgot-password page, and no `/login` route anywhere in this repo — those live
in the mobile app. Per product decision, the reset link intentionally opens in
the system browser rather than deep-linking into the app (deep links break
when the app isn't installed).

## Scope

**In scope:** a single new page, `/reset-password`, that lets a user set a new
password after clicking the emailed link.

**Out of scope:**
- Forgot-password request form/page — that UI lives in the mobile app, which
  calls `POST /auth/forgot-password` directly.
- Rate-limit UI for `/auth/forgot-password` — not this page's concern.
- "Return to app" custom URL scheme button — no confirmed scheme registered
  yet; revisit later.
- Any `/login` route — doesn't exist on this site.

## File & Routing

- New file: `reset-password.html` at repo root. Self-contained: inline
  `<style>` and `<script>`, following the exact pattern of `index.html` /
  `business.html` (no shared CSS/JS files, no build tooling).
- `vercel.json` gets a `rewrites` entry mapping `/reset-password` →
  `/reset-password.html`. Query strings pass through rewrites unmodified, so
  `?token=...` reaches the page as-is.

## Visual Design

Reuses the existing dark/purple theme so the page doesn't look like it
belongs to a different product:
- Same CSS custom properties (`--bg`, `--bg-card`, `--border`, `--primary`,
  `--accent`, `--text`, `--muted`, `--gradient`, `--glow`) copied from
  `index.html`.
- Same fonts: Archivo Black for the page heading, Space Grotesk for
  sub-headings/buttons, Inter for body text — same Google Fonts `<link>` tags.
- Minimal nav: just the logo linking to `/`, no full nav bar with links —
  this is a landing point from an email, not a page users browse through.
- Centered card container styled like `.feature-card` / `.cta-section`
  (rounded corners, `--bg-card` background, `--border` border) holding the
  form.

## Page States

Single page, one `<script>` toggles between three states by
showing/hiding containers (mirrors the `success-msg` show/hide pattern
already used in `index.html`).

### 1. Form state (default)

- Two fields: "New password", "Confirm password" (both `type="password"`).
- Submit button, styled like `.signup-btn`.
- On page load: read `token` via `new URLSearchParams(location.search).get('token')`.
  If absent, skip straight to invalid-link state (never show the form).

**Client-side validation on submit** (before any network call):
- Both fields non-empty
- New password between 8 and 128 characters (matches backend
  `MIN_PASSWORD_LENGTH` / `MAX_PASSWORD_LENGTH` in `src/core/security.py`,
  enforced on `ResetPasswordRequest.new_password`). No complexity rule
  (no special-char/uppercase/number requirement) — backend doesn't enforce
  one, so client doesn't either.
- Passwords match

Validation failures show an inline error message under the form; no network
call is made.

### 2. Invalid-link state

Shown when: no token on load, OR the API returns 400.

Message: *"This reset link has expired or is invalid. Please head back to
the app and request a new one."*

Includes a link back to `/` (homepage). No auto-redirect — this is a static
message state, not a timed transition.

### 3. Success state

Shown when: API returns 200.

Message: *"Password reset successfully — head back to the app to log in."*

Includes a link back to `/` (homepage) as a secondary action. No
auto-redirect (there's no `/login` page on this site to redirect to, and
the user needs to go to the mobile app anyway).

### Network error (not one of the above)

If the fetch itself fails (no response, timeout, non-JSON, or any status
other than 200/400): re-enable the form, show a generic inline retry
message ("Something went wrong — please try again."). Stay in form state.

## API Integration

```
POST https://whats-that-game-backend-production.up.railway.app/auth/reset-password
Content-Type: application/json

{ "token": "<from query string>", "new_password": "<user input>" }
```

- On submit: disable the button, change its label to "Resetting…"
  (mirrors `handleSignup`'s existing `btn.disabled` / label-swap pattern in
  `index.html`).
- 200 → success state.
- 400 → invalid-link state (token invalid/expired — the only thing the
  backend returns 400 for on this endpoint).
- 422 or any other status / network failure → network-error handling
  above, button re-enabled. In practice 422 (backend field validation,
  e.g. password length) shouldn't occur since client-side validation
  already enforces the same 8–128 range, but it's handled distinctly from
  400 rather than lumped into "invalid link" if it ever does.
- `Content-Type: application/json` header is required on the request.

The API base URL is hardcoded as a `const` at the top of the page's
`<script>` — no environment variable indirection, since this repo has no
build step to inject one.

**CORS:** confirmed 2026-07-14 that `whatsthatgame.co.uk` is already present
in the backend's `CORS_ORIGINS` on Railway — no backend config change
needed before this page can call the API.

## Testing

No test framework in this repo. Verification is manual: load
`reset-password.html?token=test` locally (e.g. `npx serve` or opening the
file), exercise all three states by editing the fetch mock/response or
using browser devtools to fake responses, and confirm the `vercel.json`
rewrite works after deploy (or via `vercel dev` if available).
