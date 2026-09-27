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
  "lbPickName:(typeof lbPickName==='function'?lbPickName:null),VERBS:(typeof VERBS!=='undefined'?VERBS:[]),wrongPart:(typeof wrongPart==='function'?wrongPart:null)," +
  "ZH_S:(typeof ZH_S!=='undefined'?ZH_S:{}),VBY,perfSents,pratSents,pratOpts,AUXF,capAt0,PBY,KBY,fullSent,nameSwap:(typeof nameSwap==='function'?nameSwap:null)}";
// alle festen Saetze, so wie die App sie als d.speak bildet (Schluessel fuer die chinesische Satzuebersetzung)
function allSentences(X) { const out = new Set();
  for (const it of X.ITEMS) {
    if (it.kind === "perf") { const v = X.VBY[it.word]; for (const s of X.perfSents(v)) out.add(s.t.replace("{A}", X.capAt0(s.t, X.AUXF[v.aux][s.p])).replace("{P}", v.part).trim()); }
    else if (it.kind === "prat") { const v = X.VBY[it.word]; for (const s of X.pratSents(v)) out.add(s.t.replace("{V}", X.capAt0(s.t, X.pratOpts(v, s.p)[0])).trim()); }
    else if (it.kind === "pres" || it.kind === "modal") { const v = X.PBY[it.kind + ":" + it.word]; for (const s of v.sents) out.add(s.t.replace("{V}", v.forms[s.p]).trim()); }
    else if (it.kind === "komp") { const k = X.KBY[it.word]; out.add((it.form === "K" ? k.tk : k.ts).replace(/\{[KS]\}/, it.form === "K" ? k.k : k.s).trim()); }
    else if (/^(nsatz|order|cloze)$/.test(it.kind)) out.add(X.cardData(it).speak.trim()); }
  return [...out]; }

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
    if (d.tiles) { const r = [d.tiles.fixed].concat(d.tiles.tiles).join(" ") + d.tiles.punct; if (r !== d.correct) fail(name, it.id + ": Satzbausteine ergeben nicht den richtigen Satz: " + r); }   // Kaertchen in richtiger Reihenfolge = Loesung
    if (d.typed) { const n = t => (t || "").toLowerCase().replace(/…|\.\.\./g, " ").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[.,!?]/g, " ").replace(/\s+/g, " ").trim();
      if (!d.typed.some(x => n(x) === n(d.correct))) fail(name, it.id + ": beim Tippen wird die richtige Loesung nicht akzeptiert (" + d.correct + " / " + d.typed.join(", ") + ")"); }   // sichere Karten: Eingabe der richtigen Loesung muss zaehlen
    if (!DET.test(it.kind)) break;
  }
  // 2) keine bisherige Karte darf verschwinden (Vergleich mit dem letzten Commit)
  try {
    const old = execSync("git show HEAD:" + name.split(path.sep).join("/"), { cwd: REPO, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64e6 }).toString();
    const O = load(old, "{ITEMS,cardData}").__X; const now = {}; X.ITEMS.forEach(it => now[it.id] = it);
    const ENT = fs.existsSync(path.join(__dirname, "entfernt.txt")) ? fs.readFileSync(path.join(__dirname, "entfernt.txt"), "utf8").split("\n").map(l => l.split("#")[0].trim()).filter(Boolean) : [];
    const weg = O.ITEMS.filter(it => !now[it.id]).map(it => it.id), missing = weg.filter(id => !ENT.some(pr => id.startsWith(pr)));   // entfernt.txt: absichtlich entfernte Karten (Praefix je Zeile)
    if (weg.length > missing.length) console.log("  " + name + ": " + (weg.length - missing.length) + " Karten absichtlich entfernt (entfernt.txt)");
    if (missing.length) fail(name, missing.length + " Karten verschwunden (Lernstand ginge verloren): " + missing.slice(0, 8).join(", "));
    const changed = O.ITEMS.filter(it => now[it.id] && DET.test(it.kind) && O.cardData(it).correct !== X.cardData(now[it.id]).correct).map(it => it.id);
    if (changed.length) warn(name, changed.length + " Karten mit geaenderter Loesung (gewollt?): " + changed.slice(0, 6).join(", "));
    const added = X.ITEMS.length - (O.ITEMS.length - weg.length);
    if (added) console.log("  " + name + ": " + added + " neue Karten");
    checks++;
  } catch (e) { warn(name, "kein Vergleich mit letztem Commit (" + (e.message || "").slice(0, 60) + ")"); }
  // 3) Verben: falsches Partizip darf nie das richtige sein
  if (X.wrongPart) X.VERBS.filter(v => !v.nf).forEach(v => { checks++; if (X.wrongPart(v) === v.part) fail(name, "Verb " + v.inf + ": falsches = richtiges Partizip"); });
  // 4) 30 Tage spielen: keine Fehler, Rundengroesse eingehalten, Extrarunden-Regel
  try {
    sb.run("S=fresh(); S.playerName='Test'; S.unlocked=CFG.allOpen||CFG.teacher?Math.max(...STAGES.map(x=>x.id)):1;");
    for (let d = 0; d < 30; d++) {
      sb.setDay(d); X.startDaily(); const n = X.queue().length, max = X.MAX(); let g = 0;
      if (n > max + 5) fail(name, "Tag " + (d + 1) + ": Runde " + n + " > max " + max);
      while (X.queue().length && X.current() && g++ < 900) { const c = X.current(); X.setPending({ d: X.cardData(c), it: c, right: Math.random() < 0.75 || !!X.missSess()[c.id] }); X.commitNext(); }
      if (!X.EXTRA_ROUNDS) { X.startDaily(); if (X.queue().length) fail(name, "Tag " + (d + 1) + ": Extrarunde moeglich, obwohl verboten"); }
      checks++;
    }
    if (X.CFG.startNur && !X.CFG.teacher) { const C = sb.run("S.cards"), t0 = X.today() - 29, T = X.CFG.startTage || 7, byId = {}; X.ITEMS.forEach(it => byId[it.id] = it);   // sanfter Start: erst nur startNur, danach Mix
      const frueh = Object.keys(C).filter(id => C[id].born - t0 < T && byId[id]), spaet = Object.keys(C).filter(id => C[id].born - t0 >= T && byId[id]);
      const falsch = frueh.filter(id => !X.CFG.startNur.includes(byId[id].stage)); if (falsch.length) fail(name, "sanfter Start: in den ersten " + T + " Tagen andere Themen: " + falsch.slice(0, 3).join(", "));
      if (!spaet.some(id => !X.CFG.startNur.includes(byId[id].stage))) fail(name, "sanfter Start: nach " + T + " Tagen kommt kein Mix"); checks++; }
  } catch (e) { fail(name, "30-Tage-Simulation: " + e.message); }
  // 5) abgebrochene Runde wird fortgesetzt (nur ohne Extrarunden)
  if (!X.EXTRA_ROUNDS && !X.CFG.teacher) try {
    sb.run("S=fresh(); S.playerName='Test';"); sb.setDay(40); X.startDaily();
    for (let i = 0; i < 3; i++) { const c = X.current(); X.setPending({ d: X.cardData(c), it: c, right: true }); X.commitNext(); }
    const rest = X.queue().map(q => q.id).join(); sb.run("queue=[]; show('home');"); X.startDaily();
    if (X.queue().map(q => q.id).join() !== rest) fail(name, "abgebrochene Runde wird nicht korrekt fortgesetzt"); checks++;
  } catch (e) { fail(name, "Fortsetzen: " + e.message); }
  // 6) Spielerwechsel auf einem Geraet haelt Staende getrennt
  if (X.CFG.names && X.CFG.names.length >= 2 && X.switchPlayer && !X.CFG.teacher) try {
    const [a, b] = X.CFG.names; sb.run("S=fresh();"); X.lbPickName(a); sb.run("S.points=11; save();"); X.switchPlayer();
    X.lbPickName(b); const pb = sb.run("S.points"); X.switchPlayer(); X.lbPickName(a); const pa = sb.run("S.points");
    if (pb !== 0 || pa !== 11) fail(name, "Spielerwechsel vermischt Staende (" + pa + "/" + pb + ")"); checks++;
  } catch (e) { fail(name, "Spielerwechsel: " + e.message); }
  // 9) Namenstausch je Spielerin (Mia sieht Olivia und umgekehrt): Loesung bleibt in den Antworten, Kaertchen ergeben die Loesung, Name wirklich getauscht
  if (X.CFG.nameSwap && X.nameSwap) try { for (const [p, q] of Object.entries(X.CFG.nameSwap)) { sb.run("S.playerName=" + JSON.stringify(p)); let n = 0;
      for (const it of X.ITEMS) { const d = X.nameSwap(X.cardData(it)); checks++; if (!d._sw) continue; n++;
        if (d.options && !d.options.includes(d.correct)) fail(name, it.id + " (" + p + "): Loesung nach Namenstausch nicht in den Antworten");
        if (d.tiles && [d.tiles.fixed].concat(d.tiles.tiles).join(" ") + d.tiles.punct !== d.correct) fail(name, it.id + " (" + p + "): Kaertchen passen nach Namenstausch nicht");
        if (new RegExp("\\b" + p + "(?=s?\\b)").test(d.prompt + d.correct)) fail(name, it.id + " (" + p + "): eigener Name noch sichtbar"); }
      if (!n) fail(name, "Namenstausch fuer " + p + " greift bei keiner Karte"); } sb.run("S.playerName='Test'"); }
  catch (e) { fail(name, "Namenstausch: " + e.message); }
  // 7) Saetze auf Chinesisch (nur Gruppen mit zh): jeder feste Satz uebersetzt, Typografie Taiwan (，。？！ statt , . ? !, keine Striche)
  if (X.CFG.zh) try {
    const Z = X.ZH_S, all = allSentences(X), miss = all.filter(t => !Z[t]);
    if (miss.length) warn(name, miss.length + " von " + all.length + " Saetzen ohne chinesische Uebersetzung, z. B.: " + miss.slice(0, 3).join(" / "));
    const bau = new Set(); for (const it of X.ITEMS) if (/^(case|pron|poss|poss3|pakk|adj)$/.test(it.kind)) for (let k = 0; k < 3; k++) bau.add(X.fullSent(X.cardData(it)));   // zusammengesetzte Saetze (Stichprobe)
    const bmiss = [...bau].filter(t => t && !Z[t]); if (bmiss.length) warn(name, bmiss.length + " zusammengesetzte Saetze (Stichprobe von " + bau.size + ") ohne chinesische Uebersetzung, z. B.: " + bmiss.slice(0, 3).join(" / "));
    const NAMEN = ["Mia", "Olivia", "Ben", "Lina", "Lea", "Leon", "Kyana", "Marta", "Weber", "Wagner"];   // westliche Namen nie uebersetzen (Mike); chinesische Namen (Chen, Wang, Lin) duerfen chinesisch sein
    for (const [de, zh] of Object.entries(Z)) for (const n of NAMEN) if (new RegExp("\\b" + n + "(?=s?\\b)").test(de) && !new RegExp("\\b" + n + "\\b").test(zh)) fail(name, "Name uebersetzt statt lateinisch: " + de + " -> " + zh);
    for (const [de, zh] of Object.entries(Z)) { checks++;
      if (!/[\u4e00-\u9fff]/.test(zh) || /[,\-\u2013\u2014<>|.?!:;]/.test(zh)) fail(name, "chinesischer Satz mit falschen Zeichen: " + de + " -> " + zh); }
  } catch (e) { fail(name, "Satzuebersetzung: " + e.message); }
  console.log((fails ? "  " : "  ok ") + name + ": " + X.ITEMS.length + " Karten, " + checks + " Pruefungen");
}
console.log(fails ? "TESTS FEHLGESCHLAGEN: " + fails + " Fehler" + (warns ? ", " + warns + " Hinweise" : "") : "Alle Tests bestanden" + (warns ? " (" + warns + " Hinweise)" : "") + ".");
process.exit(fails ? 1 : 0);
