// Automatische Tests fuer alle gebauten Seiten. Aufruf: node src/tests/run_all.js <seite.html> [...]
// Wird von src/build.py nach jedem Bauen aufgerufen. Exit-Code 1 = etwas ist kaputt -> NICHT veroeffentlichen.
const fs = require("fs"), path = require("path"), { execSync } = require("child_process");
const { load } = require("./harness");
const REPO = path.resolve(__dirname, "..", "..");
const EMO = /\p{Extended_Pictographic}/u;
const DET = /^(genus|plural|case|pron|poss|poss3|pakk|adj|nsatz|komp|order|cloze)$/;   // Karten mit fester richtiger Loesung
let fails = 0, warns = 0;
const fail = (f, m) => { fails++; console.log("  FEHLER " + f + ": " + m); };
const warn = (f, m) => { warns++; console.log("  Hinweis " + f + ": " + m); };
const EXP = "{ITEMS,byId,cardData,label,STAGES,S:()=>S,setS:x=>{S=x},fresh,KEY,EXTRA_ROUNDS,CFG,MAX:()=>MAX_SESSION,startDaily,startSession,commitNext,today," +
  "queue:()=>queue,current:()=>current,missSess:()=>missSess,setPending:p=>{pending=p},show,switchPlayer:(typeof switchPlayer==='function'?switchPlayer:null)," +
  "lbPickName:(typeof lbPickName==='function'?lbPickName:null),VERBS:(typeof VERBS!=='undefined'?VERBS:[]),wrongPart:(typeof wrongPart==='function'?wrongPart:null)}";

for (const rel of process.argv.slice(2)) {
  const file = path.resolve(REPO, rel), name = path.relative(REPO, file);
  let sb, X; try { sb = load(file, EXP); X = sb.__X; } catch (e) { fail(name, "laedt nicht: " + e.message); continue; }
  let checks = 0;
  // 1) jede Karte mehrfach rendern
  for (const it of X.ITEMS) for (let k = 0; k < 3; k++) {
    let d; try { d = X.cardData(it); } catch (e) { fail(name, it.id + " wirft " + e.message); break; }
    checks++;
    const txt = [d.prompt, d.explain, (d.options || []).join("|"), d.correct].join(" ");
    if (!d.options || !d.options.includes(d.correct)) fail(name, it.id + ": richtige Loesung fehlt in den Optionen");
    if (d.options && new Set(d.options).size !== d.options.length) fail(name, it.id + ": doppelte Optionen " + d.options.join("/"));
    if (/undefined|NaN|\[object/.test(txt)) fail(name, it.id + ": kaputter Text: " + txt.slice(0, 120));
    if (EMO.test(txt)) fail(name, it.id + ": Emoji auf der Karte");
    if (d.fills) { const nb = (d.prompt.match(/class="blank"/g) || []).length; if (d.fills.length !== nb) fail(name, it.id + ": Luecken " + nb + " / Fuellungen " + d.fills.length); }
    if (!DET.test(it.kind)) break;
  }
  // 2) keine bisherige Karte darf verschwinden (Vergleich mit dem letzten Commit)
  try {
    const old = execSync("git show HEAD:" + name.split(path.sep).join("/"), { cwd: REPO, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64e6 }).toString();
    const O = load(old, "{ITEMS,cardData}").__X; const now = {}; X.ITEMS.forEach(it => now[it.id] = it);
    const missing = O.ITEMS.filter(it => !now[it.id]).map(it => it.id);
    if (missing.length) fail(name, missing.length + " Karten verschwunden (Lernstand ginge verloren): " + missing.slice(0, 8).join(", "));
    const changed = O.ITEMS.filter(it => now[it.id] && DET.test(it.kind) && O.cardData(it).correct !== X.cardData(now[it.id]).correct).map(it => it.id);
    if (changed.length) warn(name, changed.length + " Karten mit geaenderter Loesung (gewollt?): " + changed.slice(0, 6).join(", "));
    const added = X.ITEMS.length - (O.ITEMS.length - missing.length);
    if (added) console.log("  " + name + ": " + added + " neue Karten");
    checks++;
  } catch (e) { warn(name, "kein Vergleich mit letztem Commit (" + (e.message || "").slice(0, 60) + ")"); }
  // 3) Verben: falsches Partizip darf nie das richtige sein
  if (X.wrongPart) X.VERBS.filter(v => !v.nf).forEach(v => { checks++; if (X.wrongPart(v) === v.part) fail(name, "Verb " + v.inf + ": falsches = richtiges Partizip"); });
  // 4) 30 Tage spielen: keine Fehler, Rundengroesse eingehalten, Extrarunden-Regel
  try {
    sb.run("S=fresh(); S.playerName='Test'; S.unlocked=CFG.allOpen||CFG.teacher?STAGES.length:1;");
    for (let d = 0; d < 30; d++) {
      sb.setDay(d); X.startDaily(); const n = X.queue().length, max = X.MAX(); let g = 0;
      if (n > max + 5) fail(name, "Tag " + (d + 1) + ": Runde " + n + " > max " + max);
      while (X.queue().length && X.current() && g++ < 900) { const c = X.current(); X.setPending({ d: X.cardData(c), it: c, right: Math.random() < 0.75 || !!X.missSess()[c.id] }); X.commitNext(); }
      if (!X.EXTRA_ROUNDS) { X.startDaily(); if (X.queue().length) fail(name, "Tag " + (d + 1) + ": Extrarunde moeglich, obwohl verboten"); }
      checks++;
    }
  } catch (e) { fail(name, "30-Tage-Simulation: " + e.message); }
  // 5) abgebrochene Runde wird fortgesetzt (nur ohne Extrarunden)
  if (!X.EXTRA_ROUNDS && !X.CFG.teacher) try {
    sb.run("S=fresh(); S.playerName='Test';"); sb.setDay(40); X.startDaily();
    for (let i = 0; i < 3; i++) { const c = X.current(); X.setPending({ d: X.cardData(c), it: c, right: true }); X.commitNext(); }
    const rest = X.queue().map(q => q.id).join(); sb.run("queue=[]; show('home');"); X.startDaily();
    if (X.queue().map(q => q.id).join() !== rest) fail(name, "abgebrochene Runde wird nicht korrekt fortgesetzt"); checks++;
  } catch (e) { fail(name, "Fortsetzen: " + e.message); }
  // 6) Spielerwechsel auf einem Geraet haelt Staende getrennt
  if (X.CFG.names && X.switchPlayer && !X.CFG.teacher) try {
    const [a, b] = X.CFG.names; sb.run("S=fresh();"); X.lbPickName(a); sb.run("S.points=11; save();"); X.switchPlayer();
    X.lbPickName(b); const pb = sb.run("S.points"); X.switchPlayer(); X.lbPickName(a); const pa = sb.run("S.points");
    if (pb !== 0 || pa !== 11) fail(name, "Spielerwechsel vermischt Staende (" + pa + "/" + pb + ")"); checks++;
  } catch (e) { fail(name, "Spielerwechsel: " + e.message); }
  console.log((fails ? "  " : "  ok ") + name + ": " + X.ITEMS.length + " Karten, " + checks + " Pruefungen");
}
console.log(fails ? "TESTS FEHLGESCHLAGEN: " + fails + " Fehler" + (warns ? ", " + warns + " Hinweise" : "") : "Alle Tests bestanden" + (warns ? " (" + warns + " Hinweise)" : "") + ".");
process.exit(fails ? 1 : 0);
