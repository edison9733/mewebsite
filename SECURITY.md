# Security — what's done, and the honest limits

This is a **public, static, client-side React site** on Vercel, plus one
serverless endpoint (`/api/contact`). Some important truths up front:

- **A static front-end cannot be hidden.** Everything shipped to the browser —
  your JavaScript, copy, and structure — is readable via "view source" and the
  network tab. No setting changes that. Anyone claiming they can make a public
  site "un-viewable" is wrong. What you *can* do is remove real attack surface,
  lock down the one endpoint that does something, and deter scrapers.
- **robots.txt is voluntary.** Reputable crawlers (Google, OpenAI, Anthropic,
  Common Crawl) honour it. Malicious bots ignore it. Real blocking happens at the
  network/CDN edge, which is account-level config you do in a dashboard.

---

## Implemented in this repo (already live once deployed)

**Response headers (`vercel.json`) — applied to every route**
- [x] `Content-Security-Policy` — `default-src 'self'`; `script-src 'self'` (no
      inline scripts → blocks injected-script XSS); `object-src 'none'`;
      `base-uri 'self'`; `frame-ancestors 'none'`; `form-action 'self'`;
      `connect-src` limited to the few origins the demos actually call;
      `upgrade-insecure-requests`.
- [x] `Strict-Transport-Security` (HSTS, 2 years, includeSubDomains).
- [x] `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` → no clickjacking.
- [x] `X-Content-Type-Options: nosniff`.
- [x] `Referrer-Policy: strict-origin-when-cross-origin`.
- [x] `Permissions-Policy` — camera/mic/geolocation/browsing-topics denied.
- [x] `Cross-Origin-Opener-Policy: same-origin`.
- [x] `Cross-Origin-Resource-Policy: same-origin` — stops other sites hot-linking
      your resources.
- [x] `X-DNS-Prefetch-Control: off`, `X-Permitted-Cross-Domain-Policies: none`.

**Contact endpoint (`api/contact.js`) — the only server-side surface**
- [x] POST-only; everything else → 405.
- [x] **Origin allowlist** — cross-site browser POSTs (always carry an Origin)
      are rejected with 403.
- [x] **Content-Type must be `application/json`** → 415 otherwise.
- [x] **Rate limiting** — 5 requests / 10 min / IP → 429.
- [x] **Honeypot** field (`company`) — silently accepts and drops bot fills.
- [x] **Strict validation** — name 1–120, email format ≤200, message 1–5000.
- [x] **Body size cap** (~1 MB) and **control-char/null-byte stripping**.
- [x] **Generic error messages** — no internal details leaked.
- [x] No secrets in client code; the GitHub token + ntfy topic live only in
      Vercel env vars, never in the bundle.

**Crawlers / build**
- [x] `robots.txt` — allows search engines; disallows ~20 AI training/scraping
      bots (GPTBot, ClaudeBot, CCBot, PerplexityBot, Bytespider, **Google-Extended**
      so Gemini can't train while Googlebot still indexes, Applebot-Extended, …).
- [x] `sitemap.xml` for search engines.
- [x] Production build ships **no source maps** (`build.sourcemap: false`).

---

## Action items that need YOUR dashboard (I can't do these from code)

These are where "stop a determined attacker/bot" actually lives:

- [ ] **Vercel WAF / Attack Challenge Mode** — enable in Vercel → Project →
      Firewall. This is the real bot/DDoS/abuse blocker (rate rules, challenges,
      IP/ASN blocking). robots.txt is a request; this is enforcement.
- [ ] **(Optional) Put Cloudflare in front** — Cloudflare → Security → "Bot
      Fight Mode" / managed challenges, plus a firewall rule to block AI bot
      user-agents at the edge so non-compliant scrapers are actually stopped.
- [ ] **Rotate the GitHub token (`GH_TOKEN`)** used by the contact inbox, and
      scope it to *only* the inbox repo with the minimum permission (contents:
      write). If it can touch anything else, reduce it.
- [ ] **2FA on GitHub and Vercel** accounts (your real risk is account takeover,
      not the static site).
- [ ] **HSTS preload (optional)** — once you're confident everything is HTTPS,
      add `; preload` to the HSTS header and submit at hstspreload.org. This is a
      one-way commitment, so do it deliberately.
- [ ] **Consider moving the contact inbox off a GitHub repo** to a dedicated
      store (e.g., a form/email service or a small DB) so a token leak can't touch
      a code host at all.
- [ ] **Dependency hygiene** — run `npm audit` periodically and keep deps current.

---

## Reality check on "blocking LLMs from reading the site"
You can *deter* AI crawlers (robots.txt + edge rules above) and you *should* if you
don't want your content in training sets. You cannot *prevent* a person (or a bot
ignoring the rules) from loading a public page and reading what the browser
receives — that content is, by definition, served to the public. If specific
material must stay private, it should not be on a public page at all; put it
behind authentication or keep it off the site.
