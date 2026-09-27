// Effektivitaets-Simulation: ein Jahr mit einem Lerner, der wirklich vergisst (Halbwertszeit-Modell, unabhaengig vom App-Verfahren).
// Misst, wie viele Karten nach 365 Tagen tatsaechlich gewusst werden. Zum Vergleichen von Einstellungen (Rundengroesse, Verfahren ...).
// Aufruf: node src/tests/sim_effekt.js mia-olivia/index.html [Tage]     (Lerner ~75 % Treffer, aehnlich echten Kindern)
// Varianten testen: Datei kopieren, Einstellung in der Kopie aendern, beide simulieren und vergleichen.
const { load } = require("./harness");
const file = process.argv[2] || "mia-olivia/index.html", DAYS = +(process.argv[3] || 365);
const sb = load(file, "{startDaily,commitNext,cardData,today,queue:()=>queue,current:()=>current,missSess:()=>missSess,setPending:p=>{pending=p},setAnswer:(a,b)=>{shownAt=a;answeredAt=b}}");
const X = sb.__X; sb.run("S=fresh(); S.playerName='Sim'; S.unlocked=(CFG.allOpen?Math.max(...STAGES.map(x=>x.id)):1);");
let q = 12345; const R = () => { q = (q * 16807) % 2147483647; return q / 2147483647; };
const M = {}, model = id => M[id] || (M[id] = { h: 3 * Math.exp((R() - 0.5) * 1.4), last: null, df: Math.exp((R() - 0.5) * 1.0) });
const P = (c, t) => c.last == null ? 0.45 : Math.pow(2, -(t - c.last) / c.h);
let answers = 0, fN = 0, fOk = 0, tEnd = 0;
for (let d = 0; d < DAYS; d++) {
  sb.setDay(d); const t = X.today(); X.startDaily(); let g = 0;
  while (X.queue().length && X.current() && g++ < 900) {
    const it = X.current(), c = model(it.id), p = P(c, t), first = !X.missSess()[it.id], ok = R() < p || !first;
    if (first) { fN++; if (ok) fOk++; }
    X.setAnswer(0, p > 0.9 ? 2000 : p > 0.7 ? 4500 : 9000); X.setPending({ d: X.cardData(it), it, right: ok }); answers++;
    if (first) { if (ok) c.h = Math.max(c.h, c.h * (1 + 3 * (1 - p) / c.df + 0.6)); else c.h = Math.max(0.5, c.h * 0.45); c.last = t; }
    else { c.h = Math.max(c.h, 0.8); c.last = t; }
    X.commitNext();
  }
  tEnd = t;
}
let known = 0; for (const id in M) { const c = M[id]; if (c.last != null) known += Math.pow(2, -(tEnd - c.last) / c.h); }
console.log(file + ": " + DAYS + " Tage | gesehen " + Object.keys(M).length + " | wirklich gewusst am Ende " + Math.round(known) +
  " | Antworten " + answers + " | gewusst pro 100 Antworten " + (100 * known / answers).toFixed(1) + " | Treffer 1. Versuch " + Math.round(100 * fOk / fN) + " %");
