# Edison Liu — Personal Website

Live at **[edison9733.xyz](https://edison9733.xyz)**

Built with React + Vite + Tailwind CSS + GSAP.

## Domain

The site is wired to `edison9733.xyz` via:
- `public/CNAME` → `edison9733.xyz` (GitHub Pages custom domain)
- `og:url` in `index.html` → `https://edison9733.xyz`

Point your DNS provider's CNAME record for `www` at `<username>.github.io` and the apex (`@`) at GitHub's IP addresses, or use a registrar-level redirect.

## Featured project

The [Telegram Receipt Bot](https://t.me/lhdn_receipt_tracker_bot) is showcased as a featured card at the top of the Projects section with a "Try the bot on Telegram" CTA. Source: [github.com/edison9733/telegram_receipt_bot](https://github.com/edison9733/telegram_receipt_bot).

## Dev

```bash
npm install
npm run dev
npm run build
```
