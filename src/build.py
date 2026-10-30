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
engine = re.sub(r"%%DATA:((?!zh_|en_)\w+)%%", _data, engine)   # zh_*/en_* erst je Gruppe (unten)
meta = []
built = []
WEG = [l.split("#")[0].strip() for l in open(os.path.join(SRC, "tests", "entfernt.txt"), encoding="utf-8").read().split("\n")] if os.path.exists(os.path.join(SRC, "tests", "entfernt.txt")) else []
WEG = [w for w in WEG if w]   # entfernte Themen: Lehrer-Uebersicht zaehlt sie nicht ("[ordner] id" = nur diese App)
def weg_fuer(ordner): return [re.sub(r"^\[[^\]]+\]\s*", "", w) for w in WEG if not w.startswith("[") or w.startswith("[" + ordner + "]")]
# Fachwortschatz einer Gruppe (Steckbrief "fach": "<datei>" -> src/data/<datei>.txt, Platzhalter %%FACH%% im Kern; Jason, 2026-10-25)
def fach_daten(cfg, g):
    name = cfg.get("fach")
    if not name: return ""
    # "fachPfad": Datei ausserhalb des oeffentlichen Repos (Jason: Folieninhalte, nur in ~/Unterricht); sonst src/data/<fach>.txt
    f = os.path.expanduser(cfg["fachPfad"]) if cfg.get("fachPfad") else os.path.join(SRC, "data", name + ".txt")
    if not os.path.exists(f): sys.exit("FEHLER: %s fehlt (Gruppe %s). BUILD NICHT VEROEFFENTLICHEN." % (f, g))
    if cfg.get("fachPfad") and not cfg.get("passwort"): sys.exit("FEHLER: private Daten (fachPfad) nur auf Seiten mit Passwort (Gruppe %s)." % g)
    t = open(f, encoding="utf-8").read().strip()
    if "`" in t or "${" in t: sys.exit("FEHLER: verbotenes Zeichen (` oder ${) in src/data/%s.txt" % name)
    ids, th = set(), None
    for n, l in enumerate(t.split("\n"), 1):
        l = l.strip()
        if not l or (l.startswith("#") and not l.startswith("##")): continue
        if l.startswith("##"): th = l; continue
        f6 = [x.strip() for x in l.split("|")]
        if len(f6) != 6 or not th: sys.exit("FEHLER: src/data/%s.txt Zeile %d: genau 6 Felder unter einer ## Themenzeile noetig: %s" % (name, n, l))
        if f6[0] != "ABK" and f6[0] not in ("der", "die", "das"): sys.exit("FEHLER: src/data/%s.txt Zeile %d: Artikel %s" % (name, n, f6[0]))
        if re.search(r"[.$#\[\]/]", f6[1]): sys.exit("FEHLER: src/data/%s.txt Zeile %d: Zeichen . $ # [ ] / im Wort (Firebase-Schluessel): %s" % (name, n, f6[1]))
        if re.search(r"[,\-\u2013\u2014<>|.?!:;()]", f6[3]) or not re.search(r"[\u4e00-\u9fff]", f6[3]): sys.exit("FEHLER: src/data/%s.txt Zeile %d: Chinesisch mit falschen Zeichen: %s" % (name, n, f6[3]))
        cid = ("ab:" if f6[0] == "ABK" else "b:") + f6[1]
        if cid in ids: sys.exit("FEHLER: src/data/%s.txt Zeile %d: %s doppelt" % (name, n, f6[1]))
        ids.add(cid)
    alt = subprocess.run(["git", "show", "HEAD:./" + os.path.basename(f)], cwd=os.path.dirname(f), capture_output=True, text=True)
    if alt.returncode == 0:   # kein Wort darf verschwinden (Karten-IDs = Lernstand); absichtlich entfernt nur mit "[ordner] b:Wort$" in entfernt.txt
        weg = weg_fuer(cfg["folder"])
        altids = {("ab:" if x.split("|")[0].strip() == "ABK" else "b:") + x.split("|")[1].strip() for x in alt.stdout.split("\n") if x.count("|") == 5 and not x.startswith("#")}
        fehlt = [i for i in altids - ids if not any((w.endswith("$") and i == w[:-1]) or (not w.endswith("$") and i.startswith(w)) for w in weg)]
        if fehlt: sys.exit("FEHLER: Woerter aus src/data/%s.txt verschwunden (Lernstand ginge verloren): %s. BUILD NICHT VEROEFFENTLICHEN." % (name, ", ".join(sorted(fehlt)[:8])))
    return t
# Seiten mit Passwort (Steckbrief "passwort": true, z. B. Jason): nach den Tests mit StatiCrypt verschluesseln, auch wenn die Tests scheitern.
# Passwort liegt ausserhalb aller Repos: ~/Desktop/claude cowork/passwoerter/<ordner>.txt; StatiCrypt in ~/Unterricht/tools/node_modules.
# Fehlt etwas, bricht der Build ab, damit nie eine unverschluesselte Seite veroeffentlicht wird.
geschuetzt = []
def verschluesseln():
    if not geschuetzt: return
    sc = os.path.expanduser("~/Unterricht/tools/node_modules/.bin/staticrypt")
    if not os.path.exists(sc): sys.exit("FEHLER: StatiCrypt fehlt (cd ~/Unterricht/tools && npm install --no-save staticrypt@3.5.4). BUILD NICHT VEROEFFENTLICHEN.")
    for page, cfg in geschuetzt:
        pf = os.path.expanduser("~/Desktop/claude cowork/passwoerter/%s.txt" % cfg["folder"])
        if not os.path.exists(pf): sys.exit("FEHLER: Passwortdatei %s fehlt. BUILD NICHT VEROEFFENTLICHEN." % pf)
        if not re.fullmatch(r"[0-9a-f]{32}", cfg.get("passwortSalt", "")): sys.exit("FEHLER: passwortSalt im Steckbrief %s fehlt." % cfg["folder"])
        env = dict(os.environ, STATICRYPT_PASSWORD=open(pf, encoding="utf-8").read().strip())
        full = os.path.join(REPO, page)
        r = subprocess.run([sc, full, "-d", os.path.dirname(full), "-c", "false", "--short", "--salt", cfg["passwortSalt"], "--remember", "60",
            "--template-title", "Deutsch - " + cfg["name"], "--template-instructions", "請輸入密碼 · Passwort eingeben", "--template-placeholder", "Passwort",
            "--template-button", "Öffnen", "--template-remember", "記住我 · Angemeldet bleiben", "--template-error", "密碼錯誤 · Falsches Passwort",
            "--template-color-primary", "#EA5206", "--template-color-secondary", "#F2884B"], cwd=REPO, env=env, capture_output=True, text=True)
        txt = open(full, encoding="utf-8").read()
        if r.returncode != 0 or "staticrypt" not in txt.lower() or "const CFG=" in txt:
            sys.exit("FEHLER: Verschluesseln von %s fehlgeschlagen: %s BUILD NICHT VEROEFFENTLICHEN." % (page, (r.stderr or r.stdout)[-300:]))
        print("%s verschluesselt" % page)
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
        eng_g = re.sub(r"%%DATA:(en_\w+)%%", lambda m: _data(m) if cfg.get("en") else "", eng_g)   # englische Bedeutungen nur fuer Gruppen mit "en" (Elinor)
        eng_g = eng_g.replace("%%FACH%%", fach_daten(cfg, g))
        script = gjs + "\nconst CFG=Object.assign({},GROUP,{teacher:%s, build:%s});\n" % ("true" if teacher else "false", json.dumps(build)) + eng_g
        open(os.path.join(out, page), "w", encoding="utf-8").write(shell.replace("%%SCRIPT%%", script))
        built.append(os.path.join(cfg["folder"], page))
        if cfg.get("passwort"): geschuetzt.append((os.path.join(cfg["folder"], page), cfg))
    open(os.path.join(out, "version.json"), "w").write('{"build":"%s"}\n' % build)
    stages = [[int(i), n] for i, n in re.findall(r'\{id:(\d+),name:"([^"]+)"', gjs)]
    meta.append({"id": g, "name": cfg["name"], "folder": cfg["folder"], "lbPath": cfg["lbPath"], "savePath": cfg["savePath"],
                 "focusOpts": cfg.get("focusOpts") or [x for x in stages if x[0] > 1], "weg": weg_fuer(cfg["folder"]), "chat": cfg.get("chat")})
    print("%-12s -> %s/ (Build %s)" % (g, cfg["folder"], build))
# gemeinsame Lehrer-Uebersicht fuer alle Gruppen
os.makedirs(os.path.join(REPO, "lehrer"), exist_ok=True)
tpl = open(os.path.join(SRC, "lehrer.html"), encoding="utf-8").read()
open(os.path.join(REPO, "lehrer", "index.html"), "w", encoding="utf-8").write(tpl.replace("%%META%%", json.dumps(meta, ensure_ascii=False)))
print("Lehrer-Uebersicht -> lehrer/ (%d Gruppen)" % len(meta))

# automatische Tests (src/tests/run_all.js): bricht bei Fehlern ab -> dann NICHT committen/veroeffentlichen
if "--no-tests" not in sys.argv:
    print("Tests laufen ...", flush=True)
    r = subprocess.run(["node", os.path.join(SRC, "tests", "run_all.js")] + built, cwd=REPO)
    if r.returncode != 0:
        verschluesseln()
        sys.exit("\nBUILD NICHT VEROEFFENTLICHEN: Tests fehlgeschlagen (Details oben).")
verschluesseln()
