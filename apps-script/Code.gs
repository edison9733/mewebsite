/*  ============================================================
    LEDGER — Google Sheets backend (Google Apps Script)
    Paste this whole file into Extensions → Apps Script on your
    spreadsheet, set a PIN, run setup(), then deploy as a Web App.
    Full walkthrough: SETUP-FINANCE.md in the repo.
    ============================================================ */

/* ---- Tab + column names. Change these only if you rename tabs. ---- */
var TXN_SHEET = 'Transactions';
var WAL_SHEET = 'Wallets';
var SET_SHEET = 'Settings';

var TXN_HEADERS = ['id', 'date', 'type', 'amount', 'currency', 'wallet', 'to_wallet', 'category', 'note', 'created_at'];
var WAL_HEADERS = ['id', 'name', 'currency', 'opening', 'balance'];

/* Seed wallets — these must match src/finance/config.js.
   After setup() runs, the SHEET is the source of truth for opening balances:
   edit column D here and the website picks the change up on its next sync. */
var SEED_WALLETS = [
  ['boc',      'BOC',        'CNY',  215.18],
  ['icbc-cny', 'ICBC',       'CNY',  483.26],
  ['wechat',   'WeChat Pay', 'CNY',    1.27],
  ['alipay',   'Alipay',     'CNY', 9198.26],
  ['maybank',  'Maybank',    'MYR',   16.06],
  ['gxbank',   'GXBank',     'MYR',   13.36],
  ['icbc-myr', 'ICBC',       'MYR',  201.80],
  ['wise-myr', 'Wise',       'MYR',    8.00],
  ['jupiter',  'Jupiter',    'USD',    6.00],
  ['bitget',   'Bitget',     'USD',       0],
  ['wise-usd', 'Wise',       'USD',       0]
];

/* Seed settings. rate_X = how much 1 X is worth in MYR. budget_X = monthly
   spending cap in that currency, 0 = off. */
var SEED_SETTINGS = [
  ['rate_CNY', 0.6],
  ['rate_USD', 4.04],
  ['budget_MYR', 0],
  ['budget_CNY', 0],
  ['budget_USD', 0]
];

/* ============================================================
   RUN THIS ONCE — creates the tabs, headers and seed rows.
   Safe to run again: it never deletes transactions.
   ============================================================ */
function setup() {
  var ss = SpreadsheetApp.getActive();

  var txn = ss.getSheetByName(TXN_SHEET) || ss.insertSheet(TXN_SHEET);
  if (txn.getLastRow() === 0) {
    txn.appendRow(TXN_HEADERS);
  }
  txn.getRange(1, 1, 1, TXN_HEADERS.length).setFontWeight('bold');
  txn.setFrozenRows(1);
  // Keep dates as plain text so 2026-09-02 never turns into a locale date.
  txn.getRange('B:B').setNumberFormat('@');

  var wal = ss.getSheetByName(WAL_SHEET) || ss.insertSheet(WAL_SHEET);
  if (wal.getLastRow() === 0) {
    wal.appendRow(WAL_HEADERS);
    for (var i = 0; i < SEED_WALLETS.length; i++) wal.appendRow(SEED_WALLETS[i]);
  }
  wal.getRange(1, 1, 1, WAL_HEADERS.length).setFontWeight('bold');
  wal.setFrozenRows(1);
  writeBalanceFormulas_(wal);

  var set = ss.getSheetByName(SET_SHEET) || ss.insertSheet(SET_SHEET);
  if (set.getLastRow() === 0) {
    set.appendRow(['key', 'value']);
    for (var j = 0; j < SEED_SETTINGS.length; j++) set.appendRow(SEED_SETTINGS[j]);
  }
  set.getRange(1, 1, 1, 2).setFontWeight('bold');
  set.setFrozenRows(1);

  var pin = PropertiesService.getScriptProperties().getProperty('PIN');
  SpreadsheetApp.getActive().toast(
    pin ? 'Setup done. PIN is set.' : 'Setup done. NOW SET A PIN: Project Settings → Script Properties → PIN.',
    'Ledger', 8);
}

/* Column E of Wallets = live balance, so the spreadsheet on its own shows
   the same numbers the website shows. */
function writeBalanceFormulas_(wal) {
  var rows = wal.getLastRow() - 1;
  if (rows < 1) return;
  var formulas = [];
  for (var r = 2; r <= rows + 1; r++) {
    formulas.push([
      '=D' + r +
      '+SUMIFS(' + TXN_SHEET + '!$D:$D,' + TXN_SHEET + '!$C:$C,"income",' + TXN_SHEET + '!$F:$F,$A' + r + ')' +
      '-SUMIFS(' + TXN_SHEET + '!$D:$D,' + TXN_SHEET + '!$C:$C,"spending",' + TXN_SHEET + '!$F:$F,$A' + r + ')' +
      '-SUMIFS(' + TXN_SHEET + '!$D:$D,' + TXN_SHEET + '!$C:$C,"savings",' + TXN_SHEET + '!$F:$F,$A' + r + ',' + TXN_SHEET + '!$G:$G,"<>")' +
      '+SUMIFS(' + TXN_SHEET + '!$D:$D,' + TXN_SHEET + '!$C:$C,"savings",' + TXN_SHEET + '!$G:$G,$A' + r + ')'
    ]);
  }
  wal.getRange(2, 5, formulas.length, 1).setFormulas(formulas);
}

/* ============================================================
   Web app entry points
   ============================================================ */

/* Opening the /exec URL in a browser just proves the deployment works. */
function doGet() {
  return json_({ ok: true, service: 'ledger', hint: 'POST JSON to this URL.' });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'bad-json' });
  }

  var expected = PropertiesService.getScriptProperties().getProperty('PIN');
  if (!expected) return json_({ ok: false, error: 'no-pin-configured' });
  if (String(body.pin || '') !== String(expected)) return json_({ ok: false, error: 'bad-pin' });

  // One writer at a time: two phones adding at once must not clash.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, error: 'busy' });
  }

  try {
    switch (body.action) {
      case 'bootstrap': return json_(bootstrap_());
      case 'add':       return json_(addTxn_(body.txn));
      case 'remove':    return json_(removeTxn_(body.id));
      case 'settings':  return json_(saveSettings_(body.settings));
      default:          return json_({ ok: false, error: 'unknown-action' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/* ============================================================
   Actions
   ============================================================ */

function bootstrap_() {
  return {
    ok: true,
    transactions: readTransactions_(),
    wallets: readWallets_(),
    settings: readSettings_()
  };
}

function addTxn_(t) {
  if (!t || !t.id) throw new Error('missing-transaction');
  var sh = sheet_(TXN_SHEET);
  // Ignore a repeat of the same id — the phone may retry after a dropped request.
  if (findRowById_(sh, t.id) > 0) return { ok: true, duplicate: true };
  sh.appendRow([
    String(t.id),
    String(t.date || ''),
    String(t.type || ''),
    Number(t.amount) || 0,
    String(t.currency || ''),
    String(t.wallet || ''),
    String(t.toWallet || ''),
    String(t.category || ''),
    String(t.note || ''),
    String(t.created_at || new Date().toISOString())
  ]);
  return { ok: true };
}

function removeTxn_(id) {
  var sh = sheet_(TXN_SHEET);
  var row = findRowById_(sh, id);
  if (row > 0) sh.deleteRow(row);
  return { ok: true, removed: row > 0 };
}

function saveSettings_(settings) {
  var sh = sheet_(SET_SHEET);
  var pairs = {};
  if (settings && settings.rates) {
    for (var c in settings.rates) pairs['rate_' + c] = Number(settings.rates[c]) || 0;
  }
  if (settings && settings.budgets) {
    for (var b in settings.budgets) pairs['budget_' + b] = Number(settings.budgets[b]) || 0;
  }
  var values = sh.getDataRange().getValues();
  for (var key in pairs) {
    var found = -1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === key) { found = i + 1; break; }
    }
    if (found > 0) sh.getRange(found, 2).setValue(pairs[key]);
    else sh.appendRow([key, pairs[key]]);
  }
  return { ok: true };
}

/* ============================================================
   Readers
   ============================================================ */

function readTransactions_() {
  var sh = sheet_(TXN_SHEET);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var rows = sh.getRange(2, 1, last - 1, TXN_HEADERS.length).getValues();
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;
    out.push({
      id: String(r[0]),
      date: isoDate_(r[1]),
      type: String(r[2]),
      amount: Number(r[3]) || 0,
      currency: String(r[4]),
      wallet: String(r[5]),
      toWallet: String(r[6] || ''),
      category: String(r[7] || ''),
      note: String(r[8] || ''),
      created_at: String(r[9] || '')
    });
  }
  // Newest first, matching the website's list order.
  out.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  return out;
}

function readWallets_() {
  var sh = sheet_(WAL_SHEET);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var rows = sh.getRange(2, 1, last - 1, 4).getValues();
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    out.push({ id: String(rows[i][0]), name: String(rows[i][1]), currency: String(rows[i][2]), opening: Number(rows[i][3]) || 0 });
  }
  return out;
}

function readSettings_() {
  var sh = sheet_(SET_SHEET);
  var last = sh.getLastRow();
  var rates = {}, budgets = {};
  if (last >= 2) {
    var rows = sh.getRange(2, 1, last - 1, 2).getValues();
    for (var i = 0; i < rows.length; i++) {
      var k = String(rows[i][0] || '');
      var v = Number(rows[i][1]) || 0;
      if (k.indexOf('rate_') === 0) rates[k.slice(5)] = v;
      if (k.indexOf('budget_') === 0) budgets[k.slice(7)] = v;
    }
  }
  rates.MYR = 1; // base currency is always 1
  return { rates: rates, budgets: budgets };
}

/* ============================================================
   Small helpers
   ============================================================ */

function sheet_(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('missing-sheet-' + name + ' (run setup)');
  return sh;
}

function findRowById_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

/* Sheets may hand back a real Date even from a text column. Normalise both. */
function isoDate_(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v || '');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
