# Legt eine neue Gruppe (Schueler) an: eigener Link, eigener Speicher, Anmeldung per Knopf "Ich bin ...".
# Aufruf (im Repo):  python3 src/neue_gruppe.py --name Marta --vorlage kyana [--ordner marta] [--zh] [--namen "Marta,Lena"]
#   --vorlage kyana       = wie Kyana (Bobby, Sammeltiere, 14 Themen, 35 Karten, Extrarunden)
#   --vorlage mia-olivia  = sachlich, 20 bis 30 Karten, alle Themen bis Relativsaetze
#   --zh                  = chinesische Bedeutungen und Saetze anzeigen (nur wenn die Schueler Chinesisch lesen)
#   --namen               = Namen fuer die Knoepfe (Standard: --name)
# Danach: src/BUILD hochzaehlen, python3 src/build.py, committen, pushen. Link: https://deutschmitmike.github.io/quizzes/<ordner>/
# Bericht, Backup und Lehrer-Uebersicht finden die neue Gruppe automatisch.
import argparse, json, os, re, shutil, sys
SRC = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(SRC)
ap = argparse.ArgumentParser()
ap.add_argument("--name", required=True); ap.add_argument("--vorlage", required=True, choices=["kyana", "mia-olivia"])
ap.add_argument("--ordner"); ap.add_argument("--zh", action="store_true"); ap.add_argument("--namen")
a = ap.parse_args()
slug = lambda t: re.sub(r"[^a-z0-9-]+", "-", t.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")).strip("-")
ordner = a.ordner or slug(a.name); kurz = ordner.replace("-", "_")
namen = [n.strip() for n in (a.namen or a.name).split(",") if n.strip()]
G = os.path.join(SRC, "groups")
if os.path.exists(os.path.join(G, ordner + ".js")) or os.path.exists(os.path.join(REPO, ordner)):
    sys.exit("FEHLER: Gruppe oder Ordner '%s' gibt es schon." % ordner)
# 1) Steckbrief kopieren und anpassen (Schluessel und Speicherpfade sind neu und eindeutig)
t = open(os.path.join(G, a.vorlage + ".js"), encoding="utf-8").read()
i = t.index("const GROUP=") + len("const GROUP="); j = t.index(";\n", i); cfg = json.loads(t[i:j])
cfg.update({"name": a.name, "folder": ordner, "key": kurz + "_v1", "teacherKey": kurz + "_lehrer_v1",
            "lbPath": "lb/__" + kurz, "savePath": "save/__" + kurz, "names": namen, "zh": bool(a.zh)})
rest = t[j:]
if a.vorlage == "kyana": rest = rest.replace("Kyana", namen[0])   # Beispielsaetze mit dem eigenen Namen
kopf = "// ===== Steckbrief: %s (angelegt mit neue_gruppe.py, Vorlage %s) =====\n" % (a.name, a.vorlage)
t = kopf + t[t.index("\n") + 1:i] + json.dumps(cfg, ensure_ascii=False, indent=1) + rest
open(os.path.join(G, ordner + ".js"), "w", encoding="utf-8").write(t)
# 2) Seitenhuellen: Titel anpassen
esc = a.name.replace("&", "&amp;")
for suf in ["", "_lehrer"]:
    h = open(os.path.join(G, a.vorlage + suf + ".html"), encoding="utf-8").read()
    h = re.sub(r"<title>[^<]*</title>", "<title>Deutsch - %s%s</title>" % (esc, " - LEHRER" if suf else ""), h, 1)
    h = re.sub(r'(<meta name="apple-mobile-web-app-title" content=")[^"]*', r"\g<1>" + esc, h, 1)
    open(os.path.join(G, ordner + suf + ".html"), "w", encoding="utf-8").write(h)
# 3) feste Dateien des App-Ordners (Symbole, Offline-Speicher, App-Name)
quelle = os.path.join(REPO, "der-die-das" if a.vorlage == "kyana" else "mia-olivia"); ziel = os.path.join(REPO, ordner); os.makedirs(ziel)
for f in ["icon-180.png", "icon-192.png", "icon-512.png", "sw.js"]: shutil.copy(os.path.join(quelle, f), ziel)
m = json.load(open(os.path.join(quelle, "manifest.json"), encoding="utf-8")); m["name"] = "Deutsch - " + a.name; m["short_name"] = a.name[:12]
json.dump(m, open(os.path.join(ziel, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False)
print("Neue Gruppe '%s' angelegt: src/groups/%s.js (+ .html, _lehrer.html), Ordner %s/, Speicher %s, Knoepfe: %s, Chinesisch: %s"
      % (a.name, ordner, ordner, cfg["savePath"], ", ".join("Ich bin " + n for n in namen), "ja" if a.zh else "nein"))
print("Link nach dem Hochladen: https://deutschmitmike.github.io/quizzes/%s/" % ordner)
