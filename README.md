# Edison Liu — Portfolio

Personal portfolio site. Plain HTML, CSS, and vanilla JavaScript — no build step,
no dependencies, no framework. Open `index.html` in a browser and it runs.

**Live:** https://edison9733.github.io/mewebsite/ (once GitHub Pages is enabled)

---

## Structure

```
mewebsite/
├── index.html        # all page content
├── styles.css        # all styling (design tokens at the top)
├── scripts.js        # nav, mobile menu, scroll reveal, contact form
├── assets/
│   └── favicon.svg
└── README.md
```

That's it. Three files do the work.

---

## How to edit

Everything you need to personalise is written in `index.html`. Search for square
brackets `[ ]` — every one marks a spot to fill in with your own detail:

- `[Your city / region]` — appears in the hero, contact, etc.
- `[Add a sentence or two in your own voice here ...]` — the personal note in About
- `[repo or demo link]`, `[repo or video link]`, etc. — real links for each project
- `[$15]/hr` — your rate (or delete the whole rate block if you'd rather not show it)
- `[LinkedIn / Fiverr / X — add as you like]` — your other links

### Changing the accent color

Open `styles.css`. At the very top, in `:root`, change these two lines:

```css
--accent:     #2f6f4f;   /* muted green */
--accent-ink: #234f39;   /* darker shade for text */
```

The whole site re-themes from those two values. Some options to try:
- Blue:   `--accent: #2f5fa8;  --accent-ink: #244a82;`
- Slate:  `--accent: #4a5568;  --accent-ink: #353d4a;`
- Rust:   `--accent: #b5562f;  --accent-ink: #8f4324;`

### Adding a project

Copy one `<article class="project reveal"> ... </article>` block in `index.html`
and edit the tag, title, description, stack chips, and link.

---

## Contact form

The form currently opens the visitor's email app pre-filled (a `mailto:` fallback).
To collect submissions properly without a backend, sign up for a free service like
[Formspree](https://formspree.io) or [Getform](https://getform.io) and follow the
note inside `scripts.js`.

---

## Deploy to GitHub Pages

1. Push this folder to `https://github.com/edison9733/mewebsite`
2. On GitHub: **Settings → Pages**
3. Under **Source**, pick branch `main` and folder `/ (root)`
4. Save. The site goes live at `https://edison9733.github.io/mewebsite/`
   within a minute or two.

### Custom domain (optional)

Add a file named `CNAME` (no extension) at the root containing just your domain,
e.g. `edisonliu.dev`, then point your DNS at GitHub Pages.

---

## License

© Edison Liu. All rights reserved.
