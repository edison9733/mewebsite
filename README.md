# edison9733 — AI Automation Studio

Personal site rebuilt as a solo **AI automation studio** in a Tryolabs-inspired
layout: services-first, a "Selected work" case-study band, an agency tone, and a
clean light/dark studio aesthetic with a single lime signal accent.

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
public/
  CNAME          # edison9733.xyz — copied into dist/ on build
index.html       # head, fonts, meta
tailwind.config.js  # studio palette + fonts
.github/workflows/deploy.yml  # builds and deploys to GitHub Pages
```

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Deploy (GitHub Pages)
A workflow at `.github/workflows/deploy.yml` builds the site and deploys `dist/`
to Pages on every push to `main`. In **Settings → Pages**, set **Source =
GitHub Actions**. The custom domain comes from `public/CNAME`; point DNS at
GitHub Pages (apex `A` records `185.199.108.153`, `185.199.109.153`,
`185.199.110.153`, `185.199.111.153`) and enable **Enforce HTTPS**.

(Alternatively, import the repo into Vercel or Netlify — both auto-detect Vite,
no config needed.)

## Editing
Everything is data-driven at the top of `src/App.jsx`:
- `SERVICES`, `WORK`, `APPROACH`, `TECH` arrays — edit these to change content.
- `EMAIL`, `GITHUB`, `BOT_LINK`, `BOT_REPO` constants — your links.
- Colours live in `tailwind.config.js` (`accent` is the lime signal — change it to
  re-brand). Buttons/cards/reveal styles live in `src/index.css`.

## Tryolabs projects to build next (reference repos)
The "Work" section lists automations to build from proven Tryolabs open-source
patterns. Clone these to study and rebuild your own versions:

- **Web automation** — Requestium (Requests + Selenium + Parsel):
  https://github.com/tryolabs/requestium
- **Multi-tool LLM agent + MCP** — UNICEF Geosphere agent (FastAPI + LlamaIndex +
  LiteLLM + MCP): https://github.com/tryolabs/unicef-agent
  (architecture umbrella: https://github.com/tryolabs/unicef-geospatial)
- **LLM guardrails** — RestrictToTopic validator:
  https://github.com/tryolabs/restricttotopic
- **Tool-calling agent (beginner)** — Fashion Assistant:
  https://github.com/tryolabs/fashion-assistant
- **CV automation pipeline** — Soccer video analytics (YOLO + Norfair):
  https://github.com/tryolabs/soccer-video-analytics
- **MLOps** — MLflow via Docker Compose:
  https://github.com/tryolabs/mlflow-docker-compose
- **Object tracking library (study)** — Norfair:
  https://github.com/tryolabs/norfair

As you ship each one, add it to the `WORK` array in `src/App.jsx` (move it from
"Planned" to a live card with a demo + source link).

## License
© edison9733 (Edison Liu). All rights reserved.
