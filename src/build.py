# Baut alle Deutsch-Spiele aus EINEM Kern (engine.js) + Steckbrief je Gruppe (groups/<g>.js + Seitenhuellen groups/<g>.html, <g>_lehrer.html).
# Aufruf (im Repo): python3 src/build.py     -> schreibt <ordner>/index.html, index_lehrer.html, version.json fuer jede Gruppe.
# Build-Nummer: src/BUILD (eine Nummer fuer alle Gruppen; bei JEDEM Deploy hochzaehlen).
import os, json, sys, re
SRC = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(SRC)
GROUPS = ["kyana", "mia-olivia"]            # neue Gruppe: groups/<name>.js + .html + _lehrer.html anlegen und hier eintragen
build = open(os.path.join(SRC, "BUILD"), encoding="utf-8").read().strip()
engine = open(os.path.join(SRC, "engine.js"), encoding="utf-8").read()
meta = []
for g in GROUPS:
    gjs = open(os.path.join(SRC, "groups", g + ".js"), encoding="utf-8").read()
    cfg = json.loads(gjs.split("const GROUP=", 1)[1].split(";\n", 1)[0])
    out = os.path.join(REPO, cfg["folder"]); os.makedirs(out, exist_ok=True)
    for teacher, shell_name, page in ((False, g + ".html", "index.html"), (True, g + "_lehrer.html", "index_lehrer.html")):
        shell = open(os.path.join(SRC, "groups", shell_name), encoding="utf-8").read()
        if shell.count("%%SCRIPT%%") != 1: sys.exit("FEHLER: Platzhalter in " + shell_name)
        script = gjs + "\nconst CFG=Object.assign({},GROUP,{teacher:%s, build:%s});\n" % ("true" if teacher else "false", json.dumps(build)) + engine
        open(os.path.join(out, page), "w", encoding="utf-8").write(shell.replace("%%SCRIPT%%", script))
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
