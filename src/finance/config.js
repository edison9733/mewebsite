/* ============================================================
   Finance tracker — configuration
   This is the ONLY file you normally need to edit.
   ============================================================ */

/* 1) Your Google Apps Script Web App URL.
      Paste the /exec URL you get in SETUP-FINANCE.md, Step 6.
      Leave it empty ('') and the tracker still works fully —
      it just stays local-only (localStorage) with no Sheets sync. */
export const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzF9rGcLqnrX48JQe3oHOJsI49tEbO6BfeDk1w6ZKmj6omphxlfg5mIcUkMEOwK_LM/exec'

/* 2) Where the "back to portfolio" button goes. */
export const PORTFOLIO_PATH = '/portfolio'

/* 3) Currencies. `display` is what the money is shown in.
      `locale` only affects digit grouping. */
export const CURRENCIES = {
  MYR: { code: 'MYR', symbol: 'RM',  name: 'Malaysian Ringgit', locale: 'en-MY' },
  CNY: { code: 'CNY', symbol: '¥',   name: 'Chinese Yuan',      locale: 'zh-CN' },
  USD: { code: 'USD', symbol: '$',   name: 'US Dollar',         locale: 'en-US' },
}
export const CURRENCY_ORDER = ['MYR', 'CNY', 'USD']

/* 4) The currency every "combined total" is converted into. */
export const BASE_CURRENCY = 'MYR'

/* 5) Fallback FX rates: how much 1 unit of the currency is worth in BASE_CURRENCY.
      These are only a seed, used before the first sync and when the tracker runs
      with no Sheets URL. Once connected, the rates come from GOOGLEFINANCE
      formulas in the Sheet's `Settings` tab and refresh on their own — see
      "Exchange rates" in SETUP-FINANCE.md. */
export const DEFAULT_RATES = { MYR: 1, CNY: 0.6, USD: 4.04 }

/* 6) Wallets. `logo` is the filename (without .svg) inside /public/wallets/.
      If that file does not exist, a coloured monogram tile is shown instead —
      so you can drop logos in later with zero code changes.
      `opening` is the starting balance, i.e. what you had before the first
      transaction you log here. */
export const WALLETS = [
  // --- CNY ---
  { id: 'boc',       name: 'BOC',        currency: 'CNY', logo: 'boc',     color: '#A9282C', opening: 215.18 },
  { id: 'icbc-cny',  name: 'ICBC',       currency: 'CNY', logo: 'icbc',    color: '#C7000B', opening: 483.26 },
  { id: 'wechat',    name: 'WeChat Pay', currency: 'CNY', logo: 'wechat',  color: '#07C160', opening: 1.27 },
  { id: 'alipay',    name: 'Alipay',     currency: 'CNY', logo: 'alipay',  color: '#1677FF', opening: 9198.26 },
  // --- MYR ---
  { id: 'maybank',   name: 'Maybank',    currency: 'MYR', logo: 'maybank', color: '#FFC800', opening: 16.06, ink: true },
  { id: 'gxbank',    name: 'GXBank',     currency: 'MYR', logo: 'gxbank',  color: '#7B2FF7', opening: 13.36 },
  { id: 'icbc-myr',  name: 'ICBC',       currency: 'MYR', logo: 'icbc',    color: '#C7000B', opening: 201.80 },
  { id: 'wise-myr',  name: 'Wise',       currency: 'MYR', logo: 'wise',    color: '#9FE870', opening: 8.00, ink: true },
  // --- USD ---
  { id: 'jupiter',   name: 'Jupiter',    currency: 'USD', logo: 'jupiter', color: '#C7F284', opening: 6.00, ink: true },
  { id: 'bitget',    name: 'Bitget',     currency: 'USD', logo: 'bitget',  color: '#00E5E0', opening: 0, ink: true },
  { id: 'wise-usd',  name: 'Wise',       currency: 'USD', logo: 'wise',    color: '#9FE870', opening: 0, ink: true },
]

/* 7) Categories, per transaction type. Add or remove freely. */
export const CATEGORIES = {
  spending: ['Food & drink', 'Groceries', 'Transport', 'Rent', 'Utilities', 'Phone & internet', 'Shopping', 'Clothing', 'Health', 'Education', 'Entertainment', 'Travel', 'Fees', 'Other'],
  income:   ['Salary', 'Freelance', 'Bonus', 'Allowance', 'Refund', 'Investment', 'Gift', 'Other'],
  savings:  ['Emergency fund', 'Investment', 'Goal', 'Crypto', 'Other'],
}

/* 8) Optional monthly spending budgets, per currency. 0 = no budget. */
export const DEFAULT_BUDGETS = { MYR: 0, CNY: 0, USD: 0 }

export const TYPES = ['income', 'spending', 'savings']

export const TYPE_META = {
  income:   { label: 'Income',   sign: '+', tint: '#16A34A' },
  spending: { label: 'Spending', sign: '−', tint: '#E11D48' },
  savings:  { label: 'Savings',  sign: '→', tint: '#2563EB' },
}

/* Helpers used across the app */
export const walletById = (id) => WALLETS.find((w) => w.id === id) || null
export const walletsFor = (currency) => WALLETS.filter((w) => w.currency === currency)
