// Vercel serverless function: SSRs a share-landing page for a single game so
// social crawlers (which don't run JS) see real og:title/og:image per game.
// Routed here from /game/:id via the rewrite in vercel.json.
const API_BASE = "https://api.whatsthatgame.co.uk";
const SITE_URL = "https://whatsthatgame.co.uk";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/whats-that-game/id6781044898?ppid=01c09469-36d8-4b2b-8d5a-d7a070db92ed";
// Not live yet — Android visitors get a disabled "coming soon" badge until this is set.
const PLAY_STORE_URL = "";
const DEFAULT_IMAGE = `${SITE_URL}/assets/wtg-logo.png`;

// Mirrors gameTypeIconConfigs in whats-that-game-app (src/types/game.ts) — same
// per-type fallback the app uses when a game has no icon of its own, so a game
// looks the same on the web share page as it does in the app. Glyph names here
// use underscores because the web page renders Material Symbols Outlined
// (Google Fonts), while the app's MaterialIcons font takes hyphenated names —
// same icon, different font family, different ligature format.
const GAME_TYPE_ICONS = {
  Card: "style",
  Dice: "casino",
  Drinking: "sports_bar",
  Trivia: "quiz",
  Word: "record_voice_over",
  Physical: "sports_kabaddi",
  Strategy: "extension",
  Guessing: "gesture",
  Acting: "theater_comedy",
  Drawing: "brush",
  Music: "music_note",
  Other: "diamond",
};

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c])
  );
}

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + "…";
}

function formatPlayerCount(playerCount) {
  if (!playerCount) return null;
  const { min_players: min, max_players: max } = playerCount;
  if (min === max) return `${min} player${min === 1 ? "" : "s"}`;
  return `${min}–${max} players`;
}

// Same visual language as index.html / reset-password.html (tailwind CDN + shared token set).
function layout({ title, description, ogImage, canonicalUrl, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<title>${title}</title>
<link rel="icon" type="image/png" href="/assets/favicon.png"/>
<meta name="description" content="${description}" />
<link rel="canonical" href="${canonicalUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:image" content="${ogImage}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${ogImage}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
tailwind.config = {
    theme: {
        extend: {
            colors: {
                "secondary": "#635b6e",
                "error": "#ba1a1a",
                "error-container": "#ffdad6",
                "on-error-container": "#93000a",
                "on-error": "#ffffff",
                "primary": "#630ed4",
                "primary-container": "#7c3aed",
                "on-primary": "#ffffff",
                "on-primary-container": "#ede0ff",
                "tertiary-container": "#fff3d6",
                "on-tertiary-container": "#5c4300",
                "on-secondary-container": "#4a4456",
                "outline": "#7b7487",
                "outline-variant": "#ccc3d8",
                "surface": "#fcf8ff",
                "background": "#fcf8ff",
                "on-background": "#181445",
                "on-surface": "#181445",
                "on-surface-variant": "#4a4455",
                "surface-container-lowest": "#ffffff",
                "surface-container-low": "#f6f2ff",
                "surface-container": "#efebff",
                "surface-container-high": "#e9e5ff"
            },
            fontFamily: {
                "headline": ["Plus Jakarta Sans"],
                "display": ["Plus Jakarta Sans"],
                "body": ["Plus Jakarta Sans"],
                "label": ["Plus Jakarta Sans"]
            }
        }
    }
}
</script>
<style>
body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #fcf8ff; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.tactile-border { border: 2px solid #181445; box-shadow: 4px 4px 0px 0px #181445; }
.active-press:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px 0px #181445; }
.logo-drop { opacity: 0; transform: translateY(-24px) scale(0.92); animation: logoDrop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
@keyframes logoDrop { to { opacity: 1; transform: translateY(0) scale(1); } }
.stage-in { opacity: 0; transform: translateY(16px); animation: stageIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards; animation-delay: 0.15s; }
@keyframes stageIn { to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) {
    .logo-drop, .stage-in { animation: none !important; opacity: 1 !important; transform: none !important; }
}
</style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center px-5 pt-5 pb-20 relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
<main class="w-full max-w-[420px] flex flex-col items-center relative z-10">
<a href="/" class="mb-3 logo-drop">
<img alt="What's That Game? Logo" class="w-40 h-40 object-contain drop-shadow-lg" src="/assets/wtg-logo.png">
</a>
${bodyHtml}
</main>
</body>
</html>
`;
}

const APPLE_ICON = `<svg class="inline-block w-[1.2em] h-[1.2em] shrink-0" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>`;
const GOOGLE_ICON = `<svg class="inline-block w-[1.2em] h-[1.2em] shrink-0" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 220.6l-58.9-34-65.7 64.5 65.7 64.5 60.1-34.6c17.4-11.7 17.4-46.7-1.2-60.4zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>`;

// Secondary-weight badge (light border, no tactile shadow) so it visibly recedes
// behind the primary "Open in App" button instead of competing with it.
function storeBadgeEl({ href, icon, label, disabled, compact }) {
  const widthClass = compact ? "flex-1" : "w-full";
  const paddingClass = compact ? "px-3" : "px-6";
  const base = `${widthClass} border-2 border-outline-variant rounded-full py-4 ${paddingClass} flex items-center justify-center gap-2 font-bold transition-all whitespace-nowrap`;
  if (disabled) {
    return `<div aria-disabled="true" class="${base} bg-surface-container-low text-on-surface-variant opacity-70">${icon}${label}</div>`;
  }
  return `<a href="${href}" target="_blank" rel="noopener" class="${base} bg-white text-on-surface hover:bg-surface-container-low active:scale-[0.98]">${icon}${label}</a>`;
}

function appStoreBadge(compact) {
  return storeBadgeEl({
    href: APP_STORE_URL,
    icon: APPLE_ICON,
    label: compact ? "App Store" : "Download on the App Store",
    compact,
  });
}

function playStoreBadge(compact) {
  if (!PLAY_STORE_URL) {
    return storeBadgeEl({
      icon: GOOGLE_ICON,
      label: compact ? "Coming Soon" : "Coming Soon to Android",
      disabled: true,
      compact,
    });
  }
  return storeBadgeEl({
    href: PLAY_STORE_URL,
    icon: GOOGLE_ICON,
    label: compact ? "Google Play" : "Get it on Google Play",
    compact,
  });
}

// Real device (iOS/Android) gets one clear badge for its own store. Everything
// where the OS can't be trusted — desktop, crawlers, and in-app webviews like
// Twitter/Instagram/WhatsApp that don't reflect the phone's real OS — gets both,
// side by side, so nobody's store is hidden from them.
function classifyDevice(userAgent) {
  const ua = userAgent || "";
  if (/FBAN|FBAV|Instagram|WhatsApp|Line\/|MicroMessenger/i.test(ua))
    return "ambiguous";
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "ambiguous";
}

function storeBadges(userAgent) {
  const device = classifyDevice(userAgent);
  if (device === "ios") return appStoreBadge(false);
  if (device === "android") return playStoreBadge(false);
  return `<div class="w-full flex gap-2">${appStoreBadge(true)}${playStoreBadge(
    true
  )}</div>`;
}

function messageCard({ icon, iconClass, heading, body }) {
  return `<div class="w-full bg-white tactile-border rounded-xl p-8 flex flex-col items-center text-center gap-4 stage-in">
<div class="w-16 h-16 rounded-full ${iconClass} flex items-center justify-center">
<span class="material-symbols-outlined text-[36px]">${icon}</span>
</div>
<h1 class="text-on-background font-headline text-4xl font-extrabold tracking-tight">${heading}</h1>
<p class="text-on-surface-variant font-body text-base">${body}</p>
</div>`;
}

// So a broken/stale share link doesn't strand the visitor with nowhere to go.
function homeLink() {
  return `<a href="/" class="mt-4 inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline">
<span class="material-symbols-outlined text-base">arrow_back</span>
Back to What's That Game
</a>`;
}

// Deep-link into the app with a timed fallback to the store — shared by any
// state that needs an "Open in App" CTA (the game page and the age gate).
function openInAppButton({ schemeUrl, label }) {
  return `<a href="${APP_STORE_URL}" id="open-in-app-btn" data-scheme-url="${schemeUrl}" target="_blank" rel="noopener" class="mt-2 w-full bg-primary text-on-primary font-body font-bold py-4 rounded-full tactile-border active-press transition-all flex items-center justify-center gap-2">
${label}
<span class="material-symbols-outlined">arrow_forward</span>
</a>
<script>
(function () {
  var btn = document.getElementById('open-in-app-btn');
  if (!btn) return;
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var schemeUrl = btn.dataset.schemeUrl;
    var fallbackUrl = btn.href;
    var start = Date.now();
    window.location.href = schemeUrl;
    setTimeout(function () {
      if (!document.hidden && Date.now() - start < 2000) {
        window.location.href = fallbackUrl;
      }
    }, 1200);
  });
})();
</script>`;
}

function notFoundHtml(shareUrl) {
  return layout({
    title: "Game not found | What's That Game?",
    description: "This game couldn't be found — it may have been removed.",
    ogImage: DEFAULT_IMAGE,
    canonicalUrl: shareUrl,
    bodyHtml:
      messageCard({
        icon: "search_off",
        iconClass: "bg-error-container text-error",
        heading: "Game Not Found",
        body: "We couldn't find this game — the link may be broken or the game may have been removed.",
      }) + homeLink(),
  });
}

function ageRestrictedHtml(shareUrl, userAgent, gameId) {
  return layout({
    title: "Sign in required | What's That Game?",
    description:
      "This game has adult content — open it in the app and sign in with a verified 18+ account to view it.",
    ogImage: DEFAULT_IMAGE,
    canonicalUrl: shareUrl,
    bodyHtml:
      messageCard({
        icon: "lock",
        iconClass: "bg-tertiary-container text-on-tertiary-container",
        heading: "18+ Content",
        body: "This game is age-restricted. Open it in the app and sign in with a verified 18+ account to view it.",
      }) +
      `<div class="w-full mt-4 flex flex-col items-center gap-3">
${openInAppButton({
  schemeUrl: `wtg://game/${encodeURIComponent(gameId)}`,
  label: "Open in App",
})}
${storeBadges(userAgent)}
</div>`,
  });
}

function errorHtml(shareUrl) {
  return layout({
    title: "Something went wrong | What's That Game?",
    description:
      "We couldn't load this game right now — please try again shortly.",
    ogImage: DEFAULT_IMAGE,
    canonicalUrl: shareUrl,
    bodyHtml:
      messageCard({
        icon: "error",
        iconClass: "bg-error-container text-error",
        heading: "Something Went Wrong",
        body: "We couldn't load this game right now. Please try again shortly.",
      }) + homeLink(),
  });
}

function gameHtml(game, shareUrl, userAgent) {
  const name = escapeHtml(game.name);
  const description = escapeHtml(truncate(game.description || "", 200));
  const ogImage = game.image_url || DEFAULT_IMAGE;
  const iconGlyph = game.icon
    ? game.icon.replace(/-/g, "_")
    : GAME_TYPE_ICONS[game.game_type] || "casino";
  const gameType = escapeHtml(game.game_type);
  const players = formatPlayerCount(game.player_count);

  const metaChips = [
    gameType,
    players,
    game.duration ? escapeHtml(game.duration) : null,
  ]
    .filter(Boolean)
    .map(
      (chip) =>
        `<span class="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-bold text-xs uppercase tracking-wide">${chip}</span>`
    )
    .join("");

  const adultWarning = game.has_adult_content
    ? `<div class="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold"><span class="material-symbols-outlined text-base">warning</span> 18+ Content</div>`
    : "";

  return layout({
    title: `${name} | What's That Game?`,
    description:
      description ||
      `Play ${name} — find it and hundreds more social games in the What's That Game app.`,
    ogImage,
    canonicalUrl: shareUrl,
    bodyHtml: `<div class="w-full bg-white tactile-border rounded-xl p-8 flex flex-col items-center text-center gap-5 stage-in">
<div class="w-16 h-16 rounded-full bg-surface-container-low text-primary flex items-center justify-center">
<span class="material-symbols-outlined text-[36px]">${iconGlyph}</span>
</div>
<h1 class="text-on-background font-headline text-4xl font-extrabold tracking-tight">${name}</h1>
<div class="flex flex-wrap items-center justify-center gap-2">${metaChips}</div>
${
  description
    ? `<p class="text-on-surface-variant font-body text-base">${description}</p>`
    : ""
}
${adultWarning}
${openInAppButton({
  schemeUrl: `wtg://game/${encodeURIComponent(game.id)}`,
  label: `Open in WTG`,
})}
${storeBadges(userAgent)}
</div>`,
  });
}

module.exports = async (req, res) => {
  const { id } = req.query;
  const shareUrl = `${SITE_URL}/game/${encodeURIComponent(
    typeof id === "string" ? id : ""
  )}`;
  const userAgent = req.headers["user-agent"];
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (!id || typeof id !== "string") {
    res.status(404).send(notFoundHtml(shareUrl));
    return;
  }

  let apiRes;
  try {
    apiRes = await fetch(`${API_BASE}/games/${encodeURIComponent(id)}`);
  } catch {
    res.status(502).send(errorHtml(shareUrl));
    return;
  }

  if (apiRes.status === 404) {
    res.status(404).send(notFoundHtml(shareUrl));
    return;
  }
  if (apiRes.status === 401) {
    res.status(200).send(ageRestrictedHtml(shareUrl, userAgent, id));
    return;
  }
  if (!apiRes.ok) {
    res.status(502).send(errorHtml(shareUrl));
    return;
  }

  const game = await apiRes.json();
  res.status(200).send(gameHtml(game, shareUrl, userAgent));
};
