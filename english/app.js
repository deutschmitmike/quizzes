"use strict";
/* Kyla Speaks: Englisch-Sprech-App fuer Kyla (Mike, 2026-10-02). Inhalte: data.js. Lehrer-Seite: lehrer.html.
   Firebase: save/__kyla_en/kyla = Fortschritt, save/__kyla_en/saetze/<id> = jeder eigene Satz.
   Kyla schreibt nur ihre Felder (text, gesprochen, gh, wn, wd, nach), Mike nur seine (korr, notiz, ok, kt). Darum immer PATCH, nie den ganzen Satz ueberschreiben.
   Lokal (localhost oder ?test) laeuft alles gegen eine Spiel-Datenbank im Browser, nie gegen die echte. */

const DB_URL = "https://ddd-spiel-default-rtdb.europe-west1.firebasedatabase.app/", BASE = "save/__kyla_en";
const TEST = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || /[?&]test\b/.test(location.search);
const LSKEY = TEST ? "kyla_en_test" : "kyla_en_v1";
const APP = document.getElementById("app");
const $ = s => document.querySelector(s);
const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
const esc = s => String(s == null ? "" : s).replace(/[<>&"]/g, c => ({"<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;"}[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const wc = s => (s.match(/[A-Za-z0-9']+/g) || []).length;
const BYID = {}; [...BAUEN, ...MUSTER, ...FRAGEN, ...ERZAEHLEN].forEach(x => BYID[x.id] = x);

const I = {
  mic: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>',
  spk: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06A9 9 0 0 0 14 3.23z"/></svg>',
};

/* ===== Datenbank (echt: Firebase REST; Test: localStorage) ===== */
const fake = { load() { try { return JSON.parse(localStorage.getItem("kyla_fakedb") || "{}"); } catch (e) { return {}; } },
               save(o) { localStorage.setItem("kyla_fakedb", JSON.stringify(o)); } };
function fakeAt(o, path, create) { const ps = path.split("/").filter(Boolean); let cur = o;
  for (let i = 0; i < ps.length - 1; i++) { if (cur[ps[i]] == null) { if (!create) return [null]; cur[ps[i]] = {}; } cur = cur[ps[i]]; }
  return [cur, ps[ps.length - 1]]; }
async function dbGet(path) {
  if (TEST) { const [p, k] = fakeAt(fake.load(), path); return p && p[k] !== undefined ? p[k] : null; }
  const r = await fetch(DB_URL + path + ".json?t=" + Date.now(), {cache: "no-store"}); if (!r.ok) throw new Error(r.status); return r.json(); }
async function dbWrite(method, path, val) {
  if (TEST) { const o = fake.load(), [p, k] = fakeAt(o, path, true);
    if (method === "PATCH") { p[k] = Object.assign(p[k] || {}, val); for (const f in val) if (val[f] == null) delete p[k][f]; } else p[k] = val;
    fake.save(o); return; }
  const r = await fetch(DB_URL + path + ".json", {method, body: JSON.stringify(val)}); if (!r.ok) throw new Error(r.status); }

/* ===== Zustand ===== */
function neu() { return {v: 1, name: "", tage: [], used: {}, total: 0, spoken: 0, heute: null, round: null, queue: [], upd: 0}; }
function load() { try { const o = JSON.parse(localStorage.getItem(LSKEY)); if (o && o.v) return Object.assign(neu(), o); } catch (e) {} return neu(); }
let S = load(), SAETZE = {}, VIEW = "home";
function lokal() { try { localStorage.setItem(LSKEY, JSON.stringify(S)); } catch (e) {} }
let cst = null;
function save() { S.upd = Date.now(); lokal(); clearTimeout(cst); cst = setTimeout(cloudSave, 800); }
function cloudSave() { if (!S.name) return; const o = Object.assign({}, S); delete o.queue; dbWrite("PUT", BASE + "/kyla", o).catch(() => {}); }
function merge(c) { if (!c || !c.v) return;
  S.tage = [...new Set([...(S.tage || []), ...(c.tage || [])])].sort((a, b) => a - b);
  for (const k in (c.used || {})) S.used[k] = Math.max(S.used[k] || 0, c.used[k]);
  S.total = Math.max(S.total || 0, c.total || 0); S.spoken = Math.max(S.spoken || 0, c.spoken || 0);
  if ((c.upd || 0) > (S.upd || 0)) { S.round = c.round || null; S.heute = c.heute || S.heute; }
  if (!S.name && c.name) S.name = c.name; }

// Warteschlange: jeder Schreibzugriff bleibt lokal gespeichert, bis Firebase ihn angenommen hat (kein Satz geht offline verloren).
let flushing = false;
async function flush() { if (flushing) return; flushing = true;
  try { while (S.queue.length) { const q = S.queue[0]; await dbWrite(q.m, q.p, q.v); S.queue.shift(); lokal(); } } catch (e) {}
  flushing = false; }
function send(m, p, v) { S.queue.push({m, p, v}); save(); flush(); }
function patchSatz(id, v) { SAETZE[id] = Object.assign(SAETZE[id] || {}, v); send("PATCH", BASE + "/saetze/" + id, v); }

async function ladeSaetze() {
  try { SAETZE = (await dbGet(BASE + "/saetze")) || {}; } catch (e) {}
  S.queue.forEach(q => { if (!q.p.includes("/saetze/")) return; const id = q.p.split("/").pop();
    SAETZE[id] = q.m === "PATCH" ? Object.assign(SAETZE[id] || {}, q.v) : q.v; }); }

const korrigiert = s => s && (s.ok || s.korr);
const neuKorr = s => korrigiert(s) && !s.gh;
const faellig = s => s && s.korr && !s.ok && s.gh && s.wd && s.wd <= today();
const ABSTAND = [2, 5, 12, 30];   // Wiederholung korrigierter Saetze: nach 2, 5, 12, 30 Tagen

/* ===== Sprache: Vorlesen + Spracherkennung ===== */
let VOICE = null;
function pickVoice() { try { const vs = speechSynthesis.getVoices().filter(v => /^en[-_]US/i.test(v.lang));
  VOICE = vs.find(v => /Samantha|Ava|Allison|Susan|Zoe|Nicky/i.test(v.name)) || vs.find(v => v.localService) || vs[0] || null; } catch (e) {} }
if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(t, slow) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; if (VOICE) u.voice = VOICE;
  u.rate = slow ? 0.7 : 0.95; speechSynthesis.speak(u); } catch (e) {} }
const spk = t => '<button class="spk" data-say="' + esc(t) + '" aria-label="聽">' + I.spk + '</button><button class="spk slow" data-say="' + esc(t) + '" data-slow="1">慢</button>';
document.addEventListener("click", e => { const b = e.target.closest("[data-say]"); if (b) say(b.dataset.say, !!b.dataset.slow); });

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let REC = null;
function stopRec() { if (REC) { const r = REC; REC = null; r.onend = null; r.onresult = null; try { r.abort(); } catch (e) {} } }
function hoeren(btn, cb) {   // erster Druck startet, zweiter beendet
  if (REC) { try { REC.stop(); } catch (e) {} return; }
  try { speechSynthesis.cancel(); } catch (e) {}
  const r = new SR(); REC = r; let txt = "";
  r.lang = "en-US"; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
  r.onresult = e => { let s = ""; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; txt = s.trim(); cb.part && cb.part(txt); };
  r.onerror = e => { cb.err && cb.err(e.error); };
  r.onend = () => { btn.classList.remove("rec"); if (REC === r) REC = null; cb.end && cb.end(txt); };
  btn.classList.add("rec");
  try { r.start(); } catch (e) { btn.classList.remove("rec"); REC = null; cb.err && cb.err("start"); } }
function errText(e) {
  if (e === "not-allowed") return "沒有麥克風權限。請在 Safari 允許使用麥克風，或是用鍵盤上的麥克風輸入。";
  if (e === "service-not-allowed") return "語音辨識沒有開。請到「設定」打開「聽寫」，或是先用打字的。";
  if (e === "no-speech") return "沒有聽到聲音，再按一次試試看。";
  if (e === "aborted") return "";
  return "語音辨識暫時不能用，可以先用打字的。"; }

/* ===== Vergleiche ===== */
const KURZ = {"i'm":"i am","you're":"you are","it's":"it is","don't":"do not","didn't":"did not","can't":"can not","cannot":"can not","couldn't":"could not",
  "i'll":"i will","i'd":"i would","we're":"we are","that's":"that is","there's":"there is","isn't":"is not","doesn't":"does not","won't":"will not",
  "wasn't":"was not","haven't":"have not","i've":"i have","what's":"what is","they're":"they are","she's":"she is","he's":"he is","let's":"let us","we'll":"we will"};
const ZAHL = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
function woerter(s) { return String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean)
  .flatMap(w => (KURZ[w] || (/^\d+$/.test(w) && ZAHL[+w]) || w).split(" ")); }
function lcs(a, b) { const m = a.length, n = b.length, L = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  return L; }
function treffer(ziel, gesagt) { const a = woerter(ziel), b = woerter(gesagt); if (!a.length) return 0; return lcs(a, b)[0][0] / Math.max(a.length, b.length * 0.9); }
function fehlend(ziel, gesagt) {   // Woerter des Zielsatzes, die sie nicht gesagt hat
  const a = woerter(ziel), b = woerter(gesagt), L = lcs(a, b), weg = []; let i = 0, j = 0;
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) weg.push(a[i++]); else j++; }
  while (i < a.length) weg.push(a[i++]); return weg; }
// Wortweiser Unterschied: in ihrem Satz Gestrichenes rot, in Mikes Satz Neues gruen. Gross/klein und Satzzeichen zaehlen nicht.
function diff(a, b) { const ta = a.split(/\s+/).filter(Boolean), tb = b.split(/\s+/).filter(Boolean), nz = t => t.toLowerCase().replace(/[^a-z0-9']/g, "");
  const na = ta.map(nz), nb = tb.map(nz), L = lcs(na, nb); let i = 0, j = 0; const A = [], B = [];
  while (i < ta.length && j < tb.length) { if (na[i] === nb[j]) { A.push(esc(ta[i++])); B.push(esc(tb[j++])); }
    else if (L[i + 1][j] >= L[i][j + 1]) A.push("<del>" + esc(ta[i++]) + "</del>"); else B.push("<ins>" + esc(tb[j++]) + "</ins>"); }
  while (i < ta.length) A.push("<del>" + esc(ta[i++]) + "</del>"); while (j < tb.length) B.push("<ins>" + esc(tb[j++]) + "</ins>");
  return {a: A.join(" "), b: B.join(" ")}; }

/* ===== Runde planen ===== */
const MIX = {1: {b: 3, m: 3, q: 2, s: 0}, 2: {b: 2, m: 2, q: 3, s: 1}, 3: {b: 1, m: 2, q: 3, s: 2}};   // Treppe: weniger Bausteine, mehr freies Sprechen
function stufe() { const n = (S.tage || []).filter(d => d < today()).length; return n < 5 ? 1 : n < 14 ? 2 : 3; }
function waehle(list, n, lv, belegt) {   // zuerst Ungenutztes der aktuellen Stufe, dann Ungenutztes darunter, dann das am laengsten Zurueckliegende
  return list.filter(x => x.lv <= lv && !belegt.has(x.id))
    .map(x => { const u = S.used[x.id]; return {x, k: (u == null ? 0 : 1000 + u) + (x.lv === lv ? 0 : 300) + Math.random()}; })
    .sort((a, b) => a.k - b.k).slice(0, Math.max(0, n)).map(o => { belegt.add(o.x.id); return o.x.id; }); }
function plan(art) {   // art: "tag" (Tagesrunde), "extra" (noch ein paar Saetze), "korr" (nur Mikes Korrekturen)
  const lv = stufe(), extra = art !== "tag", mx = art === "korr" ? {b: 0, m: 0, q: 0, s: 0} : art === "extra" ? {b: 0, m: 1, q: 2, s: lv > 1 ? 1 : 0} : MIX[lv], vorne = [], wdh = [], belegt = new Set();
  { const alle = Object.values(SAETZE).filter(s => s && s.id);
    const nk = alle.filter(neuKorr).sort((a, b) => a.ts - b.ts), lob = nk.filter(s => s.ok);
    if (lob.length) vorne.push({k: "lob", ids: lob.map(s => s.id)});
    nk.filter(s => !s.ok).slice(0, 4).forEach(s => vorne.push({k: "korr", id: s.id}));
    if (art === "tag") alle.filter(faellig).sort((a, b) => a.wd - b.wd).slice(0, 2).forEach(s => wdh.push({k: "wdh", id: s.id})); }
  let b = mx.b, m = mx.m; const fest = vorne.filter(s => s.k !== "lob").length + wdh.length;
  while (fest + b + m + mx.q + mx.s > 10 && (b > 0 || m > 1)) { if (b > 0) b--; else m--; }
  const sit = mx.q ? waehle(FRAGEN.filter(f => f.t === "situation"), 1, lv, belegt) : [];
  const fr = [...sit, ...waehle(FRAGEN, mx.q - sit.length, lv, belegt)];
  const steps = [...vorne,
    ...waehle(BAUEN, b, lv, belegt).map(id => ({k: "bauen", id})),
    ...waehle(MUSTER, m, lv, belegt).map(id => ({k: "muster", id})),
    ...wdh,
    ...shuffle(fr).map(id => ({k: "frage", id})),
    ...waehle(ERZAEHLEN, mx.s, lv, belegt).map(id => ({k: "erzaehlen", id}))];
  S.round = {d: today(), steps, i: 0, done: false, extra, art, n: 0}; save(); }

/* ===== Ablauf ===== */
function render() { try { speechSynthesis.cancel(); } catch (e) {} stopRec();
  const r = S.round;
  if (!S.name) return renderLogin();
  if (VIEW === "end") return renderEnd();
  if (VIEW === "round" && r && !r.done && r.d === today()) { if (r.i >= r.steps.length) return fertig(); return renderStep(r.steps[r.i]); }
  VIEW = "home"; renderHome(); }
function weiter() { const r = S.round, st = r.steps[r.i]; if (st && st.id && BYID[st.id]) S.used[st.id] = today(); r.i++; save(); render(); window.scrollTo(0, 0); }
function fertig() { const r = S.round; r.done = true; if (!S.tage.includes(today())) S.tage.push(today()); save(); VIEW = "end"; render(); }
function zaehle() { S.total++; if (!S.heute || S.heute.d !== today()) S.heute = {d: today(), n: 0}; S.heute.n++; if (S.round) S.round.n = (S.round.n || 0) + 1; }

function testBanner() { return TEST ? '<div class="test">測試模式：資料只存在這台電腦的瀏覽器</div>' : ""; }
function renderLogin() {
  APP.innerHTML = testBanner() + '<h1>Hi!</h1><p class="sub">每天幾分鐘，用英文說出你自己的句子。</p>'
    + '<div class="card"><p style="margin:0">說錯沒關係，Mike 會幫你改。最重要的是開口說。</p><button class="btn" id="ich">我是 Kyla</button></div>';
  $("#ich").onclick = async () => { S.name = "Kyla"; try { merge(await dbGet(BASE + "/kyla")); } catch (e) {} save(); render(); }; }

function wocheHtml() { const t = today(), wd = new Date(t * 86400000).getUTCDay(), mo = t - ((wd + 6) % 7), tg = new Set(S.tage || []);
  return '<div class="week">' + ["一", "二", "三", "四", "五", "六", "日"].map((n, i) => { const d = mo + i;
    return '<div>' + n + '<i class="' + (tg.has(d) ? "on" : "") + (d === t ? " heute" : "") + '"></i></div>'; }).join("") + '</div>'; }

async function renderHome() {
  const r = S.round, heuteFertig = (S.tage || []).includes(today()), laeuft = r && !r.done && r.d === today() && r.i > 0;
  const nk = Object.values(SAETZE).filter(neuKorr).length;
  APP.innerHTML = testBanner() + '<h1>Hi Kyla!</h1><p class="sub">' + (heuteFertig ? "今天的練習完成了，太棒了！" : "今天也來說幾句英文吧。") + '</p>'
    + (nk && !heuteFertig ? '<div class="badge">Mike 改好了你的 ' + nk + ' 個句子，開始練習就會看到。</div>' : "")
    + (heuteFertig && nk ? '<button class="btn" id="korr">看 Mike 改好的句子<small>' + nk + ' 個句子</small></button>' : "")
    + (heuteFertig
        ? '<button class="btn soft" id="mehr">再多說幾句<small>大約 3 到 4 句</small></button>'
        : '<button class="btn" id="los">' + (laeuft ? "繼續今天的練習" : "開始今天的練習") + '<small>大約 8 句，5 到 10 分鐘</small></button>')
    + '<div class="card" style="margin-top:16px"><b>這個禮拜</b>' + wocheHtml() + '</div>'
    + '<div class="card"><div class="stat"><div><b>' + (S.total || 0) + '</b><span>你自己造的英文句子</span></div><div><b>' + (S.spoken || 0) + '</b><span>開口說英文的次數</span></div></div></div>';
  const los = $("#los"), mehr = $("#mehr");
  if (los) los.onclick = () => { if (!(r && !r.done && r.d === today())) plan("tag"); VIEW = "round"; render(); };
  if (mehr) mehr.onclick = () => { plan("extra"); VIEW = "round"; render(); };
  const ko = $("#korr"); if (ko) ko.onclick = () => { plan("korr"); VIEW = "round"; render(); }; }

function renderEnd() { const r = S.round || {}, n = r.n || 0;
  APP.innerHTML = testBanner() + '<h1>完成了！</h1>'
    + '<div class="card">' + (n ? '<p style="font-size:20px;margin:0 0 8px"><b>你' + (r.extra ? "剛剛" : "今天") + '自己造了 ' + n + ' 個英文句子。</b></p>'
        + '<p style="margin:0;color:var(--muted)">Mike 會看你的句子。他改好以後，你下次打開就會看到。</p>'
      : '<p style="font-size:20px;margin:0"><b>Mike 的修改都看完了，也說過了。很棒！</b></p>')
    + '<button class="btn" id="home">回首頁</button></div>';
  $("#home").onclick = () => { VIEW = "home"; render(); }; }

function kopf(label) { const r = S.round, p = Math.round(100 * r.i / Math.max(1, r.steps.length));
  return testBanner() + '<div class="top"><button class="x" id="x" aria-label="關閉">×</button><div class="bar"><i style="width:' + p + '%"></i></div></div>'
    + '<div class="lbl">' + label + '</div>'; }
function bindKopf() { $("#x").onclick = () => { VIEW = "home"; render(); }; }
function renderStep(st) {
  const f = {bauen: stepBauen, muster: stepMuster, frage: stepFrage, erzaehlen: stepErzaehlen, korr: stepKorr, lob: stepLob, wdh: stepWdh}[st.k];
  const it = st.id ? (BYID[st.id] || SAETZE[st.id]) : null;
  if (!f || (st.id && !it)) return weiter();   // unbekannte Aufgabe (z. B. geloeschter Satz) ueberspringen
  f(it, st); bindKopf(); }

/* ----- Eingabe: Textfeld + Mikrofon ----- */
function eingabeHtml(ph, rows) {
  return '<textarea id="txt" rows="' + (rows || 3) + '" placeholder="' + esc(ph) + '" autocapitalize="sentences" autocorrect="off" spellcheck="false"></textarea>'
    + (SR ? '<div class="microw"><button class="mic" id="mic" aria-label="說話">' + I.mic + '</button><div class="michint" id="michint">按一下，用英文說</div></div>'
          : '<div class="hint">可以用鍵盤上的麥克風說，也可以打字。</div>')
    + '<div class="err" id="err"></div>'; }
function eingabeBind(onChange) { const ta = $("#txt"), mic = $("#mic"); let gesprochen = false;
  ta.addEventListener("input", onChange);
  if (mic) mic.onclick = () => { const pre = ta.value.trim() ? ta.value.trim() + " " : "";
    $("#michint").textContent = "正在聽……說完再按一下"; $("#err").textContent = "";
    hoeren(mic, {part: t => { ta.value = pre + (pre ? t : cap(t)); onChange(); },
      end: t => { $("#michint").textContent = t ? "可以再按一次，繼續說" : "按一下，用英文說"; if (t) { gesprochen = true; S.spoken++; save(); } onChange(); },
      err: e => { $("#err").textContent = errText(e); }}); };
  return {text: () => ta.value.trim().replace(/\s+/g, " "), gesprochen: () => gesprochen, el: ta}; }

function speichern(it, typ, e) { const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const s = {id, d: today(), ts: Date.now(), typ, aufgabe: it.id, prompt: it.en, zh: it.zh, text: e.text(), gesprochen: e.gesprochen()};
  SAETZE[id] = s; zaehle(); send("PUT", BASE + "/saetze/" + id, s); return s; }
function danach(text, ex) {   // nach dem Absenden: ihr Satz, Beispiel zum Anhoeren, weiter
  $("#body").innerHTML = '<div class="done">存好了！Mike 會幫你看。</div><div class="lbl grey">你的句子：</div><div class="mine">' + esc(text) + '</div>'
    + (ex ? '<div class="lbl grey">別人可能會這樣說：</div><div class="ex">' + esc(ex) + ' ' + spk(ex) + '</div>' : "")
    + '<button class="btn" id="next">下一題</button>';
  $("#next").onclick = weiter; }
function absendenKnopf(min) { return '<button class="btn" id="go" disabled>送出</button><div class="hint" id="gohint">' + (min > 2 ? "說兩三句就可以了。" : "") + '</div>'; }

/* ----- Satz bauen ----- */
const GROSS = /^(I|I'm|I'll|I'd|I've|Taipei|Tainan|Japan|English|German|Chinese|Sunday|TV)$/;
function kaertchen(satz) { return satz.replace(/[.,?!]/g, "").split(/\s+/).filter(Boolean).map((w, i) => i === 0 && !GROSS.test(w) ? w.toLowerCase() : w); }
function stepBauen(it) {
  const loes = [it.en, ...(it.alt || [])], ziele = loes.map(s => kaertchen(s).map(w => w.toLowerCase()));
  const tiles = shuffle(kaertchen(it.en).map((w, i) => ({w, i}))); let wahl = [];
  APP.innerHTML = kopf("把句子排好") + '<div class="card"><div class="zhbig">' + esc(it.zh) + '</div><div class="slots" id="slots"></div><div class="pool" id="pool"></div><div class="msg" id="msg"></div><div id="body"></div></div>';
  const zeig = () => {
    $("#slots").innerHTML = wahl.map((t, k) => '<button class="tile" data-k="' + k + '">' + esc(k === 0 ? cap(t.w) : t.w) + '</button>').join("");
    $("#pool").innerHTML = tiles.filter(t => !wahl.includes(t)).map(t => '<button class="tile" data-i="' + t.i + '">' + esc(t.w) + '</button>').join("");
    $("#slots").querySelectorAll(".tile").forEach(b => b.onclick = () => { wahl = wahl.slice(0, +b.dataset.k).concat(wahl.slice(+b.dataset.k + 1)); $("#msg").textContent = ""; zeig(); });
    $("#pool").querySelectorAll(".tile").forEach(b => b.onclick = () => { wahl.push(tiles.find(t => t.i === +b.dataset.i)); zeig(); pruefe(); }); };
  const pruefe = () => { if (wahl.length < tiles.length) return;
    const ist = wahl.map(t => t.w.toLowerCase()), k = ziele.findIndex(z => z.join(" ") === ist.join(" "));
    if (k >= 0) { const satz = loes[k];
      $("#slots").classList.add("right"); $("#slots").innerHTML = '<div style="font-size:21px;font-weight:700;padding:6px 4px">' + esc(satz) + '</div>'; $("#pool").style.display = "none"; $("#msg").style.display = "none"; say(satz);
      $("#body").innerHTML = '<div class="done" style="margin-top:12px">答對了！' + spk(satz) + '</div>' + nsHtml() + '<button class="btn" id="next">下一題</button>';
      nsBind(satz); $("#next").onclick = weiter; return; }
    // falsch: der laengste richtige Anfang bleibt liegen, der Rest geht zurueck
    let best = 0; ziele.forEach(z => { let n = 0; while (n < ist.length && ist[n] === z[n]) n++; best = Math.max(best, n); });
    wahl = wahl.slice(0, best); zeig(); $("#msg").textContent = best ? "前面這幾個是對的，後面再試試看。" : "順序還不太對，再試試看。"; };
  zeig(); }

/* ----- Nachsprechen (nach Satz bauen, Korrektur, Wiederholung) ----- */
function nsHtml(label) {
  return '<div class="ns">' + (SR ? '<div class="microw"><button class="mic" id="nsmic" aria-label="說話">' + I.mic + '</button><div class="michint" id="nshint">' + (label || "換你說一次") + '</div></div>'
    : '<div class="hint">' + (label || "跟著大聲唸一次！") + '</div>') + '<div id="nsres"></div><div class="err" id="err"></div></div>'; }
function nsBind(z, onTry) { const mic = $("#nsmic"), ziel = typeof z === "function" ? z : () => z; if (!mic) return;
  mic.onclick = () => { $("#nshint").textContent = "正在聽……"; $("#err").textContent = "";
    hoeren(mic, {part: t => { $("#nsres").innerHTML = '<div class="said">' + esc(t) + '</div>'; },
      end: t => { if (!t) { $("#nshint").textContent = "沒聽到，再按一次"; return; }
        $("#nshint").textContent = "再說一次"; S.spoken++; save(); const sc = treffer(ziel(), t), weg = fehlend(ziel(), t), gut = sc >= 0.9 && weg.length <= 1;
        $("#nsres").innerHTML = '<div class="said">' + esc(t) + '</div><div class="fb ' + (gut ? "good" : "close") + '">'
          + (gut ? (weg.length ? "說得很好！只少了一個字：" + esc(weg[0]) : "說得很好！") : "很接近了！" + (weg.length && weg.length <= 4 ? "少了：" + weg.map(esc).join("、") + "。" : "") + "可以再試一次，或是直接下一題。") + '</div>';
        onTry && onTry(t, sc); },
      err: e => { $("#err").textContent = errText(e); }}); }; }

/* ----- Satzmuster ----- */
function stepMuster(it) {
  APP.innerHTML = kopf("用自己的話完成句子") + '<div class="card"><div class="stem">' + esc(it.en).replace(/___/g, '<span class="blank"></span>') + '</div>'
    + '<div class="zh">' + esc(it.zh) + '</div><div id="body">' + eingabeHtml("說出整個句子……") + absendenKnopf(1) + '</div></div>';
  const e = eingabeBind(() => { $("#go").disabled = wc(e.text()) < 2; });
  $("#go").onclick = () => { const s = speichern(it, "muster", e); danach(s.text, it.ex); }; }

/* ----- Frage ----- */
const FRAGE_LBL = {alltag: "回答問題", situation: "情境對話", meinung: "說說你的看法"};
function stepFrage(it) {
  APP.innerHTML = kopf(FRAGE_LBL[it.t] || "回答問題") + '<div class="card"><div class="q">' + esc(it.en) + ' ' + spk(it.en) + '</div>'
    + '<button class="link" id="zhb">看中文</button><div class="zh hid" id="zh">' + esc(it.zh) + '</div>'
    + '<div id="body"><div class="helps"><button class="chip" id="hs">給我開頭</button><button class="chip" id="hw">單字提示</button></div>'
    + '<div class="words hid" id="ws">' + (it.w || []).map(w => '<button class="word" data-say="' + esc(w[0]) + '">' + esc(w[0]) + '<small>' + esc(w[1]) + '</small></button>').join("") + '</div>'
    + eingabeHtml("用一兩句回答……") + absendenKnopf(1) + '</div></div>';
  $("#zhb").onclick = () => { $("#zh").classList.toggle("hid"); };
  const e = eingabeBind(() => { $("#go").disabled = wc(e.text()) < 2; });
  $("#hs").onclick = () => { if (!e.text()) { e.el.value = it.start.replace(/\s*\.\.\.\s*$/, "").replace(/\s*\.\.\.\s*/g, " ") + " "; } $("#go").disabled = wc(e.text()) < 2; };
  $("#hw").onclick = () => { $("#ws").classList.toggle("hid"); };
  $("#go").onclick = () => { const s = speichern(it, it.t === "situation" ? "situation" : it.t === "meinung" ? "meinung" : "frage", e); danach(s.text, it.ex); }; }

/* ----- Erzaehlen ----- */
function stepErzaehlen(it) {
  APP.innerHTML = kopf("說一個小故事（兩三句）") + '<div class="card"><div class="q">' + esc(it.en) + ' ' + spk(it.en) + '</div>'
    + '<button class="link" id="zhb">看中文</button><div class="zh hid" id="zh">' + esc(it.zh) + '</div>'
    + '<ul class="guides">' + it.g.map(g => '<li>' + esc(g[0]) + '<small>' + esc(g[1]) + '</small></li>').join("") + '</ul>'
    + '<div id="body">' + eingabeHtml("可以分好幾次說，每說完一句就再按一次麥克風。", 5) + absendenKnopf(3) + '</div></div>';
  $("#zhb").onclick = () => { $("#zh").classList.toggle("hid"); };
  const e = eingabeBind(() => { $("#go").disabled = wc(e.text()) < 4; });
  $("#go").onclick = () => { const s = speichern(it, "erzaehlen", e); danach(s.text, it.ex); }; }

/* ----- Mikes Korrekturen ----- */
function ctxHtml(s) { return '<div class="ctx">' + esc(s.prompt) + (s.zh ? "<br>" + esc(s.zh) : "") + '</div>'; }
function stepKorr(s) { const d = diff(s.text, s.korr); let nach = null;
  APP.innerHTML = kopf("Mike 幫你改好了") + '<div class="card">' + ctxHtml(s)
    + '<div class="lbl grey">你說的：</div><div class="yours">' + d.a + '</div>'
    + '<div class="lbl grey">Mike 改成：</div><div class="fixed">' + d.b + ' ' + spk(s.korr) + '</div>'
    + (s.notiz ? '<div class="note"><b>Mike：</b>' + esc(s.notiz) + '</div>' : "")
    + '<div class="hint">先聽一次，再自己說說看。</div>' + nsHtml() + '<button class="btn" id="next">下一題</button></div>';
  nsBind(s.korr, t => { nach = t; });
  $("#next").onclick = () => { patchSatz(s.id, {gh: today(), wn: 0, wd: today() + ABSTAND[0], nach: nach}); weiter(); }; }
function stepLob(_, st) { const list = st.ids.map(id => SAETZE[id]).filter(Boolean);
  APP.innerHTML = kopf("Mike 看過了") + '<div class="card"><p style="font-size:20px;font-weight:800;margin:0 0 10px">這' + (list.length > 1 ? "幾" : "") + '句完全正確，很棒！</p>'
    + '<ul class="lob">' + list.map(s => '<li>' + esc(s.text) + (s.notiz ? '<div class="note"><b>Mike：</b>' + esc(s.notiz) + '</div>' : "") + '</li>').join("") + '</ul>'
    + '<button class="btn" id="next">太好了！</button></div>';
  $("#next").onclick = () => { list.forEach(s => patchSatz(s.id, {gh: today()})); weiter(); }; }
function stepWdh(s) { let offen = false;
  APP.innerHTML = kopf("複習") + '<div class="card">' + ctxHtml(s)
    + '<div class="lbl grey">上次你說：</div><div class="yours plain">' + esc(s.text) + '</div>'
    + '<div class="hint">Mike 幫你改過這一句。你還記得正確的說法嗎？說說看！</div>' + nsHtml("說出正確的句子")
    + '<div id="loes"></div><button class="link" id="zeig">看答案</button><button class="btn" id="next">下一題</button></div>';
  const auf = () => { if (offen) return; offen = true; $("#zeig").style.display = "none";
    $("#loes").innerHTML = '<div class="lbl grey">正確的說法：</div><div class="fixed">' + diff(s.text, s.korr).b + ' ' + spk(s.korr) + '</div>'; };
  nsBind(s.korr, () => auf()); $("#zeig").onclick = auf;
  $("#next").onclick = () => { const n = (s.wn || 0) + 1; patchSatz(s.id, {wn: n, wd: n < ABSTAND.length ? today() + ABSTAND[n] : null}); weiter(); }; }

/* ===== Start ===== */
(async function start() {
  $("#ver").textContent = (TEST ? "TEST " : "") + (window.BUILD || "");
  if (S.round && S.round.d !== today()) S.round = null;   // neuer Tag, neue Runde
  APP.innerHTML = testBanner() + '<p class="sub" style="margin-top:30px">載入中……</p>';
  if (S.name) { try { merge(await dbGet(BASE + "/kyla")); } catch (e) {} if (S.round && S.round.d !== today()) S.round = null; }
  await ladeSaetze(); flush(); render();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && VIEW === "home") ladeSaetze().then(() => { if (VIEW === "home") render(); }); });
})();
