// api/contact.js — contact endpoint on my own Vercel project.
// Hardened: POST-only, same-origin (allowlist), JSON-only, rate-limited,
// honeypot, strict validation, control-char stripping, generic errors.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const RATE = new Map();

// Only these origins may POST the form. Cross-site browser abuse always sends
// an Origin header, so a mismatched one is rejected. Absent Origin (non-browser
// tooling) is allowed but still subject to honeypot + rate limit + validation.
const ALLOWED_ORIGINS = new Set([
  'https://edison9733.xyz',
  'https://www.edison9733.xyz',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
function originOk(req) {
  const o = req.headers['origin'];
  if (!o) return true;
  if (ALLOWED_ORIGINS.has(o)) return true;
  try { if (new URL(o).hostname.endsWith('.vercel.app')) return true; } catch { return false; }
  return false;
}

function clientIp(req){const xff=req.headers['x-forwarded-for'];if(typeof xff==='string'&&xff.length)return xff.split(',')[0].trim();return req.socket?.remoteAddress||'unknown';}
function rateLimited(ip){const now=Date.now();const hits=(RATE.get(ip)||[]).filter(t=>now-t<WINDOW_MS);hits.push(now);RATE.set(ip,hits);return hits.length>MAX_PER_WINDOW;}
function isEmail(s){return typeof s==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)&&s.length<=200;}
// strip control chars (incl. null bytes) — defence in depth before storing
function clean(s){return (s||'').toString().replace(/[\u0000-\u001F\u007F]/g,' ').trim();}
async function readBody(req){if(req.body&&typeof req.body==='object')return req.body;if(typeof req.body==='string'&&req.body.length){try{return JSON.parse(req.body);}catch{return {};}}return await new Promise(r=>{let d='';req.on('data',c=>{d+=c;if(d.length>1e6)req.destroy();});req.on('end',()=>{try{r(JSON.parse(d||'{}'));}catch{r({});}});req.on('error',()=>r({}));});}
async function saveToGitHub(rec){const repo=process.env.INBOX_REPO,token=process.env.GH_TOKEN,branch=process.env.INBOX_BRANCH||'main';if(!repo||!token)throw new Error('server-not-configured');const stamp=rec.received_at.replace(/[:.]/g,'-');const path=`submissions/${stamp}-${rec.id}.json`;const content=Buffer.from(JSON.stringify(rec,null,2),'utf8').toString('base64');const url=`https://api.github.com/repos/${repo}/contents/${path}`;const res=await fetch(url,{method:'PUT',headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json','User-Agent':'edison9733-contact-fn'},body:JSON.stringify({message:`contact: ${rec.name} <${rec.email}>`,content,branch})});if(!res.ok){const t=await res.text().catch(()=>'');throw new Error(`store ${res.status}: ${t.slice(0,200)}`);}}
async function pingPhone(rec){const topic=process.env.NTFY_TOPIC;if(!topic)return;try{await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`,{method:'POST',headers:{Title:'New contact from your website',Tags:'envelope'},body:`${rec.name} <${rec.email}>\n\n${rec.message.slice(0,280)}`});}catch{/* notification is best-effort */}}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'method-not-allowed'});}
  if(!originOk(req))return res.status(403).json({ok:false,error:'forbidden-origin'});
  const ct=(req.headers['content-type']||'').toString();
  if(!ct.includes('application/json'))return res.status(415).json({ok:false,error:'unsupported-media-type'});
  const ip=clientIp(req);
  if(rateLimited(ip))return res.status(429).json({ok:false,error:'too-many-requests'});
  const body=await readBody(req);
  if(body.company)return res.status(200).json({ok:true}); // honeypot tripped
  const name=clean(body.name), email=clean(body.email), message=clean(body.message);
  if(name.length<1||name.length>120)return res.status(400).json({ok:false,error:'bad-name'});
  if(!isEmail(email))return res.status(400).json({ok:false,error:'bad-email'});
  if(message.length<1||message.length>5000)return res.status(400).json({ok:false,error:'bad-message'});
  const rec={id:Math.random().toString(36).slice(2,10),received_at:new Date().toISOString(),name,email,message,source:'edison9733.xyz',ip,user_agent:(req.headers['user-agent']||'').toString().slice(0,300)};
  try{await saveToGitHub(rec);}catch{return res.status(502).json({ok:false,error:'store-failed'});}
  await pingPhone(rec);
  return res.status(200).json({ok:true});
}
