# Ledger — setup guide

Everything here is copy-paste. No CLI wizards, no build tools to configure.
Follow the steps in order. Where I am not 100% certain of Google's exact menu
wording (they move things around), I say so and tell you what to look for.

---

## 0. What you now have

| Route | What loads |
|---|---|
| `/` | **Ledger** — the money tracker. This is the new landing page. |
| `/portfolio` | Your original portfolio site, unchanged. |
| `/demos/pulsefit` | Unchanged. |

The "Portfolio ↗" button is top-right on every tracker screen, and again at the
bottom of the page.

New files:

```
src/finance/config.js      ← the only file you normally edit
src/finance/api.js         ← talks to Google Sheets
src/finance/store.jsx      ← state + offline queue
src/finance/math.js        ← balances, periods, percentages, CSV
src/finance/icons.jsx      ← inline SVG icons
src/finance/ui.jsx         ← logo tile, success animation, charts, bottom sheet
src/finance/Tracker.jsx    ← the page itself
apps-script/Code.gs        ← paste this into Google Apps Script
public/wallets/            ← drop your bank logo SVGs here
```

**The tracker works right now with zero setup.** With no Google Sheet connected
it stores everything in your browser (`localStorage`) and the header says
"Local only". Steps 1–6 add the Sheets sync on top of that.

---

## 1. Create the spreadsheet

1. Go to <https://sheets.google.com> and create a **blank** spreadsheet.
2. Rename it something you'll recognise, e.g. `Ledger`.
3. Leave it empty. The script builds the tabs for you in step 4.

---

## 2. Open the script editor

1. In that spreadsheet, click **Extensions** in the top menu.
2. Click **Apps Script**. A new tab opens with a file called `Code.gs`.
3. Select everything already in that file and delete it.

---

## 3. Paste the backend

1. Open `apps-script/Code.gs` from this repo.
2. Copy the **whole file**.
3. Paste it into the empty `Code.gs` in the Apps Script tab.
4. Press **Ctrl+S** (or **Cmd+S**) to save.

---

## 4. Set your passcode, then build the tabs

The passcode never appears in the website's code. The website sends whatever you
type; the script decides whether it matches. That is why this step comes first.

1. In the Apps Script tab, click the **gear icon** in the left sidebar
   (**Project Settings**).
2. Scroll to **Script Properties**.
3. Click **Add script property**.
4. Property: `PIN`
5. Value: your passcode. **Use a passphrase, not four digits** — see the security
   note at the end of this file.
6. Click **Save script properties**.
7. Go back to the **Editor** (the `< >` icon in the left sidebar).
8. In the function dropdown at the top, choose **setup**.
9. Click **Run**.
10. Google will ask you to authorise the script. Click through:
    **Review permissions** → pick your account → **Advanced** →
    **Go to (project name) (unsafe)** → **Allow**.
    ("unsafe" here just means the script is not published in Google's
    marketplace. It is your own script, in your own account.)
11. Switch back to the spreadsheet tab. You should now see three tabs:
    **Transactions**, **Wallets**, **Settings** — with your opening balances
    already filled in.

If step 10 looks different from this, the thing to look for is any button that
lets you continue to an unverified app you own. Google has reworded that screen
several times.

---

## 5. Deploy it as a Web App

1. Back in the Apps Script tab, click **Deploy** (top right) → **New deployment**.
2. Click the **gear icon** next to "Select type" and choose **Web app**.
3. Description: `ledger v1` (anything).
4. **Execute as:** `Me (your@email)`.
5. **Who has access:** `Anyone`.
   This is required — your website is not logged into Google, so it arrives as
   an anonymous visitor. Your passcode is what actually protects the data.
6. Click **Deploy**, then **Authorize access** if asked.
7. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/AKfy…long…/exec`

**Sanity check:** paste that URL into a browser tab. You should see
`{"ok":true,"service":"ledger","hint":"POST JSON to this URL."}`
If you see anything else, the deployment did not go through.

---

## 6. Connect the website

1. Open `src/finance/config.js`.
2. Find line 10-ish:

```js
export const SHEETS_URL = ''
```

3. Paste your URL between the quotes:

```js
export const SHEETS_URL = 'https://script.google.com/macros/s/AKfy…/exec'
```

4. Save, commit, push. That's the whole integration.

The Content-Security-Policy in `vercel.json` already allows
`script.google.com` and `script.googleusercontent.com`, so **no CSP change is
needed**.

---

## 7. Add your bank logos

1. Get the official SVG from each brand's own site (press kit / brand assets
   page). Do not rename a PNG to `.svg` — it will not render.
2. Save each file into `public/wallets/` with these exact names:

```
public/wallets/boc.svg
public/wallets/icbc.svg
public/wallets/wechat.svg
public/wallets/alipay.svg
public/wallets/maybank.svg
public/wallets/gxbank.svg
public/wallets/wise.svg
public/wallets/jupiter.svg
public/wallets/bitget.svg
```

3. Commit and push. No code change needed.

Until a file exists, that wallet shows a coloured two-letter tile instead. ICBC
and Wise appear under two currencies and share one logo file each.

---

## 8. Change wallets, balances or categories

**Opening balances** — two places, and the Sheet wins once connected:

- `Wallets` tab, column **D** in your spreadsheet. Edit there and the site picks
  it up on its next sync (within 60 seconds, or immediately on refresh).
- `src/finance/config.js` → `opening:` — only used before the first sync, and
  when running with no Sheet connected.

**Adding a wallet** — do both:

1. In `src/finance/config.js`, add a line to `WALLETS`:

```js
{ id: 'touchngo', name: "Touch 'n Go", currency: 'MYR', logo: 'touchngo', color: '#0064FF', opening: 0 },
```

2. In `apps-script/Code.gs`, add the same wallet to `SEED_WALLETS`:

```js
['touchngo', "Touch 'n Go", 'MYR', 0],
```

3. Add the row by hand to the `Wallets` tab too (id, name, currency, opening),
   then re-run `setup()` so the balance formula in column E covers the new row.

**Categories** — edit `CATEGORIES` in `src/finance/config.js`. Nothing else to
change; old entries keep whatever category they were saved with.

**Exchange rates** — in the app: gear icon → Settings → Exchange rates → Save.
They are stored in the `Settings` tab. The seeded values (1 CNY = 0.60 MYR,
1 USD = 4.04 MYR) are mid-market rates I looked up on 2 September 2026; they are
a starting point, **not a live feed**. The app never fetches a rate on its own.

---

## 9. Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually <http://localhost:5173>).

To test the production build instead:

```bash
npm run build
npm run preview
```

One local-only quirk: `npm run preview` answers missing files with the HTML page
instead of a 404, so wallet logos you have not added yet behave slightly
differently than in production. The monogram fallback covers both cases.

---

## 10. Deploy

Your site is already on Vercel with `vercel.json` in the repo, so:

```bash
git add -A
git commit -m "feat: financial tracker"
git push -u origin claude/financial-tracker-website-p0d0om
```

Merge that branch into `main` and Vercel builds and deploys it. Nothing in the
Vercel dashboard needs changing — the SPA rewrite in `vercel.json` already sends
`/` and `/portfolio` to `index.html`.

**If you ever move off Vercel:**

- **Netlify** — build command `npm run build`, publish directory `dist`, and add
  a `public/_redirects` file containing: `/*  /index.html  200`
- **GitHub Pages** — Pages has no SPA rewrite, so `/portfolio` would 404 on a
  hard refresh. You would need a hash router or a `404.html` copy of
  `index.html`. Vercel is the easier path; stay there.

---

## 11. Testing checklist

Work down this list once after connecting the Sheet.

| # | Test | Expected |
|---|---|---|
| 1 | Open `/` | Passcode screen (once `SHEETS_URL` is set) |
| 2 | Enter a wrong passcode | "That passcode does not match." |
| 3 | Enter the right passcode | Dashboard loads, header shows a green dot + "Synced" |
| 4 | Tap **+**, add a MYR spend from Maybank | Green circle + white tick, ~0.6s |
| 5 | Check the `Transactions` tab in the Sheet | A new row, all ten columns filled |
| 6 | Check the `Wallets` tab, column E | Maybank's balance dropped by that amount |
| 7 | Reload the page | The entry is still there |
| 8 | Add a row **by hand** in the Sheet, then wait 60s or switch tabs and back | It appears on the site |
| 9 | Switch Week / Month / Year | Numbers and the bar chart change |
| 10 | Tap the ‹ arrow | Previous period; the › arrow is greyed out on the current one |
| 11 | Turn on aeroplane mode, add an entry | It appears; header shows "1 queued" |
| 12 | Turn the network back on, wait | Header returns to "Synced"; the row lands in the Sheet |
| 13 | Delete an entry (trash icon on hover / tap) | Gone from both the site and the Sheet |
| 14 | Settings → Export CSV | A `.csv` downloads and opens in Sheets |
| 15 | Moon/sun icon | Dark mode; still readable; survives a reload |
| 16 | "Portfolio ↗" | Your original site, with its own nav working |
| 17 | Open on your Android phone | One column, thumb-reachable **+**, no sideways scrolling |
| 18 | Tab through the page with a keyboard | A visible lime outline follows the focus |

For #11, phone aeroplane mode is the real test. In a desktop browser, use
DevTools → Network → **Offline**.

---

## 12. How savings are counted

This trips people up, so it is worth being exact:

- **Income** adds to the wallet you picked.
- **Spending** subtracts from the wallet you picked.
- **Savings with no destination wallet** is an *earmark*. It counts towards your
  savings total and your savings rate, but **no money moves** — the cash is
  still sitting in Maybank.
- **Savings with a destination wallet** is a real transfer: source wallet down,
  destination wallet up.

Pick the destination in the "Move into" dropdown when the type is Savings.

---

## 13. Security — read this once

Being straight with you about what this does and does not protect:

1. **The passcode is checked by the Apps Script, not by the browser.** Nothing
   secret is in the JavaScript that ships to visitors. Someone reading your page
   source finds the `/exec` URL, but not your passcode.
2. **Anyone who guesses the passcode gets everything** — read and write. There is
   no lockout after failed attempts and no rate limit. So use a passphrase like
   `orange-ladder-97-quiet`, not `1234`.
3. **This is not bank-grade.** It is "keeps out anyone who wanders onto your
   homepage". If that is not enough for you, the next step up is putting the
   tracker behind Vercel's password protection or a proper login — tell me and
   I'll wire it up.
4. **`/` is now excluded from search results** two ways: `Disallow: /$` in
   `public/robots.txt` (Google and Bing honour the `$` end-anchor; it is a
   de-facto extension, not part of the original robots spec), and a `noindex`
   meta tag the tracker adds when it loads. `sitemap.xml` now points search
   engines at `/portfolio` instead. If you would rather have the portfolio back
   at `/`, change one line in `src/main.jsx` and tell me — it is a two-minute
   reversal.
5. **Deleting an entry deletes the Sheet row.** There is no undo. Google Sheets'
   own **File → Version history** is your safety net.

---

## 14. Troubleshooting

| What you see | What it usually means |
|---|---|
| Header says "Local only" | `SHEETS_URL` is still `''` in `config.js`. |
| Header stuck on "Offline" / entries queue up | The `/exec` URL is wrong, or the deployment's "Who has access" is not `Anyone`. Re-check step 5. |
| "That passcode does not match" but it does | You edited the `PIN` script property after deploying. Redeploy: **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**. |
| Entries save but the Sheet stays empty | The tabs were renamed. They must be exactly `Transactions`, `Wallets`, `Settings`. |
| Dates turn into `02/09/2026` in the Sheet | Column B's format got changed. Select column B → **Format → Number → Plain text**, then re-run `setup()`. |
| A logo shows as two letters | That `.svg` file is missing from `public/wallets/`, or it is not really an SVG. |
| Balances look wrong after editing the Sheet | Re-run `setup()` — it rewrites the balance formulas in `Wallets` column E. |

---

## 15. What I did not build

Being explicit so you know what is missing rather than assuming it is broken:

- **Recurring transaction templates.** Not built. Say the word and I'll add
  saved presets with one-tap entry.
- **Live exchange rates.** Deliberately not built — it needs a third-party API
  key and a CSP change, and a stale cached rate is worse than a rate you set
  yourself and know the age of.
- **Editing an existing entry.** You can delete and re-add. Inline editing is
  not there yet.
- **Multiple users.** One passcode, one dataset.
