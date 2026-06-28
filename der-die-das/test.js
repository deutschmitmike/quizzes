// Automatische Prüfung des Spiels — vor jedem Commit ausführen:  node test.js
// Prüft Daten, Karten, Stufen, SRS UND die Cloud-Sync-Logik (Datenschutz gegen Überschreiben).
const fs = require("fs"), vm = require("vm");
let fails = 0;
const ck = (name, cond, extra) => { console.log((cond ? "  ok  " : "FAIL  ") + name + (cond ? "" : "  " + (extra || ""))); if (!cond) fails++; };

const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const mm = html.match(/<script>\s*"use strict";([\s\S]*?)<\/script>/);
if (!mm) { console.log("FAIL  <script> nicht gefunden"); process.exit(1); }
const baseSrc = '"use strict";' + mm[1];
const EXPORT = "\n;globalThis.__x={G,P,W,D,A,ITEMS,EXTRA,STAGES,cardData,startSession,today,MAX_SESSION,getQueue:()=>queue,getS:()=>S,setS:x=>{S=x;},fresh,lbEntry,cloudSave,cloudLoad,adoptIfNewer,tryJoin,nameKey};";
const strip = s => s.replace(/renderHome\(\);\s*cloudSync\(\);[^\n]*$/, "").replace(/renderHome\(\);\s*$/, "");

function el() { return new Proxy({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, innerHTML: "", value: "", appendChild() {}, querySelectorAll: () => [], addEventListener() {}, getAttribute: () => "", setAttribute() {}, focus() {} }, { get(t, p) { return (p in t) ? t[p] : ((...a) => el()); }, set(t, p, v) { t[p] = v; return true; } }); }
function makeCtx(src, fetchImpl, extra) {
  const store = {};
  const ctx = Object.assign({ console: { log() {} }, Math, JSON, Date, Object, Array, Set, Promise,
    fetch: fetchImpl || (() => Promise.resolve({ json: () => Promise.resolve(null) })),
    document: { getElementById: () => el(), createElement: () => el(), querySelector: () => el(), querySelectorAll: () => [] },
    localStorage: { getItem: k => store[k] || null, setItem: (k, v) => store[k] = v }, navigator: {}, speechSynthesis: null, setTimeout: () => 0, clearTimeout: () => 0 }, extra || {});
  ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(src, ctx); return ctx.__x;
}

(async () => {
  // ---- Teil 1: Inhalt, Karten, SRS (Datei wie veröffentlicht, ohne Sync) ----
  let X;
  try { X = makeCtx(strip(baseSrc) + EXPORT); } catch (e) { console.log("FAIL  Skript-Laufzeitfehler: " + e.message); process.exit(1); }
  const { G, P, W, D, A, ITEMS, EXTRA, STAGES, cardData, startSession, today, MAX_SESSION, getQueue, setS, fresh, lbEntry } = X;

  ck("Genus aller Nomen gültig (der/die/das)", Object.values(G).every(v => ["der", "die", "das"].includes(v)));
  ck("alle Satz-Pool-Wörter sind in G", [...new Set([...W, ...D, ...A].flatMap(x => x.pool))].every(w => w in G));
  ck("alle Mehrzahl-Wörter sind in G", Object.keys(P).every(w => w in G));
  ck("alle Stufe-7/8-Wörter sind in G", EXTRA.every(w => w in G));
  ck("8 Stufen vorhanden", STAGES.length === 8, "ist " + STAGES.length);
  ck("genug Karten (>1000)", ITEMS.length > 1000, "ist " + ITEMS.length);
  ck("lbEntry() läuft", (() => { try { const e = lbEntry(); return typeof e.pct === "number" && "sicher" in e; } catch (_) { return false; } })());

  let crash = 0, bad = 0;
  for (let r = 0; r < 3; r++) for (const it of ITEMS) { try { const d = cardData(it); if (!d.options || d.options.some(o => o == null || o === "" || /undefined/.test(o)) || !d.options.includes(d.correct)) bad++; } catch (e) { crash++; } }
  ck("keine Karte stürzt ab", crash === 0, crash + " Abstürze");
  ck("jede richtige Antwort ist unter den Optionen", bad === 0, bad + " fehlerhafte");

  function srs(numDue) {
    const S = fresh(); S.unlocked = 8; S.lastDay = null;
    const ids = ITEMS.slice(0, numDue).map((it, i) => { S.cards[it.id] = { box: 3, due: today() - (numDue - i), miss: i % 3, born: today() - 30 }; return it.id; });
    setS(S); startSession();
    const q = getQueue().map(it => it.id);
    const neu = q.filter(id => !ids.includes(id)).length;
    const top = ids.slice().sort((a, b) => S.cards[a].due - S.cards[b].due).slice(0, Math.min(numDue, MAX_SESSION));
    return { len: q.length, neu, overdueFirst: numDue <= MAX_SESSION ? q.filter(id => ids.includes(id)).length === numDue : top.every(id => q.includes(id)) };
  }
  const s1 = srs(5), s2 = srs(40);
  ck("ohne Stau: neue Wörter kommen dazu", s1.neu > 0 && s1.overdueFirst);
  ck("bei Stau: keine neuen, überfälligste zuerst", s2.neu === 0 && s2.overdueFirst && s2.len === MAX_SESSION);

  // ---- Teil 2: Cloud-Sync (mit aktivierter SYNC_URL + simulierter Datenbank) ----
  const FAKE = "http://fake/", cloud = {};
  const fetchImpl = (url, opts) => { if (opts && opts.method === "PUT") { cloud[url] = JSON.parse(opts.body); return Promise.resolve({}); } return Promise.resolve({ json: () => Promise.resolve(url in cloud ? cloud[url] : null) }); };
  const ctl = { confirm: false };
  const src2 = strip(baseSrc.replace('const SYNC_URL="";', 'const SYNC_URL="' + FAKE + '";')) + EXPORT;
  const Y = makeCtx(src2, fetchImpl, { confirm: () => ctl.confirm });
  const card = b => ({ box: b, due: 0, miss: 0, born: 0 });
  const flush = () => new Promise(r => setTimeout(r, 15));

  ck("nameKey: trim + klein", Y.nameKey("Kyana ") === "kyana");

  Y.setS(Object.assign(Y.fresh(), { playerName: "Kyana", cards: { a: card(3), b: card(3) }, ts: 1000 }));
  Y.cloudSave(); await flush();
  let loaded = null; Y.cloudLoad(o => loaded = o); await flush();
  ck("cloudSave/cloudLoad: Stand kommt heil zurück", loaded && Object.keys(loaded.cards).length === 2);

  Y.setS(Y.fresh());   // leeres iPad
  ck("leeres iPad adoptiert vollen Cloud-Stand", Y.adoptIfNewer({ cards: { a: {}, b: {}, c: {} }, ts: 1 }) === true && Object.keys(Y.getS().cards).length === 3);

  Y.setS(Object.assign(Y.fresh(), { playerName: "Kyana", cards: { a: {}, b: {}, c: {}, d: {} }, ts: 9000 }));   // voller, neuerer lokaler Stand
  ck("voller lokaler Stand wird NICHT von älterem Cloud überschrieben", Y.adoptIfNewer({ cards: { a: {} }, ts: 1 }) === false && Object.keys(Y.getS().cards).length === 4);

  cloud[FAKE + "lb.json"] = { kyana: { name: "Kyana" } };   // Name "Kyana" ist vergeben
  ctl.confirm = false; Y.setS(Y.fresh()); Y.tryJoin("Kyana"); await flush();
  ck("vergebener Name ohne Bestätigung -> abgelehnt", !Y.getS().playerName);
  Y.setS(Y.fresh()); Y.tryJoin("Lena"); await flush();
  ck("freier Name -> übernommen", Y.getS().playerName === "Lena");

  console.log(fails === 0 ? "\nOK - Alle Tests bestanden (" + ITEMS.length + " Karten, " + STAGES.length + " Stufen)." : "\nFEHLER - " + fails + " Test(s) fehlgeschlagen.");
  process.exit(fails === 0 ? 0 : 1);
})();
