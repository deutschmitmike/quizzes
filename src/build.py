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
                 "focusOpts": cfg.get("focusOpts") or [x for x in stages if x[0] > 1]})
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
