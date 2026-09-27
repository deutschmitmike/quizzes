# Baut alle Deutsch-Spiele aus EINEM Kern (engine.js) + Steckbrief je Gruppe (groups/<g>.js + Seitenhuellen groups/<g>.html, <g>_lehrer.html).
# Aufruf (im Repo): python3 src/build.py     -> schreibt <ordner>/index.html, index_lehrer.html, version.json fuer jede Gruppe.
# Build-Nummer: src/BUILD (eine Nummer fuer alle Gruppen; bei JEDEM Deploy hochzaehlen).
import os, json, sys, re, subprocess
SRC = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(SRC)
GROUPS = sorted(f[:-3] for f in os.listdir(os.path.join(SRC, "groups")) if f.endswith(".js"))   # jede groups/<name>.js ist eine Gruppe (neu anlegen: python3 src/neue_gruppe.py)
build = open(os.path.join(SRC, "BUILD"), encoding="utf-8").read().strip()
engine = open(os.path.join(SRC, "engine.js"), encoding="utf-8").read()
# Uebungsdaten aus src/data/<name>.txt einsetzen (Platzhalter %%DATA:name%% im Kern)
def _data(m, zh=True):
    if m.group(1).startswith("zh_") and not zh: return ""   # chinesische Daten nur fuer Gruppen, die Chinesisch lesen (Steckbrief "zh")
    f = os.path.join(SRC, "data", m.group(1) + ".txt")
    if not os.path.exists(f): print("  Hinweis: src/data/%s.txt fehlt (Stufe bleibt leer)" % m.group(1)); return ""
    t = open(f, encoding="utf-8").read().strip()
    if "`" in t or "${" in t: sys.exit("FEHLER: verbotenes Zeichen (` oder ${) in src/data/%s.txt" % m.group(1))
    return t
engine = re.sub(r"%%DATA:((?!zh_)\w+)%%", _data, engine)   # zh_* erst je Gruppe (unten)
meta = []
built = []
WEG = [l.split("#")[0].strip() for l in open(os.path.join(SRC, "tests", "entfernt.txt"), encoding="utf-8").read().split("\n")] if os.path.exists(os.path.join(SRC, "tests", "entfernt.txt")) else []
WEG = [w for w in WEG if w]   # entfernte Themen: Lehrer-Uebersicht zaehlt sie nicht
# Speicher-Schluessel, Firebase-Pfade und Ordner: je Gruppe eindeutig und nie geaendert (sonst geht Lernstand verloren)
FEST = ["key", "teacherKey", "lbPath", "savePath", "folder"]
cfgs = {g: json.loads(open(os.path.join(SRC, "groups", g + ".js"), encoding="utf-8").read().split("const GROUP=", 1)[1].split(";\n", 1)[0]) for g in GROUPS}
seen = {}
for g, c in cfgs.items():
    for k in FEST:
        v = ("key", c[k]) if k in ("key", "teacherKey") else (k, c[k])
        if v in seen: sys.exit("FEHLER: %s '%s' in %s und %s doppelt. BUILD NICHT VEROEFFENTLICHEN." % (k, c[k], seen[v], g))
        seen[v] = g
    try:
        alt = subprocess.run(["git", "show", "HEAD:src/groups/%s.js" % g], cwd=REPO, capture_output=True, text=True)
        if alt.returncode == 0:
            a = json.loads(alt.stdout.split("const GROUP=", 1)[1].split(";\n", 1)[0])
            for k in FEST:
                if a.get(k) != c.get(k): sys.exit("FEHLER: %s der Gruppe %s geaendert (%s -> %s). Lernstaende gingen verloren. BUILD NICHT VEROEFFENTLICHEN." % (k, g, a.get(k), c.get(k)))
    except (IndexError, ValueError): pass
for g in GROUPS:
    gjs = open(os.path.join(SRC, "groups", g + ".js"), encoding="utf-8").read()
    cfg = json.loads(gjs.split("const GROUP=", 1)[1].split(";\n", 1)[0])
    out = os.path.join(REPO, cfg["folder"]); os.makedirs(out, exist_ok=True)
    for teacher, shell_name, page in ((False, g + ".html", "index.html"), (True, g + "_lehrer.html", "index_lehrer.html")):
        shell = open(os.path.join(SRC, "groups", shell_name), encoding="utf-8").read()
        if shell.count("%%SCRIPT%%") != 1: sys.exit("FEHLER: Platzhalter in " + shell_name)
        eng_g = re.sub(r"%%DATA:(zh_\w+)%%", lambda m: _data(m, bool(cfg.get("zh"))), engine)
        script = gjs + "\nconst CFG=Object.assign({},GROUP,{teacher:%s, build:%s});\n" % ("true" if teacher else "false", json.dumps(build)) + eng_g
        open(os.path.join(out, page), "w", encoding="utf-8").write(shell.replace("%%SCRIPT%%", script))
        built.append(os.path.join(cfg["folder"], page))
    open(os.path.join(out, "version.json"), "w").write('{"build":"%s"}\n' % build)
    stages = [[int(i), n] for i, n in re.findall(r'\{id:(\d+),name:"([^"]+)"', gjs)]
    meta.append({"id": g, "name": cfg["name"], "folder": cfg["folder"], "lbPath": cfg["lbPath"], "savePath": cfg["savePath"],
                 "focusOpts": cfg.get("focusOpts") or [x for x in stages if x[0] > 1], "weg": WEG})
    print("%-12s -> %s/ (Build %s)" % (g, cfg["folder"], build))
# gemeinsame Lehrer-Uebersicht fuer alle Gruppen
os.makedirs(os.path.join(REPO, "lehrer"), exist_ok=True)
tpl = open(os.path.join(SRC, "lehrer.html"), encoding="utf-8").read()
open(os.path.join(REPO, "lehrer", "index.html"), "w", encoding="utf-8").write(tpl.replace("%%META%%", json.dumps(meta, ensure_ascii=False)))
print("Lehrer-Uebersicht -> lehrer/ (%d Gruppen)" % len(meta))

# automatische Tests (src/tests/run_all.js): bricht bei Fehlern ab -> dann NICHT committen/veroeffentlichen
if "--no-tests" not in sys.argv:
    print("Tests laufen ...")
    r = subprocess.run(["node", os.path.join(SRC, "tests", "run_all.js")] + built, cwd=REPO)
    if r.returncode != 0:
        sys.exit("\nBUILD NICHT VEROEFFENTLICHEN: Tests fehlgeschlagen (Details oben).")
