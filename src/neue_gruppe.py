# Legt eine neue Gruppe (Schueler) an: eigener Link, eigener Speicher, Anmeldung per Knopf "Ich bin ...".
# Aufruf (im Repo):  python3 src/neue_gruppe.py --name Marta --vorlage kyana [--ordner marta] [--zh] [--namen "Marta,Lena"]
#   --vorlage kyana       = wie Kyana (Bobby, Sammeltiere, 14 Themen, 35 Karten, Extrarunden)
#   --vorlage mia-olivia  = sachlich, 25 bis 30 Karten, alle Themen bis Relativsaetze
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
if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", ordner):
    sys.exit("FEHLER: --ordner nur mit a-z, 0-9 und - (z. B. 'lena-tom').")
if not namen: sys.exit("FEHLER: kein Name angegeben.")
if os.path.exists(os.path.join(G, ordner + ".js")) or os.path.exists(os.path.join(REPO, ordner)):
    sys.exit("FEHLER: Gruppe oder Ordner '%s' gibt es schon." % ordner)
# Speicher-Schluessel und Firebase-Pfade duerfen keiner anderen Gruppe gehoeren (sonst mischen sich Lernstaende)
neu = {"key": kurz + "_v1", "teacherKey": kurz + "_lehrer_v1", "lbPath": "lb/__" + kurz, "savePath": "save/__" + kurz, "folder": ordner}
for f in sorted(os.listdir(G)):
    if not f.endswith(".js"): continue
    tt = open(os.path.join(G, f), encoding="utf-8").read(); ii = tt.index("const GROUP=") + len("const GROUP=")
    c = json.loads(tt[ii:tt.index(";\n", ii)])
    for k, v in neu.items():
        if c.get(k) == v or (k == "key" and c.get("teacherKey") == v) or (k == "teacherKey" and c.get("key") == v):
            sys.exit("FEHLER: %s '%s' gehoert schon der Gruppe %s. Anderen --ordner waehlen." % (k, v, f))
# 1) Steckbrief kopieren und anpassen (Schluessel und Speicherpfade sind neu und eindeutig)
t = open(os.path.join(G, a.vorlage + ".js"), encoding="utf-8").read()
i = t.index("const GROUP=") + len("const GROUP="); j = t.index(";\n", i); cfg = json.loads(t[i:j])
alt0 = cfg.get("beispielName")
cfg.update(dict(neu, name=a.name, names=namen, zh=bool(a.zh)))
cfg.pop("roundFullAb", None)   # Stichtag gehoert zu Mia & Olivia; neue Gruppen: volle Runde nach 7 Uebungstagen
rest = t[j:]
alt = alt0   # Beispielsaetze: bei neuen Schuelern immer der eigene Name (Mike)
if alt: rest = rest.replace(alt, namen[0])
cfg["beispielName"] = namen[0] if alt else None
if a.vorlage == "mia-olivia":   # Beispielsaetze mit den eigenen Namen (Mike): Mia -> 1. Name, Olivia -> 2. Name (sonst bleibt Olivia als andere Person)
    # zur Laufzeit in ALLEN Karten (auch src/data und Kern), gleichzeitig, Chinesisch wird mitgetauscht
    m = {"Mia": namen[0]}
    if len(namen) > 1: m["Olivia"] = namen[1]
    elif namen[0] == "Olivia": m["Olivia"] = "Mia"   # einzige Schuelerin heisst Olivia: die andere Person heisst dann Mia
    cfg["nameMap"] = {k: v for k, v in m.items() if k != v}
    cfg.pop("nameSwap", None)   # neue Schueler sehen ihren eigenen Namen (Tausch gilt nur fuer Mia & Olivia)
kopf = "// ===== Steckbrief: %s (angelegt mit neue_gruppe.py, Vorlage %s) =====\n" % (a.name, a.vorlage)
t = kopf + t[t.index("\n") + 1:i] + json.dumps(cfg, ensure_ascii=False, indent=1) + rest
open(os.path.join(G, ordner + ".js"), "w", encoding="utf-8").write(t)
# 2) Seitenhuellen: Titel anpassen
esc = a.name.replace("&", "&amp;")
for suf in ["", "_lehrer"]:
    h = open(os.path.join(G, a.vorlage + suf + ".html"), encoding="utf-8").read()
    h = re.sub(r"<title>[^<]*</title>", "<title>Deutsch - %s%s</title>" % (esc, " - LEHRER" if suf else ""), h, 1)
    h = re.sub(r'(<meta name="apple-mobile-web-app-title" content=")[^"]*', r"\g<1>" + esc, h, 1)
    h = h.replace("bei Mia und Olivia", "bei " + " und ".join(namen).replace("&", "&amp;"))
    open(os.path.join(G, ordner + suf + ".html"), "w", encoding="utf-8").write(h)
# 3) feste Dateien des App-Ordners (Symbole, Offline-Speicher, App-Name)
quelle = os.path.join(REPO, "der-die-das" if a.vorlage == "kyana" else "mia-olivia"); ziel = os.path.join(REPO, ordner); os.makedirs(ziel)
for f in ["icon-180.png", "icon-192.png", "icon-512.png", "sw.js"]: shutil.copy(os.path.join(quelle, f), ziel)
m = json.load(open(os.path.join(quelle, "manifest.json"), encoding="utf-8")); m["name"] = "Deutsch - " + a.name; m["short_name"] = a.name[:12]
json.dump(m, open(os.path.join(ziel, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False)
print("Neue Gruppe '%s' angelegt: src/groups/%s.js (+ .html, _lehrer.html), Ordner %s/, Speicher %s, Knoepfe: %s, Chinesisch: %s"
      % (a.name, ordner, ordner, cfg["savePath"], ", ".join("Ich bin " + n for n in namen), "ja" if a.zh else "nein"))
print("Link nach dem Hochladen: https://deutschmitmike.github.io/quizzes/%s/" % ordner)
