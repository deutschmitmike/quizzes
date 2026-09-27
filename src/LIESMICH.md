# Gemeinsame App: ein Kern, ein Steckbrief pro Gruppe

- `engine.js` ist der gemeinsame Programmkern für alle Gruppen. Verbesserungen kommen **hierher**.
- `groups/<gruppe>.js` ist der Steckbrief: `GROUP` (Einstellungen) plus Inhalte (Sätze, Nomen, Stufen, Einführungstexte).
- `groups/<gruppe>.html` und `<gruppe>_lehrer.html` sind die Seitenhüllen (Aussehen, Texte). `%%SCRIPT%%` wird beim Bauen ersetzt.
- `lehrer.html` ist die gemeinsame Lehrer-Übersicht für alle Gruppen (-> `/lehrer/`).
- `BUILD` ist **eine** Versionsnummer für alle. Bei jedem Deploy hochzählen.

## Bauen
    python3 src/build.py
Das schreibt `der-die-das/`, `mia-olivia/` (index.html, index_lehrer.html, version.json) und `lehrer/index.html`.
**Nie** direkt in den erzeugten `index.html` ändern, das wird beim nächsten Bauen überschrieben.

## Neue Gruppe
Nicht von Hand kopieren, sondern: `python3 src/neue_gruppe.py --name Lena --vorlage kyana` (oder `--vorlage mia-olivia`, `--zh`, `--namen "A,B"`). Das legt Steckbrief, Seitenhüllen, App-Ordner und eindeutige Schlüssel/Pfade an und entfernt, was nur zu Mia & Olivia gehört (`nameSwap`, `roundFullAb`). `build.py` findet die Gruppe von selbst. Siehe `CLAUDE.md`.

## Schalter im Steckbrief (GROUP)
Weitere: zh (Chinesisch) · startNur/startTage (sanfter Start) · roundStart/roundFull/roundFullAb (Rundengröße) · nameSwap/nameMap/beispielName (Namen in Sätzen) · ohneKarten (einzelne Karten aus) · sound · topicGroups/topicWeights (Themenmischung) ·
mascot, critters (Bobby/Sammeltiere) · allOpen (alles gleichzeitig statt Stufen freischalten) · intros (Einführungsseiten) ·
typedRecall (sichere Karten tippen) · teenPron (Stufe 7–10 mit Alltagssätzen) · weekView (Wochenvergleich statt Rangliste) ·
names (feste Namensknöpfe) / allowSkip ("ohne Namen üben") · extraRounds (freiwillige Extrarunden) · roundStart/roundFull/roundStartDays ·
praise · adjDatPrep · cardWord · focusOpts (Themen für den Lehrer-Schwerpunkt)

## Tests
Laufen automatisch bei `python3 src/build.py` (`src/tests/run_all.js`): jede Karte, keine verschwundenen Karten gegenüber dem letzten Commit,
30 Tage Spielen, Fortsetzen abgebrochener Runden, Spielerwechsel. Effektivität: `node src/tests/sim_effekt.js <seite> [tage]`.

## Übungsdaten
`src/data/*.txt` (Verben, Präsens, Modalverben, Nebensätze, Komparativ, Satzbau, Pronomen, Reflexiv, Konjunktiv II, Relativsätze).
Format steht im Kopf der jeweiligen Stelle in `engine.js`. Zeilen ergänzen ist unkritisch; keine ` oder ${ verwenden.
Lückensätze (7. Feld = 4. Antwort, 8. Feld = weitere richtige Tipp-Antworten a;b) (`cloze`: Pronomen, Relativsätze …): `Satz mit {_}|Hinweis|richtig|falsch|falsch|Erklärung` und optional `|4. Antwort` (7. Feld). Die 4. Antwort darf nie einen richtigen Satz ergeben.
`src/data/zh_saetze.txt`: jeder feste Satz auf Chinesisch (`Deutscher Satz|中文`), wird nur in Gruppen mit `zh` eingebaut (build.py setzt `zh_*`-Daten je Gruppe ein). Neue oder geänderte Sätze brauchen eine neue Zeile; `node src/tests/run_all.js mia-olivia/index.html` zeigt fehlende.
