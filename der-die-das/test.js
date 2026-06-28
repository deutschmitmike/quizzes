// Automatische Prüfung des Spiels — vor jedem Commit ausführen:  node test.js
// Prüft: Genus gültig, alle Satz-/Listen-Wörter vorhanden, keine Karte stürzt ab,
//        Stufen-/Kartenzahlen plausibel, SRS sortiert überfällige zuerst & drosselt neue.
const fs = require("fs"), vm = require("vm");
let fails = 0;
const ck = (name, cond, extra) => { console.log((cond ? "  ok  " : "FAIL  ") + name + (cond ? "" : "  " + (extra || ""))); if (!cond) fails++; };

const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const mm = html.match(/<script>\s*"use strict";([\s\S]*?)<\/script>/);
if (!mm) { console.log("FAIL  <script> nicht gefunden"); process.exit(1); }
let src = '"use strict";' + mm[1];
src = src.replace(/renderHome\(\);\s*cloudSync\(\);[^\n]*$/, "").replace(/renderHome\(\);\s*$/, "");
src += "\n;globalThis.__x={G,P,W,D,A,ITEMS,EXTRA,STAGES,cardData,startSession,today,MAX_SESSION,getQueue:()=>queue,getS:()=>S,setS:x=>{S=x;},fresh,lbEntry};";

const el = () => new Proxy({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, innerHTML: "", value: "", appendChild() {}, querySelectorAll: () => [], addEventListener() {}, getAttribute: () => "", setAttribute() {}, focus() {} }, { get(t, p) { return (p in t) ? t[p] : ((...a) => el()); }, set(t, p, v) { t[p] = v; return true; } });
const store = {};
const ctx = { console: { log() {} }, Math, JSON, Date, Object, Array, Set, Promise, fetch: () => Promise.resolve({ json: () => Promise.resolve(null) }), document: { getElementById: () => el(), createElement: () => el(), querySelector: () => el(), querySelectorAll: () => [] }, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => store[k] = v }, navigator: {}, speechSynthesis: null, setTimeout: () => 0, clearTimeout: () => 0 };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
try { vm.runInContext(src, ctx); } catch (e) { console.log("FAIL  Skript-Laufzeitfehler: " + e.message); process.exit(1); }
const X = ctx.__x;
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

// SRS: überfälligste zuerst + neue bei Stau drosseln
function srs(numDue) {
  const S = fresh(); S.unlocked = 8; S.lastDay = null;
  const ids = ITEMS.slice(0, numDue).map((it, i) => { S.cards[it.id] = { box: 3, due: today() - (numDue - i), miss: i % 3, born: today() - 30 }; return it.id; });
  setS(S); startSession();
  const q = getQueue().map(it => it.id);
  const neu = q.filter(id => !ids.includes(id)).length;
  const top = ids.slice().sort((a, b) => S.cards[a].due - S.cards[b].due).slice(0, Math.min(numDue, MAX_SESSION));
  const overdueFirst = numDue <= MAX_SESSION ? q.filter(id => ids.includes(id)).length === numDue : top.every(id => q.includes(id));
  return { len: q.length, neu, overdueFirst };
}
const s1 = srs(5), s2 = srs(40);
ck("ohne Stau: neue Wörter kommen dazu", s1.neu > 0 && s1.overdueFirst);
ck("bei Stau: keine neuen, überfälligste zuerst", s2.neu === 0 && s2.overdueFirst && s2.len === MAX_SESSION);

console.log(fails === 0 ? "\nOK - Alle Tests bestanden (" + ITEMS.length + " Karten, " + STAGES.length + " Stufen)." : "\nFEHLER - " + fails + " Test(s) fehlgeschlagen.");
process.exit(fails === 0 ? 0 : 1);
