/* ============================================================
   CONFIG — this is the ONLY part you edit.
   Fill these in after you set up the backend (see README.md).
   ============================================================ */
const CONFIG = {
  // n8n Webhook URL for the web form (Production URL from the Webhook node)
  N8N_WEBHOOK_URL: "https://ediedi9733.app.n8n.cloud/webhook/gym-demo",

  // Registration endpoint = your Google Apps Script web-app URL (ends in /exec).
  // This is the SAME URL you deploy in google-sheets/apps-script.gs.
  // New members from the "Register" card are appended straight to the Members tab.
  REGISTER_URL: "https://script.google.com/macros/s/AKfycbxmXbKKJ9HSJ61yuRc4BkdDatHcOoD5HxeyE9MdBdPcEmE1MypWI4U0D36_4cJ2-1VntQ/exec",

  // The gym's email address (used for the email channel button)
  DEMO_EMAIL: "ediedi9733@gmail.com",

  // Your Telegram bot link (created with @BotFather): https://t.me/your_bot_username
  TELEGRAM_BOT_URL: "https://t.me/PulseFit_Demo_bot",

  // Published Google Sheet embed URL
  // In Sheets: File → Share → Publish to web → Embed → copy the iframe "src" URL.
  SHEET_EMBED_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRJQavVhCmBDcSpdtNi400un6nBeb45li3Tu6SZP8tieRE-CW2yQz_iS8m76ohJuS4cjPigfUAasv-g/pubhtml?gid=331949744&single=true"
};
/* ============================================================ */

// --- wire up the email button ---
(function(){
  const subject = encodeURIComponent("Booking request — PulseFit");
  const body = encodeURIComponent("Hi! My member ID is M001.\n\nI'd like to book a 1-to-1 with Coach Mike on Wednesday at 10am.\n\nThanks!");
  document.getElementById("mailbtn").href = `mailto:${CONFIG.DEMO_EMAIL}?subject=${subject}&body=${body}`;
})();

// --- wire up the Telegram button ---
document.getElementById("tgbtn").href = CONFIG.TELEGRAM_BOT_URL;

// --- live sheet embed ---
(function(){
  const frame = document.getElementById("sheetframe");
  const fb = document.getElementById("sheetfallback");
  if (CONFIG.SHEET_EMBED_URL && CONFIG.SHEET_EMBED_URL.startsWith("http")) {
    frame.src = CONFIG.SHEET_EMBED_URL;
    fb.style.display = "none";
  } else {
    frame.style.display = "none";
  }
})();

// --- copy buttons on the "try this" cards ---
document.querySelectorAll(".copy").forEach(function(b){
  b.addEventListener("click", function(){
    const t = b.getAttribute("data-copy");
    navigator.clipboard && navigator.clipboard.writeText(t);
    const old = b.textContent; b.textContent = "copied"; setTimeout(()=>b.textContent=old, 1200);
  });
});

// --- the web form: POST to n8n, show the reply ---
document.getElementById("f-send").addEventListener("click", async function(){
  const btn = this;
  const member = document.getElementById("f-member").value;
  const message = document.getElementById("f-msg").value.trim();
  const out = document.getElementById("f-reply");
  if (!message){ out.className = "reply err"; out.textContent = "Please type a message first."; return; }

  if (!CONFIG.N8N_WEBHOOK_URL || CONFIG.N8N_WEBHOOK_URL.includes("YOUR-N8N-HOST")){
    out.className = "reply err";
    out.textContent = "Backend not connected yet. Paste your n8n Webhook URL into the CONFIG block at the bottom of index.html.";
    return;
  }

  btn.disabled = true; const label = btn.textContent; btn.textContent = "Sending…";
  out.className = "reply"; out.textContent = "The assistant is thinking…";
  try{
    const res = await fetch(CONFIG.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "form", member_id: member, message: message })
    });
    const data = await res.json().catch(()=>({ reply: "(the workflow did not return JSON — check the 'Respond to Webhook' node)" }));
    out.className = "reply ok";
    // expects { reply: "...", status: "accepted|rejected|pending|info" }
    const status = (data.status||"").toLowerCase();
    const tagMap = { accepted:"ok", rejected:"no", pending:"pend" };
    let prefix = "";
    if (tagMap[status]) prefix = `[${status.toUpperCase()}]\n`;
    out.textContent = prefix + (data.reply || JSON.stringify(data, null, 2));
  }catch(e){
    out.className = "reply err";
    out.textContent = "Could not reach the assistant. If the workflow is running, this is usually a CORS issue — the Respond to Webhook node must have Access-Control-Allow-Origin: * in its response headers.";
  }finally{
    btn.disabled = false; btn.textContent = label;
  }
});

// --- registration: add a test member to the sheet, one per visitor ---
(function(){
  const KEY = "pulsefit_registered";
  const nameEl = document.getElementById("r-name");
  const emailEl = document.getElementById("r-email");
  const sessEl  = document.getElementById("r-sessions");
  const btn     = document.getElementById("r-send");
  const out     = document.getElementById("r-reply");
  const formBox = document.getElementById("reg-form");
  const locked  = document.getElementById("reg-locked");
  if(!btn) return;

  // localStorage lock — wrapped so it never throws if storage is blocked.
  function getRec(){ try{ return JSON.parse(localStorage.getItem(KEY) || "null"); }catch(e){ return null; } }
  function setRec(v){ try{ if(v===null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, JSON.stringify(v)); }catch(e){} }

  function addMemberOption(id, name, sessions){
    const sel = document.getElementById("f-member");
    if(!sel || !id) return;
    if([...sel.options].some(o => o.value === id)) return;
    const o = document.createElement("option");
    o.value = id;
    o.textContent = id + " — " + (name || "you") + " (" + sessions + " session" + (sessions==1?"":"s") + " left)";
    o.selected = true;
    sel.appendChild(o);
  }

  function showLocked(rec){
    formBox.style.display = "none";
    locked.style.display = "block";
    const idHtml = rec.member_id ? '<span class="idpill">' + rec.member_id + '</span>' : '<span class="idpill">(see the sheet)</span>';
    const tail = rec.member_id
      ? ' — it is now selected in the web form above. Ask the assistant to book a session with it.'
      : ' — scroll to the live Google Sheet below to find your new row.';
    locked.innerHTML = '✅ You are registered as ' + idHtml + tail +
      '<br><button class="reg-reset" id="reg-reset">register a different test member</button>';
    const rb = document.getElementById("reg-reset");
    if(rb) rb.addEventListener("click", function(){ setRec(null); locked.style.display="none"; formBox.style.display="block"; out.className="reply"; out.textContent="Your new member ID will appear here."; });
    if(rec.member_id) addMemberOption(rec.member_id, rec.name, rec.sessions);
  }

  // Restore from previous visit
  const existing = getRec();
  if(existing) showLocked(existing);

  btn.addEventListener("click", async function(){
    const name = (nameEl.value || "").trim();
    const email = (emailEl.value || "").trim();
    const sessions = parseInt(sessEl.value, 10);
    if(!name){ out.className="reply err"; out.textContent="Please enter a name."; return; }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ out.className="reply err"; out.textContent="Please enter a valid email address."; return; }
    if(getRec()){ showLocked(getRec()); return; }  // already registered in this browser
    if(!CONFIG.REGISTER_URL || CONFIG.REGISTER_URL.includes("REPLACE_WITH")){
      out.className="reply err";
      out.textContent="Registration backend not connected yet. Paste your Apps Script web-app URL into REGISTER_URL in the CONFIG block at the bottom of index.html.";
      return;
    }
    btn.disabled = true; const lab = btn.textContent; btn.textContent = "Registering…";
    out.className = "reply"; out.textContent = "Creating your member record…";
    try{
      // Use Content-Type text/plain to avoid a CORS preflight to Apps Script
      const res = await fetch(CONFIG.REGISTER_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "register", name: name, email: email, sessions: sessions })
      });
      let data = null; try{ data = await res.json(); }catch(_){ data = null; }
      if(data && data.ok){
        const rec = { member_id: data.member_id, name: name, sessions: sessions, email: email };
        setRec(rec);
        out.className = "reply ok";
        out.textContent = data.duplicate
          ? "That email is already registered as " + data.member_id + ". Using your existing member ID."
          : "Done! You are member " + data.member_id + " with " + sessions + " session" + (sessions==1?"":"s") + ". Watch your row appear in the live sheet below.";
        showLocked(rec);
      }else{
        // Apps Script could not return a readable JSON response (CORS) — the row is usually still written.
        const rec = { member_id: null, name: name, sessions: sessions, email: email };
        setRec(rec);
        out.className = "reply ok";
        out.textContent = "Registered! Your row should appear in the live Google Sheet below in a moment.";
        showLocked(rec);
      }
    }catch(e){
      out.className = "reply err";
      out.textContent = "Could not reach the registration backend. Check REGISTER_URL, or see the CORS note in README.md.\n\nError: " + e.message;
    }finally{
      btn.disabled = false; btn.textContent = lab;
    }
  });
})();
