# edison9733 — AI Automation Studio

Personal site for Edison Liu: an electronic & computer engineering student who
ships AI systems end to end. Clean light/dark aesthetic with a single lime
signal accent.

**Live:** https://edison9733.xyz

## Stack
React 19 + Vite + Tailwind CSS. No icon or animation libraries — icons are inline
SVG and scroll reveals use a small IntersectionObserver hook, so the bundle stays
lean and there are no extra dependencies to break.

```
src/
  App.jsx        # the whole site (nav, hero, services, work, approach, about, contact, footer)
  index.css      # Tailwind layers + studio tokens (buttons, cards, reveal)
  main.jsx       # React entry (BrowserRouter, single route)
api/
  contact.js     # serverless contact endpoint (stores submissions to a private inbox)
public/
  CNAME          # edison9733.xyz
index.html       # head, fonts, meta
tailwind.config.js  # studio palette + fonts
vercel.json      # SPA rewrites + security headers
```

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Deploy (Vercel)
The site is hosted on Vercel. `vercel.json` handles SPA rewrites and security
headers, and `api/contact.js` runs as a serverless function. Pushing to the
connected repo triggers an automatic build and deploy; the custom domain
(`edison9733.xyz`) is configured in the Vercel project settings.

## Editing
Everything is data-driven at the top of `src/App.jsx`:
- `SERVICES`, `SKILL_GROUPS`, `APPROACH`, `TECH` arrays — edit these to change content.
- `EMAIL`, `BOT_LINK` constants — your links.
- Colours live in `tailwind.config.js` (`accent` is the lime signal — change it to
  re-brand). Buttons/cards/reveal styles live in `src/index.css`.

## License
© edison9733 (Edison Liu). All rights reserved.
