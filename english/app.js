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
    if (method === "PATCH") { p[k] = Object.assign(p[k] || {}, val); for (const f in val) if (val[f] == null) delete p[k][f]; } else if (method === "DELETE") delete p[k]; else p[k] = val;
    fake.save(o); return; }
  const r = await fetch(DB_URL + path + ".json", {method, body: JSON.stringify(val)}); if (!r.ok) throw new Error(r.status); }

/* ===== Zustand ===== */
function neu() { return {v: 1, name: "", tage: [], used: {}, total: 0, spoken: 0, heute: null, round: null, queue: [], upd: 0}; }
function load() { try { const o = JSON.parse(localStorage.getItem(LSKEY)); if (o && o.v) return Object.assign(neu(), o); } catch (e) {} return neu(); }
let S = load(), SAETZE = {}, VIEW = "home";
function lokal() { try { localStorage.setItem(LSKEY, JSON.stringify(S)); } catch (e) {} }
let cst = null, CLOUD_OK = false;   // CLOUD_OK: Stand aus der Cloud wurde in dieser Sitzung gelesen
function save() { S.upd = Date.now(); lokal(); clearTimeout(cst); cst = setTimeout(cloudSave, 800); }
async function cloudSave() { if (!S.name) return;
  if (!CLOUD_OK) { try { merge(await dbGet(BASE + "/kyla")); CLOUD_OK = true; lokal(); } catch (e) { return; } }   // nie einen (evtl. leeren) Stand hochladen, ohne den aus der Cloud zu kennen
  const o = Object.assign({}, S); delete o.queue; dbWrite("PUT", BASE + "/kyla", o).catch(() => {}); }
function merge(c) { if (!c || !c.v) return;
  S.tage = [...new Set([...(S.tage || []), ...(c.tage || [])])].sort((a, b) => a - b);
  for (const k in (c.used || {})) S.used[k] = Math.max(S.used[k] || 0, c.used[k]);
  S.total = Math.max(S.total || 0, c.total || 0); S.spoken = Math.max(S.spoken || 0, c.spoken || 0);
  if ((c.upd || 0) > (S.upd || 0)) { S.round = c.round || null; S.heute = c.heute || S.heute; }
  if (!S.name && c.name) S.name = c.name; }

// Warteschlange: jeder Schreibzugriff bleibt lokal gespeichert, bis Firebase ihn angenommen hat (kein Satz geht offline verloren).
let flushing = false, flushTimer = null;
async function flush() { if (flushing) return; flushing = true; clearTimeout(flushTimer);
  try { while (S.queue.length) { const q = S.queue[0];
      try { await dbWrite(q.m, q.p, q.v); }
      catch (e) { if (/^4\d\d$/.test(e.message) && !/^(401|403|429)$/.test(e.message)) { S.kaputt = (S.kaputt || []).concat([q]); } else throw e; }   // dauerhaft abgelehnt: beiseitelegen, Rest nicht blockieren
      S.queue.shift(); lokal(); } }
  catch (e) { flushTimer = setTimeout(flush, 30000); }   // offline: in 30 s nochmal
  flushing = false; }
window.addEventListener("online", () => flush());
function send(m, p, v) { S.queue.push({m, p, v}); save(); flush(); }
function patchSatz(id, v) { SAETZE[id] = Object.assign(SAETZE[id] || {}, v); send("PATCH", BASE + "/saetze/" + id, v); }

async function ladeSaetze() {
  try { SAETZE = (await dbGet(BASE + "/saetze")) || {}; } catch (e) {}
  S.queue.forEach(q => { if (!q.p.includes("/saetze/")) return; const id = q.p.split("/").pop();
    SAETZE[id] = q.m === "PATCH" ? Object.assign(SAETZE[id] || {}, q.v) : q.v; }); }

const korrigiert = s => s && (s.ok || s.korr);
const neuKorr = s => korrigiert(s) && (!s.gh || (s.kt && s.gk && s.gk !== s.kt));   // gk = welche Fassung (kt) sie gesehen hat; aendert Mike danach, kommt sie wieder
const faellig = s => s && s.korr && !s.ok && s.gh && s.wd && s.wd <= today();
const ABSTAND = [2, 5, 12, 30];   // Wiederholung korrigierter Saetze: nach 2, 5, 12, 30 Tagen

/* ===== Sprache: Vorlesen + Spracherkennung ===== */
let VOICE = null;
const sess = t => { try { if (navigator.audioSession) navigator.audioSession.type = t; } catch (e) {} };   // iOS: nach dem Mikro wieder auf Lautsprecher
const SPASS = /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Grandma|Grandpa|Eddy|Flo|Reed|Rocko|Sandy|Shelley/;
function pickVoice() { try { const vs = speechSynthesis.getVoices().filter(v => /^en[-_]US/i.test(v.lang) && !SPASS.test(v.name));
  VOICE = vs.find(v => /Samantha|Ava|Allison|Susan|Zoe|Nicky/i.test(v.name)) || vs.find(v => v.localService) || vs[0] || null; } catch (e) {} }
if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(t, slow) { if (REC) return;   // nicht vorlesen, solange das Mikro offen ist (sonst Echo im Text)
  try { sess("playback"); const u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; if (VOICE) u.voice = VOICE; u.rate = slow ? 0.7 : 0.95; window._u = u;
    if (speechSynthesis.speaking || speechSynthesis.pending) { speechSynthesis.cancel(); setTimeout(() => speechSynthesis.speak(u), 80); } else speechSynthesis.speak(u); } catch (e) {} }
const spk = t => '<span class="spkw"><button class="spk" data-say="' + esc(t) + '" aria-label="聽">' + I.spk + '</button><button class="spk slow" data-say="' + esc(t) + '" data-slow="1">慢</button></span>';
document.addEventListener("click", e => { const b = e.target.closest("[data-say]"); if (b) say(b.dataset.say, !!b.dataset.slow); });

const STANDALONE = !!navigator.standalone;   // vom Home-Bildschirm gestartet: dort gibt es auf dem iPhone keine Spracherkennung
const SR = STANDALONE ? null : (window.SpeechRecognition || window.webkitSpeechRecognition);
let REC = null;
function stopRec() { if (REC) { const r = REC; REC = null; if (r._still) r._still(); r.onend = null; r.onresult = null; r.onerror = null; try { r.abort(); } catch (e) {} } }
/* ----- Tonaufnahme parallel zur Spracherkennung, damit Mike sie anhoeren kann (Mike 2026-10-02) -----
   Gespeichert in save/__kyla_en/audio/<satz-id> = {m: Typ, c: [data-URLs]}, getrennt von den Texten; nach 30 Tagen loescht die App sie.
   Stoert die Aufnahme auf einem Geraet die Spracherkennung (2x leer, bevor es je geklappt hat), schaltet sie sich dort ab. */
const AUFN_AUS = "kyla_en_aufnahme_aus", AUFN_OK = "kyla_en_aufnahme_ok";
let STREAM = null, STREAM_P = null, MR = null, CLIPS = [], leerMitAufn = 0;
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const aufnMoeglich = () => { if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)) return false;
  const aus = +lsGet(AUFN_AUS); if (aus && Date.now() - aus < 7 * 864e5) return false;   // abgeschaltet gilt 7 Tage, dann neuer Versuch
  if (aus) { try { localStorage.removeItem(AUFN_AUS); localStorage.removeItem(AUFN_OK); } catch (e) {} } return true; };
function aufnStart() { if (!aufnMoeglich()) return false; const ziel = CLIPS;
  const los = st => { try { const typ = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || "";
      const mr = new MediaRecorder(st, Object.assign({audioBitsPerSecond: 24000}, typ ? {mimeType: typ} : {})), teile = [], t0 = Date.now();
      mr.ondataavailable = e => { if (e.data && e.data.size) teile.push(e.data); };
      mr.onstop = () => { const stumm = st.getAudioTracks().every(t => t.muted);   // Spur stumm (Mikro gehoert der Erkennung): Clip verwerfen
        if (teile.length && !stumm && Date.now() - t0 > 600) ziel.push(new Blob(teile, {type: mr.mimeType || typ || "audio/mp4"})); };
      mr.start(); MR = mr; } catch (e) {} };
  if (STREAM) los(STREAM);
  else { if (!STREAM_P) STREAM_P = navigator.mediaDevices.getUserMedia({audio: true}).then(st => { STREAM = st; STREAM_P = null; return st; }, e => { STREAM_P = null; throw e; });
    STREAM_P.then(st => { if (REC && !MR) los(st); else if (!REC) aufnFrei(); }).catch(() => {}); }
  return true; }
function aufnStop() { if (MR) { try { if (MR.state !== "inactive") MR.stop(); } catch (e) {} MR = null; } }
function aufnFrei() { aufnStop(); if (STREAM) { STREAM.getTracks().forEach(t => t.stop()); STREAM = null; } }
function aufnErgebnis(mitAufn, text, fehler) { if (!mitAufn || fehler) return;   // Schweigen/Abbruch (no-speech, aborted ...) zaehlt nicht
  if (text) { leerMitAufn = 0; lsSet(AUFN_OK, "1"); } else if (!lsGet(AUFN_OK) && ++leerMitAufn >= 2) { lsSet(AUFN_AUS, String(Date.now())); aufnFrei(); } }
const alsDataUrl = b => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(b); });
function aufnHochladen(id, clips) {   // kurz warten, bis die letzte Aufnahme fertig ist; direkt hochladen (nicht ueber die Warteschlange im localStorage, die waere fuer Audio zu klein)
  setTimeout(async () => { if (!clips.length) return; const c = (await Promise.all(clips.map(alsDataUrl))).filter(Boolean); if (!c.length) return;
    for (let a = 0; a < 4; a++) { try { await dbWrite("PUT", BASE + "/audio/" + id, {m: clips[0].type || "", c}); patchSatz(id, {audio: c.length}); return; }
      catch (e) { await new Promise(r => setTimeout(r, 8000 * (a + 1))); } } }, 900); }   // offline: Aufnahme geht verloren, der Text nicht

function hoeren(btn, cb) {   // erster Druck startet, zweiter beendet; cb.end(text, fehler) kommt genau einmal
  if (REC) { const r = REC; try { r.stop(); } catch (e) {} setTimeout(() => { if (REC === r && r._ende) r._ende(); }, 1500); return; }   // kommt kein onend: nach 1,5 s selbst beenden
  try { speechSynthesis.cancel(); } catch (e) {}
  sess("play-and-record");
  const r = new SR(), t0 = Date.now(); REC = r; let txt = "", fehler = null, fertig = false, tLast = t0, wd = null;
  r.lang = "en-US"; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
  const ende = () => { if (fertig) return; fertig = true; clearInterval(wd); btn.classList.remove("rec"); if (REC === r) REC = null; try { r.abort(); } catch (e) {} sess("playback"); cb.end && cb.end(txt, fehler); };
  r._ende = ende; r._still = () => { fertig = true; clearInterval(wd); btn.classList.remove("rec"); sess("playback"); };   // still: beim Verlassen der Seite, ohne Rueckruf
  r.onresult = e => { tLast = Date.now(); let s = ""; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; txt = s.trim(); cb.part && cb.part(txt); };
  r.onerror = e => { fehler = e.error || "fehler"; cb.err && cb.err(fehler); };
  r.onend = ende;
  wd = setInterval(() => { if (fertig) return clearInterval(wd);   // Wachhund: iOS meldet manchmal kein Ende
    if (Date.now() - tLast > (txt ? 5000 : 10000) || Date.now() - t0 > 60000) { clearInterval(wd); try { r.stop(); } catch (e) {} setTimeout(ende, 1500); } }, 500);
  btn.classList.add("rec");
  try { r.start(); } catch (e) { fehler = "start"; cb.err && cb.err("start"); ende(); } }
const setT = (sel, t) => { const el = $(sel); if (el) el.textContent = t; };   // Elemente koennen nach dem Absenden schon weg sein
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
function diff(a, b) { const ta = a.split(/\s+/).filter(Boolean), tb = b.split(/\s+/).filter(Boolean), nz = t => t.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']/g, "");
  const na = ta.map(nz), nb = tb.map(nz), L = lcs(na, nb); let i = 0, j = 0; const A = [], B = [];
  while (i < ta.length && j < tb.length) { if (na[i] === nb[j]) { A.push(esc(ta[i++])); B.push(esc(tb[j++])); }
    else if (L[i + 1][j] >= L[i][j + 1]) A.push("<del>" + esc(ta[i++]) + "</del>"); else B.push("<ins>" + esc(tb[j++]) + "</ins>"); }
  while (i < ta.length) A.push("<del>" + esc(ta[i++]) + "</del>"); while (j < tb.length) B.push("<ins>" + esc(tb[j++]) + "</ins>");
  return {a: A.join(" "), b: B.join(" ")}; }

/* ===== Runde planen ===== */
const MIX = {1: {b: 2, m: 2, q: 4, s: 0}, 2: {b: 1, m: 2, q: 3, s: 2}, 3: {b: 1, m: 1, q: 4, s: 2}};   // Treppe: weniger Vorgaben, mehr freies Sprechen (Mike 2026-10-02: schwerer)
function stufe() { const n = (S.tage || []).filter(d => d < today()).length; return n < 2 ? 1 : n < 7 ? 2 : 3; }
function waehle(list, n, lv, belegt) {   // zuerst Ungenutztes der aktuellen Stufe, dann Ungenutztes darunter, dann das am laengsten Zurueckliegende
  return list.filter(x => x.lv <= lv && !belegt.has(x.id))
    .map(x => { const u = S.used[x.id]; return {x, k: (u == null ? 0 : 1000 + u) + (x.lv === lv ? 0 : 300) + Math.random()}; })
    .sort((a, b) => a.k - b.k).slice(0, Math.max(0, n)).map(o => { belegt.add(o.x.id); return o.x.id; }); }
const MAX_SCHRITTE = 8;   // Tagesrunde inkl. Korrekturen und Wiederholungen; was nicht passt, kommt am naechsten Tag
function pause() { const vor = (S.tage || []).filter(d => d < today()); return vor.length ? today() - Math.max(...vor) - 1 : 0; }   // verpasste Tage seit dem letzten Uebungstag
const KURZ_NACH_PAUSE = () => pause() >= 2;   // nach 2+ verpassten Tagen: kurze Wiedereinstiegs-Runde
function plan(art) {   // art: "tag" (Tagesrunde), "extra" (noch ein paar Saetze), "korr" (nur Mikes Korrekturen)
  const lv = stufe(), extra = art !== "tag", kurz = art === "tag" && KURZ_NACH_PAUSE(), vorne = [], wdh = [], belegt = new Set();
  const mx = Object.assign({}, art === "korr" ? {b: 0, m: 0, q: 0, s: 0} : art === "extra" ? {b: 0, m: 1, q: 2, s: lv > 1 ? 1 : 0} : kurz ? {b: 1, m: 1, q: 2, s: 0} : MIX[lv]);
  { const alle = Object.values(SAETZE).filter(s => s && s.id);
    const nk = alle.filter(neuKorr).sort((a, b) => a.ts - b.ts), lob = nk.filter(s => s.ok);
    if (lob.length) vorne.push({k: "lob", ids: lob.map(s => s.id)});
    nk.filter(s => !s.ok).slice(0, art === "korr" ? 8 : 4).forEach(s => vorne.push({k: "korr", id: s.id}));
    if (art === "tag") alle.filter(faellig).sort((a, b) => a.wd - b.wd).slice(0, Math.max(0, Math.min(2, 5 - vorne.filter(s => s.k === "korr").length))).forEach(s => wdh.push({k: "wdh", id: s.id})); }
  if (art === "tag") { const frei = Math.max(3, MAX_SCHRITTE - vorne.filter(s => s.k !== "lob").length - wdh.length);
    while (mx.b + mx.m + mx.q + mx.s > frei) { if (mx.b) mx.b--; else if (mx.s) mx.s--; else if (mx.m) mx.m--; else if (mx.q > 1) mx.q--; else break; } }
  const b = mx.b, m = mx.m;
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
function render() { try { speechSynthesis.cancel(); } catch (e) {} stopRec(); aufnFrei(); CLIPS = [];
  const r = S.round;
  if (!S.name) return renderLogin();
  if (VIEW === "end") return renderEnd();
  if (VIEW === "round" && r && !r.done && r.d >= today() - 1) { if (r.i >= r.steps.length) return fertig(); return renderStep(r.steps[r.i]); }   // eine offene Runde ueber Mitternacht darf fertig werden
  VIEW = "home"; renderHome(); }
function erledigt() { const r = S.round, st = r && r.steps[r.i]; if (!st) return; if (st.id && BYID[st.id]) S.used[st.id] = today(); r.i++; save(); }
function weiter() { erledigt(); render(); window.scrollTo(0, 0); }
function fertig() { const r = S.round; r.done = true; if (!S.tage.includes(today())) S.tage.push(today()); save(); VIEW = "end"; render(); }
function zaehle() { S.total++; if (!S.heute || S.heute.d !== today()) S.heute = {d: today(), n: 0}; S.heute.n++; if (S.round) S.round.n = (S.round.n || 0) + 1; }

function testBanner() { return TEST ? '<div class="test">測試模式：資料只存在這台電腦的瀏覽器</div>' : ""; }
function renderLogin() {
  APP.innerHTML = testBanner() + '<h1>Hi!</h1><p class="sub">每天幾分鐘，用英文說出你自己的句子。</p>'
    + '<div class="card"><p style="margin:0">說錯沒關係，Mike 會幫你改。最重要的是開口說。</p><button class="btn" id="ich">我是 Kyla</button></div>';
  $("#ich").onclick = async () => { S.name = "Kyla"; try { merge(await dbGet(BASE + "/kyla")); CLOUD_OK = true; } catch (e) {} save(); render(); }; }

function wocheHtml() { const t = today(), wd = new Date(t * 86400000).getUTCDay(), mo = t - ((wd + 6) % 7), tg = new Set(S.tage || []);
  return '<div class="week">' + ["一", "二", "三", "四", "五", "六", "日"].map((n, i) => { const d = mo + i;
    return '<div>' + n + '<i class="' + (tg.has(d) ? "on" : "") + (d === t ? " heute" : "") + '"></i></div>'; }).join("") + '</div>'; }

async function renderHome() {
  const r = S.round, heuteFertig = (S.tage || []).includes(today()), laeuft = r && !r.done && r.d === today() && r.i > 0;
  const nk = Object.values(SAETZE).filter(neuKorr).length;
  const kurz = !heuteFertig && !laeuft && KURZ_NACH_PAUSE();
  APP.innerHTML = testBanner() + '<h1>Hi Kyla!</h1><p class="sub">' + (heuteFertig ? "今天的練習完成了，太棒了！" : kurz ? "歡迎回來！今天輕鬆一點，說幾句就好。" : "今天也來說幾句英文吧。") + '</p>'
    + (nk && !heuteFertig ? '<div class="badge">Mike 改好了你的 ' + nk + ' 個句子，開始練習就會看到。</div>' : "")
    + (heuteFertig && nk ? '<button class="btn" id="korr">看 Mike 改好的句子<small>' + nk + ' 個句子</small></button>' : "")
    + (heuteFertig
        ? '<button class="btn soft" id="mehr">再多說幾句<small>大約 3 到 4 句</small></button>'
        : '<button class="btn" id="los">' + (laeuft ? "繼續今天的練習" : "開始今天的練習") + '<small>' + (kurz ? "大約 5 句，5 分鐘" : "大約 8 句，5 到 10 分鐘") + '</small></button>')
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
  const gueltig = st.k === "korr" || st.k === "wdh" ? !!(it && it.korr && !it.ok && it.text) : st.k === "lob" ? (st.ids || []).some(id => SAETZE[id] && SAETZE[id].ok) : !st.id || !!it;
  if (!f || !gueltig) return weiter();   // unbekannt oder inzwischen geaendert (z. B. Mike hat eine Korrektur auf richtig gestellt): ueberspringen
  try { f(it, st); bindKopf(); } catch (e) { console.error(e); weiter(); } }

/* ----- Eingabe: Textfeld + Mikrofon ----- */
const OHNE_SR = () => STANDALONE ? "從主畫面打開時不能用語音辨識。請用 Safari 打開這個網頁，或是用鍵盤上的麥克風說。" : "可以用鍵盤上的麥克風說，也可以打字。";
function eingabeHtml(ph, rows) {
  return '<textarea id="txt" rows="' + (rows || 3) + '" placeholder="' + esc(ph) + '" autocapitalize="sentences" autocorrect="off" spellcheck="false"></textarea>'
    + (SR ? '<div class="microw"><button class="mic" id="mic" aria-label="說話">' + I.mic + '</button><div class="michint" id="michint">按一下，用英文說</div></div>'
          : '<div class="hint">' + OHNE_SR() + '</div>')
    + '<div class="err" id="err"></div>'; }
function eingabeBind(onChange) { const ta = $("#txt"), mic = $("#mic"); let gesprochen = false, warte = null;
  ta.addEventListener("input", onChange);
  if (mic) mic.onclick = () => { const pre = ta.value.trim() ? ta.value.trim() + " " : "", neu = !REC; let mitAufn = false;
    ta.blur(); setT("#michint", "正在聽……說完停一下，會自動結束"); setT("#err", "");
    hoeren(mic, {part: t => { ta.value = pre + (pre ? t : cap(t)); onChange(); },
      end: (t, f) => { aufnFrei(); aufnErgebnis(mitAufn, t, f); setT("#michint", t ? "可以再按一次，繼續說" : "按一下，用英文說");
        if (t) { gesprochen = true; S.spoken++; save(); } onChange(); if (warte) { const w = warte; warte = null; setTimeout(w, 0); } },
      err: e => { setT("#err", errText(e)); }});
    mitAufn = neu && REC ? aufnStart() : false; };
  return {text: () => ta.value.trim().replace(/\s+/g, " "), gesprochen: () => gesprochen, el: ta,
    fertig: cb => { if (REC && mic) { warte = cb; hoeren(mic, {}); } else cb(); } };   // Absenden waehrend das Mikro laeuft: erst das Ende abwarten
}

function speichern(it, typ, e) { const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const s = {id, d: today(), ts: Date.now(), typ, aufgabe: it.id, prompt: it.en, zh: it.zh, text: e.text(), gesprochen: e.gesprochen()};
  SAETZE[id] = s; zaehle(); send("PATCH", BASE + "/saetze/" + id, s); if (s.gesprochen) aufnHochladen(id, CLIPS); erledigt(); return s; }
function danach(text, ex) {   // nach dem Absenden (Schritt ist schon erledigt): ihr Satz, Beispiel zum Anhoeren, weiter
  $("#body").innerHTML = '<div class="done">存好了！Mike 會幫你看。</div><div class="lbl grey">你的句子：</div><div class="mine">' + esc(text) + '</div>'
    + (ex ? '<div class="lbl grey">別人可能會這樣說：</div><div class="ex">' + esc(ex) + ' ' + spk(ex) + '</div>' : "")
    + '<button class="btn" id="next">下一題</button>';
  $("#next").onclick = () => { render(); window.scrollTo(0, 0); }; }
function absendenKnopf(min) { return '<button class="btn" id="go" disabled>送出</button><div class="hint" id="gohint">' + (min > 2 ? "至少說三句，用 because、so、but 連起來。" : min > 1 ? "至少說兩句，或是一個長句子。" : "至少說六個字。") + '</div>'; }

/* ----- Satz bauen ----- */
const GROSS = /^(I|I'm|I'll|I'd|I've|Taipei|Tainan|Hsinchu|Japan|English|German|Chinese|Sunday|TV)$/;
function kaertchen(satz) { return satz.replace(/[.,?!]/g, "").split(/\s+/).filter(Boolean).map((w, i) => i === 0 && !GROSS.test(w) ? w.toLowerCase() : w); }
function stepKaertchen(it) {   // (Reserve, falls ein Satz keine MC-Stuecke hat) jedes Kaertchen wird sofort geprueft: richtig = bleibt liegen, falsch = wackelt und bleibt im Vorrat; nach 2 Fehlern leuchtet das richtige
  const loes = [it.en, ...(it.alt || [])], anzeige = loes.map(x => x.split(/\s+/).filter(Boolean)), ziele = loes.map(x => kaertchen(x).map(w => w.toLowerCase()));
  const tiles = shuffle(kaertchen(it.en).map((w, i) => ({w, i}))); let wahl = [], fehler = 0;
  APP.innerHTML = kopf("把句子排好") + '<div class="card"><div class="zhbig">' + esc(it.zh) + '</div><div class="slots" id="slots"></div><div class="pool" id="pool"></div><div class="msg" id="msg"></div><div id="body"></div></div>';
  const passend = () => ziele.map((z, k) => k).filter(k => wahl.every((t, n) => ziele[k][n] === t.w.toLowerCase()));
  const zeig = () => { const k = passend()[0];
    $("#slots").innerHTML = wahl.map((t, n) => '<span class="tile">' + esc(anzeige[k][n]) + '</span>').join("");
    const naechst = fehler >= 2 ? ziele[k][wahl.length] : null; let markiert = false;
    $("#pool").innerHTML = tiles.filter(t => !wahl.includes(t)).map(t => { const tipp = !markiert && naechst && t.w.toLowerCase() === naechst; if (tipp) markiert = true;
      return '<button class="tile' + (tipp ? " tipp" : "") + '" data-i="' + t.i + '">' + esc(t.w) + '</button>'; }).join("");
    $("#pool").querySelectorAll(".tile").forEach(b => b.onclick = () => tippe(tiles.find(t => t.i === +b.dataset.i), b)); };
  const tippe = (t, b) => { const n = wahl.length;
    if (!passend().some(k => ziele[k][n] === t.w.toLowerCase())) { fehler++; b.classList.remove("wackel"); void b.offsetWidth; b.classList.add("wackel");
      $("#msg").textContent = fehler >= 2 ? "看看發亮的那個。" : "不是這個，再找找看。"; if (fehler === 2) zeig(); return; }
    wahl.push(t); fehler = 0; $("#msg").textContent = ""; zeig();
    if (wahl.length === tiles.length) { const satz = loes[passend()[0]];
      $("#slots").classList.add("right"); $("#slots").innerHTML = '<div style="font-size:21px;font-weight:700;padding:6px 4px">' + esc(satz) + '</div>';
      $("#pool").style.display = "none"; $("#msg").style.display = "none"; say(satz);
      $("#body").innerHTML = '<div class="done" style="margin-top:12px">答對了！' + spk(satz) + '</div>' + nsHtml() + '<button class="btn" id="next">下一題</button>';
      nsBind(satz); $("#next").onclick = weiter; } };
  zeig(); }

function mcSaetze(teile, k) {   // Mike 2026-10-02: alle 4 Saetze unterscheiden sich an DERSELBEN Stelle k (sonst ist der richtige per Mehrheit erratbar)
  return teile[k].map(f => teile.map((t, j) => j === k ? f : t[0]).join(" ")); }
// Mike 2026-10-04: kurze Erklaerung auf Chinesisch (data.js MC_X, TIPP), minimal, nur auf Knopfdruck bzw. nach der Antwort
const warum = (id, k) => { const x = typeof MC_X !== "undefined" && MC_X[id] && MC_X[id][k]; return x ? '<div class="erkl"><b>為什麼？</b>' + esc(x) + '</div>' : ""; };
const tippKnopf = id => typeof TIPP !== "undefined" && TIPP[id] ? '<button class="chip" id="ht">小提示</button>' : "";
const tippBox = id => typeof TIPP !== "undefined" && TIPP[id] ? '<div class="erkl hid" id="tp">' + esc(TIPP[id]) + '</div>' : "";
const tippBind = () => { const b = $("#ht"); if (b) b.onclick = () => $("#tp").classList.toggle("hid"); };
function stepBauen(it) {   // Mehrfachauswahl ganzer Saetze: falsche werden rot und bleiben aus, sie tippt selbst das Richtige
  const teile = typeof MC !== "undefined" && MC[it.id]; if (!teile) return stepKaertchen(it);
  APP.innerHTML = kopf("選出正確的句子") + '<div class="card"><div class="zhbig">' + esc(it.zh) + '</div><div class="opts" id="opts"></div><div class="msg" id="msg"></div><div id="body"></div></div>';
  let fehler = 0; const stelle = Math.floor(Math.random() * teile.length);
  $("#opts").innerHTML = shuffle(mcSaetze(teile, stelle)).map(o => '<button class="opt" data-ok="' + (o === it.en ? 1 : 0) + '">' + esc(o) + '</button>').join("");
  $("#opts").querySelectorAll(".opt").forEach(b => b.onclick = () => {
    if (b.dataset.ok !== "1") { fehler++; b.classList.add("falsch", "wackel"); b.disabled = true; $("#msg").textContent = "這句有錯，再看看其他的。"; return; }
    $("#opts").outerHTML = '<div class="satz right" id="satz">' + esc(it.en) + '</div>'; $("#msg").style.display = "none"; say(it.en);
    $("#body").innerHTML = '<div class="done" style="margin-top:12px">' + (fehler ? "對，就是這句。" : "答對了！") + spk(it.en) + '</div>' + warum(it.id, stelle) + nsHtml("按下麥克風，句子會蓋起來，憑記憶說一次") + '<button class="btn" id="next">下一題</button>';
    nsBind(it.en, null, "#satz"); $("#next").onclick = weiter; }); }

/* ----- Nachsprechen (nach Satz bauen, Korrektur, Wiederholung) ----- */
function nsHtml(label) {
  return '<div class="ns">' + (SR ? '<div class="microw"><button class="mic" id="nsmic" aria-label="說話">' + I.mic + '</button><div class="michint" id="nshint">' + (label || "換你說一次") + '</div></div>'
    : '<div class="hint">' + (label || "跟著大聲唸一次！") + '</div>') + '<div id="nsres"></div><div class="err" id="err"></div></div>'; }
function nsBind(z, onTry, deckel) { const mic = $("#nsmic"), ziel = typeof z === "function" ? z : () => z; if (!mic) return;   // deckel: Element, das beim Sprechen verdeckt wird
  const zu = an => { const d = deckel && $(deckel); if (d) d.classList.toggle("verdeckt", an); };
  mic.onclick = () => { setT("#nshint", "正在聽……"); setT("#err", ""); if (!REC) zu(true);
    hoeren(mic, {part: t => { const r = $("#nsres"); if (r) r.innerHTML = '<div class="said">' + esc(t) + '</div>'; },
      end: t => { zu(false); if (!$("#nsres")) return; if (!t) { setT("#nshint", "沒聽到，再按一次"); return; }
        setT("#nshint", "再說一次"); S.spoken++; save(); const sc = treffer(ziel(), t), weg = fehlend(ziel(), t), gut = sc >= 0.9 && !weg.length;
        $("#nsres").innerHTML = '<div class="said">' + esc(t) + '</div><div class="fb ' + (gut ? "good" : "close") + '">'
          + (gut ? "說得很好！" : "很接近了！" + (weg.length && weg.length <= 4 ? "少了：" + weg.map(esc).join("、") + "。" : "") + "可以再試一次，或是直接下一題。") + '</div>';
        onTry && onTry(t, sc); },
      err: e => { zu(false); setT("#err", errText(e)); }}); }; }

/* ----- Satzmuster ----- */
function stepMuster(it) {
  APP.innerHTML = kopf("用自己的話完成句子") + '<div class="card"><div class="stem">' + esc(it.en).replace(/___/g, '<span class="blank"></span>') + '</div>'
    + '<div class="zh">' + esc(it.zh) + '</div><div id="body">' + (tippKnopf(it.id) ? '<div class="helps">' + tippKnopf(it.id) + '</div>' + tippBox(it.id) : "")
    + eingabeHtml("說出整個句子……") + absendenKnopf(1) + '</div></div>';
  tippBind();
  const e = eingabeBind(() => { $("#go").disabled = wc(e.text()) < 6; });
  $("#go").onclick = () => e.fertig(() => { const s = speichern(it, "muster", e); danach(s.text, it.ex); }); }

/* ----- Laenger sprechen: Verbinder-Hilfe und ein Anstupser, wenn keiner vorkommt ----- */
const VERB_RE = /\b(because|so|but|and then|that's why|that is why|when|after|before|then|although|even though|if|otherwise|while)\b/i;
function verbinderHtml() { const lv = stufe();
  return '<div class="words hid" id="vb">' + VERBINDER.filter(v => v.lv <= lv).map(v => '<button class="word" data-say="' + esc(v.en) + '">' + esc(v.en) + '<small>' + esc(v.zh) + '</small></button>').join("") + '</div>'; }
function absenden(e, los) { let gestupst = false;   // einmal nachfragen, wenn die Antwort keine Verknuepfung hat
  $("#go").onclick = () => e.fertig(() => { if (!$("#gohint")) return; if (!gestupst && !VERB_RE.test(e.text())) { gestupst = true;
      $("#gohint").innerHTML = '<div class="note">可以說長一點嗎？用 <b>because</b>、<b>so</b> 或 <b>but</b> 再加一點。<div class="helps" style="margin-top:8px"><button class="chip" id="mehrsag">好，再說一點</button><button class="chip" id="trotzdem">這樣就送出</button></div></div>';
      $("#mehrsag").onclick = () => { $("#gohint").innerHTML = ""; const vb = $("#vb"); if (vb) vb.classList.remove("hid"); };
      $("#trotzdem").onclick = los; return; }
    los(); }); }

/* ----- Frage ----- */
const FRAGE_LBL = {alltag: "回答問題", situation: "情境對話", meinung: "說說你的看法"};
function stepFrage(it) {
  APP.innerHTML = kopf(FRAGE_LBL[it.t] || "回答問題") + '<div class="card"><div class="q">' + esc(it.en) + ' ' + spk(it.en) + '</div>'
    + '<button class="link" id="zhb">看中文</button><div class="zh hid" id="zh">' + esc(it.zh) + '</div>'
    + '<div id="body"><div class="helps"><button class="chip" id="hs">給我開頭</button><button class="chip" id="hw">單字提示</button><button class="chip" id="hv">說長一點</button>' + tippKnopf(it.id) + '</div>' + tippBox(it.id)
    + '<div class="hint hid" id="st">可以這樣說：' + esc(it.start) + '</div>'
    + '<div class="words hid" id="ws">' + (it.w || []).map(w => '<button class="word" data-say="' + esc(w[0]) + '">' + esc(w[0]) + '<small>' + esc(w[1]) + '</small></button>').join("") + '</div>'
    + verbinderHtml() + eingabeHtml("說兩句以上，用 because、so、but 連起來……") + absendenKnopf(2) + '</div></div>';
  $("#zhb").onclick = () => { $("#zh").classList.toggle("hid"); };
  const e = eingabeBind(() => { $("#go").disabled = wc(e.text()) < 8; });
  $("#hs").onclick = () => { $("#st").classList.remove("hid"); if (!e.text()) e.el.value = it.start.split("...")[0].trim() + " "; $("#go").disabled = wc(e.text()) < 8; };   // nur der Teil vor dem ersten "..." kommt ins Feld
  $("#hw").onclick = () => { $("#ws").classList.toggle("hid"); };
  $("#hv").onclick = () => { $("#vb").classList.toggle("hid"); }; tippBind();
  absenden(e, () => { const s = speichern(it, it.t === "situation" ? "situation" : it.t === "meinung" ? "meinung" : "frage", e); danach(s.text, it.ex); }); }

/* ----- Erzaehlen ----- */
function stepErzaehlen(it) {
  APP.innerHTML = kopf("說一個小故事（三四句）") + '<div class="card"><div class="q">' + esc(it.en) + ' ' + spk(it.en) + '</div>'
    + '<button class="link" id="zhb">看中文</button><div class="zh hid" id="zh">' + esc(it.zh) + '</div>'
    + '<ul class="guides">' + it.g.map(g => '<li>' + esc(g[0]) + '<small>' + esc(g[1]) + '</small></li>').join("") + '</ul>'
    + '<div id="body"><div class="helps"><button class="chip" id="hv">說長一點</button>' + tippKnopf(it.id) + '</div>' + tippBox(it.id) + verbinderHtml()
    + eingabeHtml("可以分好幾次說，每說完一句就再按一次麥克風。", 5) + absendenKnopf(3) + '</div></div>';
  $("#zhb").onclick = () => { $("#zh").classList.toggle("hid"); };
  $("#hv").onclick = () => { $("#vb").classList.toggle("hid"); }; tippBind();
  const e = eingabeBind(() => { $("#go").disabled = wc(e.text()) < 18; });
  absenden(e, () => { const s = speichern(it, "erzaehlen", e); danach(s.text, it.ex); }); }

/* ----- Mikes Korrekturen ----- */
function ctxHtml(s) { return '<div class="ctx">' + esc(s.prompt) + (s.zh ? "<br>" + esc(s.zh) : "") + '</div>'; }
function stepKorr(s) { const d = diff(s.text, s.korr); let nach = null;
  APP.innerHTML = kopf("Mike 幫你改好了") + '<div class="card">' + ctxHtml(s)
    + '<div class="lbl grey">你說的：</div><div class="yours">' + d.a + '</div>'
    + '<div class="lbl grey">Mike 改成：</div><div class="fixed" id="fixed">' + d.b + ' ' + spk(s.korr) + '</div>'
    + (s.notiz ? '<div class="note"><b>Mike：</b>' + esc(s.notiz) + '</div>' : "")
    + '<div class="hint">先聽一次，再蓋住句子，憑記憶說一次。</div>' + nsHtml() + '<button class="btn" id="next">下一題</button></div>';
  nsBind(s.korr, t => { nach = t; }, "#fixed");
  $("#next").onclick = () => { patchSatz(s.id, {gh: today(), gk: s.kt || null, wn: 0, wd: today() + ABSTAND[0], nach: nach}); weiter(); }; }
function stepLob(_, st) { const list = st.ids.map(id => SAETZE[id]).filter(s => s && s.ok);
  APP.innerHTML = kopf("Mike 看過了") + '<div class="card"><p style="font-size:20px;font-weight:800;margin:0 0 10px">這' + (list.length > 1 ? "幾" : "") + '句完全正確，很棒！</p>'
    + '<ul class="lob">' + list.map(s => '<li>' + esc(s.text) + (s.notiz ? '<div class="note"><b>Mike：</b>' + esc(s.notiz) + '</div>' : "") + '</li>').join("") + '</ul>'
    + '<button class="btn" id="next">太好了！</button></div>';
  $("#next").onclick = () => { list.forEach(s => patchSatz(s.id, {gh: today(), gk: s.kt || null})); weiter(); }; }
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
  if (S.name) { try { merge(await dbGet(BASE + "/kyla")); CLOUD_OK = true; } catch (e) {} if (S.round && S.round.d !== today()) S.round = null; }
  await ladeSaetze();
  Object.values(SAETZE).filter(x => x && x.audio && x.d < today() - 30).forEach(x => { send("DELETE", BASE + "/audio/" + x.id, null); patchSatz(x.id, {audio: null}); });   // Aufnahmen nach 30 Tagen loeschen
  flush(); render();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState !== "visible") return; flush();
    if (VIEW === "home") ladeSaetze().then(() => { if (VIEW === "home") render(); }); });
})();
